import os
import mimetypes
import hashlib
from fastapi import FastAPI, Request, Response, Query
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware

try:
    import brotli
except ImportError:
    brotli = None

import gzip

app = FastAPI()

ROOT = os.path.dirname(os.path.abspath(__file__))
CACHE_DIR = os.path.join(ROOT, "cache")
os.makedirs(CACHE_DIR, exist_ok=True)

MIME_TYPES = {
    ".js": "application/javascript",
    ".css": "text/css",
    ".html": "text/html",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".txt": "text/plain",
    ".xml": "application/xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".atlas": "text/plain",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
}

COMPRESSIBLE = {
    ".js", ".css", ".html", ".json", ".svg", ".txt",
    ".xml", ".ico", ".woff", ".woff2", ".ttf", ".otf",
}

CACHE_CONTROL = {
    ".js": "public, max-age=31536000, immutable",
    ".css": "public, max-age=31536000, immutable",
    ".webp": "public, max-age=31536000, immutable",
    ".png": "public, max-age=31536000, immutable",
    ".jpg": "public, max-age=31536000, immutable",
    ".gif": "public, max-age=31536000, immutable",
    ".woff2": "public, max-age=31536000, immutable",
    ".woff": "public, max-age=31536000, immutable",
    ".json": "public, max-age=3600",
    ".html": "no-cache",
    ".atlas": "public, max-age=31536000, immutable",
}


def get_mime(path: str) -> str:
    ext = os.path.splitext(path)[1]
    return MIME_TYPES.get(ext, mimetypes.guess_type(path)[0] or "application/octet-stream")


def get_cache_control(path: str) -> str:
    ext = os.path.splitext(path)[1]
    return CACHE_CONTROL.get(ext, "public, max-age=3600")


def cache_path(rel: str, encoding: str) -> str:
    safe = rel.replace("/", "__").replace("\\", "__")
    return os.path.join(CACHE_DIR, f"{safe}.{encoding}")


def compress_brotli(data: bytes) -> bytes:
    if brotli is None:
        return b""
    return brotli.compress(data, quality=6)


def compress_gzip(data: bytes) -> bytes:
    return gzip.compress(data, compresslevel=6)


NO_COMPRESSION_CACHE_ROUTES = {"/prefetch-demo.html", "/prefetch.js"}


class CompressionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if path == "/":
            path = "/index.html"

        if path in NO_COMPRESSION_CACHE_ROUTES:
            response: Response = await call_next(request)
            response.headers["Cache-Control"] = "no-cache"
            response.headers["Timing-Allow-Origin"] = "*"
            return response

        ext = os.path.splitext(path)[1]
        accept = request.headers.get("accept-encoding", "")
        want_br = "br" in accept and brotli is not None
        want_gz = "gzip" in accept
        is_compressible = ext in COMPRESSIBLE

        if is_compressible and (want_br or want_gz):
            rel = path.lstrip("/")
            orig = os.path.join(ROOT, rel)

            if os.path.isfile(orig):
                mime = get_mime(path)
                cc = get_cache_control(path)
                headers = {
                    "Content-Type": mime,
                    "Cache-Control": cc,
                    "Vary": "Accept-Encoding",
                }

                if want_br:
                    cp = cache_path(rel, "br")
                    if os.path.isfile(cp):
                        data = open(cp, "rb").read()
                        headers["Content-Encoding"] = "br"
                        return Response(content=data, status_code=200, headers=headers)
                    else:
                        raw = open(orig, "rb").read()
                        compressed = compress_brotli(raw)
                        if compressed:
                            open(cp, "wb").write(compressed)
                            headers["Content-Encoding"] = "br"
                            return Response(content=compressed, status_code=200, headers=headers)

                if want_gz:
                    cp = cache_path(rel, "gz")
                    if os.path.isfile(cp):
                        data = open(cp, "rb").read()
                        headers["Content-Encoding"] = "gzip"
                        return Response(content=data, status_code=200, headers=headers)
                    else:
                        raw = open(orig, "rb").read()
                        compressed = compress_gzip(raw)
                        open(cp, "wb").write(compressed)
                        headers["Content-Encoding"] = "gzip"
                        return Response(content=compressed, status_code=200, headers=headers)

        response: Response = await call_next(request)
        response.headers["Timing-Allow-Origin"] = "*"
        for ext_key, directive in CACHE_CONTROL.items():
            if path.endswith(ext_key):
                response.headers["Cache-Control"] = directive
                break
        return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


