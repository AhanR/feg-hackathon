<script setup lang="ts">
import type { GameEntry } from '~/composables/useGameCatalog'

const props = defineProps<{ game: GameEntry | null }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { public: { gameBase } } = useRuntimeConfig()

const phase = ref<'idle' | 'confirm' | 'live' | 'soon'>('idle')
const iframeSrc = ref('')

watch(
  () => props.game,
  (g) => {
    if (!g) {
      phase.value = 'idle'
      iframeSrc.value = ''
      return
    }
    if (g.real) {
      // start the hidden warm-up load immediately
      iframeSrc.value = `${gameBase}/`
      phase.value = 'confirm'
    } else {
      phase.value = 'soon'
    }
  }
)

function confirmPlay() {
  phase.value = 'live'
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="game && phase !== 'idle'"
      class="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <div class="relative w-[min(960px,94vw)] h-[min(640px,84vh)] rounded-lg border border-line bg-panel overflow-hidden flex flex-col">
        <!-- chrome -->
        <div class="h-11 shrink-0 flex items-center gap-3 px-4 border-b border-line">
          <span class="text-[11px] font-bold uppercase tracking-[0.16em] text-mute">{{ game.name }}</span>
          <span v-if="phase === 'live'" class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-win">
            <span class="w-1.5 h-1.5 rounded-full bg-win" /> Live
          </span>
          <div class="flex-1" />
          <button
            class="w-7 h-7 rounded bg-panel2 border border-line text-mute hover:text-ink flex items-center justify-center transition-colors"
            aria-label="Close"
            @click="emit('close')"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <!-- body -->
        <div class="relative flex-1 min-h-0">
          <!-- real game: iframe loads immediately, revealed on confirm -->
          <iframe
            v-if="phase === 'confirm' || phase === 'live'"
            :src="iframeSrc"
            class="absolute inset-0 w-full h-full border-none"
            :class="phase === 'live' ? 'block' : 'invisible'"
            title="Empire of Gold"
          />

          <!-- confirm panel sits above the hidden iframe -->
          <div
            v-if="phase === 'confirm'"
            class="absolute inset-0 z-10 flex items-center justify-center bg-canvas/60 backdrop-blur-[2px]"
          >
            <div class="w-80 rounded-lg border border-line bg-panel p-6 text-center">
              <div class="text-[10px] font-bold uppercase tracking-[0.2em] text-faint mb-2">Ready to play</div>
              <h4 class="text-lg font-extrabold text-ink mb-1">{{ game.name }}</h4>
              <p class="text-[12px] text-mute mb-5">The table is being prepared in the background.</p>
              <button
                class="w-full h-10 rounded bg-accent text-black text-[13px] font-bold hover:bg-accent-dim transition-colors"
                @click="confirmPlay"
              >
                Yes, Play
              </button>
            </div>
          </div>

          <!-- placeholder games -->
          <div v-if="phase === 'soon'" class="absolute inset-0 flex items-center justify-center">
            <div class="w-80 rounded-lg border border-line bg-panel2 p-6 text-center">
              <div class="text-[10px] font-bold uppercase tracking-[0.2em] text-faint mb-2">Coming soon</div>
              <h4 class="text-lg font-extrabold text-ink mb-1">{{ game.name }}</h4>
              <p class="text-[12px] text-mute mb-5">This title is not part of the prefetch demo yet.</p>
              <button
                class="w-full h-10 rounded bg-panel border border-line text-ink text-[13px] font-bold hover:bg-panel3/30 transition-colors"
                @click="emit('close')"
              >
                Back to lobby
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
