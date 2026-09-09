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

  /**
   * prefetchLobby — global mouse tracker for a lobby of game cards.
   * One interval, one mousemove listener, one game downloading at a time.
   * The nearest card (rect expanded by `threshold`) containing the
   * inertia-adjusted target point wins; sticky on ties.
   *
   *   const lobby = prefetchLobby({
   *     baseUrl: "http://localhost:8000",
   *     targets: [{ id: "empire-of-gold", el: cardEl }, ...], // el optional (fallback rect)
   *     chunks: 6, threshold: 20, inertiaFactor: 0.05, pollMs: 300, concurrency: 6,
   *     onTargetChange: (id | null) => {},
   *     onChunkLoaded: (id, index, total, stats) => {},
   *     onDone: (id) => {},
   *     onError: (info) => {},
   *   });
   *
   *   lobby.start(); lobby.cancel();
   */
  function prefetchLobby(options) {
    var opts = options || {};
    var baseUrl = opts.baseUrl || "";
    var targets = opts.targets || [];
    var chunks = opts.chunks || 6;
    var threshold = opts.threshold || 20;
    var inertiaFactor = opts.inertiaFactor || 0.05;
    var pollMs = opts.pollMs || 300;
    var concurrency = opts.concurrency || 6;
    var onTargetChange = opts.onTargetChange || function () {};
    var onChunkLoaded = opts.onChunkLoaded || function () {};
    var onDone = opts.onDone || function () {};
    var onError = opts.onError || function () {};

    var intervalId = null;
    var lastX = null;
    var lastY = null;
    var dX = 0;
    var dY = 0;
    var cancelled = false;
    var activeId = null;
    var downloading = false;
    var downloadToken = 0;
    var cursors = {}; // id -> { index, done }
    var abortControllers = [];

    function loadChunk(gameId, index) {
      return fetch(baseUrl + "/api/prefetch/chunk?index=" + index + "&game=" + encodeURIComponent(gameId)).then(function (res) {
        return res.json();
      });
    }

    function fetchFile(gameId, relPath, ac) {
      return fetch(baseUrl + "/" + relPath, { cache: "force-cache", signal: ac.signal }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.arrayBuffer();
      });
    }

    function abortAll() {
      for (var i = 0; i < abortControllers.length; i++) {
        try { abortControllers[i].abort(); } catch (e) {}
      }
      abortControllers = [];
    }

    function runPool(items, worker, limit, token) {
      var queue = items.slice();
      var inFlight = 0;
      var results = new Array(items.length);

      function settle() {
        if (token !== downloadToken) return;
        if (inFlight === 0 && queue.length === 0) return;
        while (inFlight < limit && queue.length > 0) {
          (function (idx) {
            var item = queue.shift();
            inFlight++;
            worker(item).then(function (r) {
              if (token !== downloadToken) return;
              results[idx] = r;
              inFlight--;
              settle();
            }).catch(function (err) {
              if (token !== downloadToken) return;
              results[idx] = "miss";
              inFlight--;
              onError({ id: null, url: item, error: err });
              settle();
            });
          })(items.length - queue.length - 1);
        }
      }

      return new Promise(function (resolve) {
        function done() {
          if (inFlight === 0 && queue.length === 0) resolve(results);
        }
        var origSettle = settle;
        settle = function () {
          origSettle();
          done();
        };
        settle();
      });
    }

    function downloadChunk(target) {
      var token = ++downloadToken;
      downloading = true;
      var cursor = cursors[target.id] || (cursors[target.id] = { index: 0, done: false });

      loadChunk(target.id, cursor.index)
        .then(function (data) {
          if (token !== downloadToken || cancelled) return;
          var files = data.chunk || [];
          if (data.done || files.length === 0) {
            cursor.done = true;
            onDone(target.id);
            return;
          }
          var stats = { hit: 0, miss: 0, unknown: 0 };
          return runPool(
            files,
            function (relPath) {
              var ac = new AbortController();
              abortControllers.push(ac);
              return fetchFile(target.id, relPath, ac).then(function () {
                var s = classifyCache(baseUrl + "/" + relPath);
                if (s === "hit") stats.hit++;
                else if (s === "miss") stats.miss++;
                else stats.unknown++;
                return s;
              });
            },
            concurrency,
            token
          ).then(function () {
            if (token !== downloadToken || cancelled) return;
            cursor.index = (typeof data.chunkIndex === "number" ? data.chunkIndex : cursor.index) + 1;
            onChunkLoaded(target.id, data.chunkIndex, chunks, stats);
          });
        })
        .catch(function (err) {
          if (token !== downloadToken || cancelled) return;
          onError({ id: target.id, url: null, error: err });
        })
        .then(function () {
          if (token === downloadToken) downloading = false;
        });
    }

    function rectOf(t) {
      if (t.el && typeof t.el.getBoundingClientRect === "function") {
        return t.el.getBoundingClientRect();
      }
      if (t.rect) return t.rect;
      return null;
    }

    function isNear(t, x, y) {
      var r = rectOf(t);
      if (!r) return false;
      return x >= r.left - threshold && x <= r.right + threshold && y >= r.top - threshold && y <= r.bottom + threshold;
    }

    function centerDist(t, x, y) {
      var r = rectOf(t);
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      return Math.sqrt((cx - x) * (cx - x) + (cy - y) * (cy - y));
    }

    function pickTarget(x, y) {
      var best = null;
      var bestDist = Infinity;
      for (var i = 0; i < targets.length; i++) {
        var t = targets[i];
        if (!isNear(t, x, y)) continue;
        var d = centerDist(t, x, y);
        if (t.id === activeId) d -= 0.5; // sticky on ties
        if (d < bestDist) {
          bestDist = d;
          best = t;
        }
      }
      return best;
    }

    function tick() {
      if (cancelled || lastX === null) return;
      var tx = lastX + inertiaFactor * dX;
      var ty = lastY + inertiaFactor * dY;
      var best = pickTarget(tx, ty);
      var bestId = best ? best.id : null;

      if (bestId !== activeId) {
        downloadToken++; // invalidate any in-flight chain
        abortAll();
        downloading = false;
        activeId = bestId;
        onTargetChange(bestId);
      }

      if (!best || cancelled) return;
      var cursor = cursors[best.id];
      if (!downloading && (!cursor || !cursor.done)) {
        downloadChunk(best);
      }
    }

    function start() {
      if (intervalId !== null) return;
      intervalId = setInterval(tick, pollMs);
    }

    function cancel() {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      downloadToken++;
      abortAll();
      cancelled = true;
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
      getActiveTarget: function () { return activeId; },
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { prefetchGame: prefetchGame, prefetchLobby: prefetchLobby };
  } else {
    root.prefetchGame = prefetchGame;
    root.prefetchLobby = prefetchLobby;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