IMAGE_EXTS = {".png", ".webp", ".jpg", ".gif"}
AUDIO_EXTS = {".ogg"}


def scan_assets(subdir: str, exts: set) -> list[str]:
    base = os.path.join(ROOT, subdir)
    if not os.path.isdir(base):
        return []
    return [
        f"{subdir}/{f}"
        for f in sorted(os.listdir(base))
        if os.path.splitext(f)[1].lower() in exts
    ]


def scan_assets_recursive(subdir: str, exts: set) -> list[str]:
    base = os.path.join(ROOT, subdir)
    if not os.path.isdir(base):
        return []
    results = []
    for dirpath, _, filenames in os.walk(base):
        for f in sorted(filenames):
            if os.path.splitext(f)[1].lower() in exts:
                rel = os.path.relpath(os.path.join(dirpath, f), ROOT)
                results.append(rel)
    return results


@app.get("/api/prefetch")
def prefetch_list(
    resolution: str = Query(default="@1x"),
    language: str = Query(default="en"),
):
    images = []
    images.extend(scan_assets_recursive(f"assets/spines/{resolution}", IMAGE_EXTS))
    images.extend(scan_assets_recursive(f"assets/images/{resolution}", IMAGE_EXTS))
    images.extend(scan_assets(f"assets/images/{resolution}/{language}", IMAGE_EXTS))
    images.extend(scan_assets("assets/payTableImages", IMAGE_EXTS))
    images.extend(scan_assets("assets/images", {".webp"}))

    audio = scan_assets("assets/sounds/ogg", AUDIO_EXTS)

    return {
        "images": images,
        "audio": audio,
        "total": len(images) + len(audio),
    }


@app.get("/api/prefetch/chunk")
def prefetch_chunk(
    index: int = Query(default=0),
    resolution: str = Query(default="@1x"),
    language: str = Query(default="en"),
):
    images = []
    images.extend(scan_assets_recursive(f"assets/spines/{resolution}", IMAGE_EXTS))
    images.extend(scan_assets_recursive(f"assets/images/{resolution}", IMAGE_EXTS))
    images.extend(scan_assets(f"assets/images/{resolution}/{language}", IMAGE_EXTS))
    images.extend(scan_assets("assets/payTableImages", IMAGE_EXTS))
    images.extend(scan_assets("assets/images", {".webp"}))

    audio = scan_assets("assets/sounds/ogg", AUDIO_EXTS)

    all_files = [{"path": p, "size": os.path.getsize(os.path.join(ROOT, p))} for p in images + audio]
    all_files.sort(key=lambda f: f["size"])

    total_size = sum(f["size"] for f in all_files)
    total_chunks = 6

    chunks = [[] for _ in range(total_chunks)]
    chunk_sizes = [0] * total_chunks

    for f in all_files:
        smallest_idx = min(range(total_chunks), key=lambda i: chunk_sizes[i])
        chunks[smallest_idx].append(f["path"])
        chunk_sizes[smallest_idx] += f["size"]

    if index < 0 or index >= total_chunks:
        return {
            "chunk": [],
            "chunkIndex": index,
            "totalChunks": total_chunks,
            "totalSize": total_size,
            "done": True,
        }

    return {
        "chunk": chunks[index],
        "chunkIndex": index,
        "totalChunks": total_chunks,
        "totalSize": total_size,
        "done": False,
    }


app.add_middleware(CompressionMiddleware)
app.mount("/", StaticFiles(directory=".", html=True), name="static")
