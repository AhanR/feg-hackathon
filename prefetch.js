/**
 * prefetch.js — Asset pre-fetch library with mouse tracking
 *
 * Usage:
 *   const game = prefetchGame({
 *     thumbnailEl: document.getElementById("thumbnail"), // preferred
 *     thumbnail: { x: 300, y: 300, width: 600, height: 600 }, // fallback
 *     baseUrl: "http://localhost:8000",
 *     chunks: 6,
 *     threshold: 20,        // px margin beyond the thumbnail edges
 *     inertiaFactor: 0.05,
 *     onChunkLoaded: (index, total) => {},
 *     onGameReady: () => {},
 *     onDone: () => {},
 *     onError: (info) => {},
 *   });
 *
 *   game.start();   // start mouse tracking + chunk download
 *   game.cancel();  // stop tracking
 */
(function (root) {
  "use strict";

  function loadChunk(baseUrl, index) {
    return fetch(baseUrl + "/api/prefetch/chunk?index=" + index).then(function (res) {
      return res.json();
    });
  }

  function classifyCache(url) {
    try {
      var e = performance.getEntriesByName(url).pop();
      if (e && typeof e.transferSize === "number") {
        return e.transferSize === 0 ? "hit" : "miss";
      }
    } catch (err) {}
    return "unknown";
  }

  function fetchFile(baseUrl, relPath) {
    var url = baseUrl + "/" + relPath;
    return fetch(url, { cache: "force-cache" }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.arrayBuffer();
    }).then(function () {
      return classifyCache(url);
    });
  }

  function prefetchGame(options) {
    var opts = options || {};
    var baseUrl = opts.baseUrl || "";
    var thumbnailEl = opts.thumbnailEl || null;
    var thumbnail = opts.thumbnail || { x: 0, y: 0, width: 600, height: 600 };
    var chunks = opts.chunks || 6;
    var threshold = opts.threshold || 20;
    var inertiaFactor = opts.inertiaFactor || 0.05;
    var onChunkLoaded = opts.onChunkLoaded || function () {};
    var onGameReady = opts.onGameReady || function () {};
    var onDone = opts.onDone || function () {};
    var onError = opts.onError || function () {};

    var intervalId = null;
    var lastX = null;
    var lastY = null;
    var dX = 0;
    var dY = 0;
    var cancelled = false;
    var downloading = false;
    var currentChunkIndex = 0;
    var done = false;

    function getThumbRect() {
      if (thumbnailEl && typeof thumbnailEl.getBoundingClientRect === "function") {
        return thumbnailEl.getBoundingClientRect();
      }
      return { left: thumbnail.x, top: thumbnail.y, right: thumbnail.x + thumbnail.width, bottom: thumbnail.y + thumbnail.height };
    }

    function isNear(x, y) {
      var r = getThumbRect();
      return x >= r.left - threshold && x <= r.right + threshold && y >= r.top - threshold && y <= r.bottom + threshold;
    }

    function downloadChunk(index) {
      if (cancelled || downloading || done) return;
      downloading = true;

      loadChunk(baseUrl, index)
        .then(function (data) {
          if (cancelled) {
            downloading = false;
            return;
          }

          var chunkFiles = data.chunk || [];

          if (data.done || chunkFiles.length === 0) {
            done = true;
            downloading = false;
            onDone();
            return;
          }

          var promises = chunkFiles.map(function (url) {
            return fetchFile(baseUrl, url).catch(function (err) {
              onError({ url: url, error: err });
              return "miss";
            });
          });

          return Promise.allSettled(promises).then(function (results) {
            var stats = { hit: 0, miss: 0, unknown: 0 };
            results.forEach(function (r) {
              if (r.status === "fulfilled") {
                stats[r.value] = (stats[r.value] || 0) + 1;
              } else {
                stats.miss++;
              }
            });
            currentChunkIndex = data.chunkIndex + 1;
            return stats;
          });
        })
        .then(function (stats) {
          downloading = false;
          if (!cancelled) {
            onChunkLoaded(currentChunkIndex, chunks, stats);
          }
        })
        .catch(function (err) {
          downloading = false;
          onError({ url: null, error: err });
        });
    }

    function checkMouse(mouseX, mouseY) {
      if (mouseX === null || mouseY === null) return;
      if (!isNear(mouseX, mouseY)) return;

      var targetX = mouseX + inertiaFactor * dX;
      var targetY = mouseY + inertiaFactor * dY;

      if (!isNear(targetX, targetY)) return;

      if (!done) {
        downloadChunk(currentChunkIndex);
      }
    }

    function tick() {
      if (cancelled) return;
      checkMouse(lastX, lastY);
    }

    function start() {
      if (intervalId !== null) return;
      intervalId = setInterval(tick, 300);
    }

    function cancel() {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      cancelled = true;
      onGameReady();
    }

    function onMouseMove(e) {
      if (cancelled) return;
      var nowX = e.clientX;
      var nowY = e.clientY;
      if (lastX !== null) {
        dX = nowX - lastX;
        dY = nowY - lastY;
      }
      lastX = nowX;
      lastY = nowY;
    }

    return {
      start: start,
      cancel: cancel,
      onMouseMove: onMouseMove,
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = prefetchGame;
  } else {
    root.prefetchGame = prefetchGame;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
