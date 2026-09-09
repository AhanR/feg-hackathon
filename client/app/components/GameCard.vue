<script setup lang="ts">
import type { GameEntry } from '~/composables/useGameCatalog'

const props = defineProps<{ game: GameEntry }>()
const emit = defineEmits<{ (e: 'select', game: GameEntry): void }>()

const rootEl = ref<HTMLElement | null>(null)
defineExpose({ rootEl })

const monogram = computed(() => props.game.name.charAt(0))
</script>

<template>
  <button
    ref="rootEl"
    class="relative shrink-0 w-36 md:w-40 aspect-[3/4] rounded-lg overflow-hidden bg-panel2 border border-line text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    @click="emit('select', game)"
  >
    <img
      v-if="game.icon"
      :src="game.icon"
      :alt="game.name"
      loading="lazy"
      class="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
    />
    <div
      v-else
      class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-panel2 to-panel"
    >
      <span class="text-4xl font-extrabold text-panel3">{{ monogram }}</span>
    </div>

    <!-- hover overlay -->
    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
      <span class="w-10 h-10 rounded-full bg-accent text-black flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5.5v13l11-6.5Z" />
        </svg>
      </span>
    </div>

    <!-- badges -->
    <span
      v-if="game.real"
      class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider text-black bg-gold"
    >
      Hot
    </span>
    <span
      v-else
      class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider text-mute bg-black/50"
    >
      Soon
    </span>

    <!-- name strip -->
    <div class="absolute inset-x-0 bottom-0 px-2 py-1.5 bg-gradient-to-t from-black/80 to-transparent">
      <span class="text-[11px] font-semibold text-ink truncate block">{{ game.name }}</span>
    </div>
  </button>
</template>
