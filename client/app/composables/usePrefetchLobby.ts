import { ref, onUnmounted } from 'vue'

export interface PrefetchTarget {
  id: string
  el: HTMLElement | null
  rect?: { left: number; top: number; right: number; bottom: number; width: number; height: number }
}

export interface LobbyStats {
  hit: number
  miss: number
  unknown: number
}

export interface LobbyController {
  start(): void
  cancel(): void
  onMouseMove(e: MouseEvent): void
  getActiveTarget(): string | null
}

export interface LobbyHandlers {
  onTargetChange?: (id: string | null) => void
  onChunkLoaded?: (id: string, index: number, total: number, stats: LobbyStats) => void
  onDone?: (id: string) => void
  onError?: (info: { id: string | null; url: string | null; error: unknown }) => void
}

interface LobbyOptions extends LobbyHandlers {
  baseUrl: string
  targets: PrefetchTarget[]
  chunks?: number
  threshold?: number
  inertiaFactor?: number
  pollMs?: number
  concurrency?: number
}

declare global {
  interface Window {
    prefetchLobby?: (o: LobbyOptions) => LobbyController
  }
}

let loadPromise: Promise<void> | null = null

function loadPrefetchLib(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.prefetchLobby) return Promise.resolve()
  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = '/prefetch.js'
      s.onload = () => resolve()
      s.onerror = () => reject(new Error('Failed to load /prefetch.js'))
      document.head.appendChild(s)
    })
  }
  return loadPromise
}

/**
 * Typed facade over window.prefetchLobby (public/prefetch.js).
 * One global mouse tracker for the whole lobby; call init() on mount
 * with the card elements that should act as prefetch targets.
 */
export function usePrefetchLobby() {
  const { public: { prefetchBase } } = useRuntimeConfig()
  const activeId = ref<string | null>(null)
  let controller: LobbyController | null = null

  async function init(targets: PrefetchTarget[], handlers: LobbyHandlers = {}) {
    await loadPrefetchLib()
    if (!window.prefetchLobby || controller) return

    controller = window.prefetchLobby({
      baseUrl: prefetchBase,
      targets,
      chunks: 6,
      threshold: 20,
      inertiaFactor: 0.05,
      pollMs: 300,
      concurrency: 6,
      ...handlers,
      onTargetChange: (id) => {
        activeId.value = id
        handlers.onTargetChange?.(id)
      },
    })
    document.addEventListener('mousemove', controller.onMouseMove)
    controller.start()
  }

  function cancel() {
    if (!controller) return
    document.removeEventListener('mousemove', controller.onMouseMove)
    controller.cancel()
    controller = null
  }

  onUnmounted(cancel)

  return { init, cancel, activeId }
}
