<script setup lang="ts">
import type { GameEntry } from '~/composables/useGameCatalog'

const { init, cancel, activeId } = usePrefetchLobby()
const { EMPIRE_OF_GOLD, topPicks, gamesRow } = useGameCatalog()

const launchedGame = ref<GameEntry | null>(null)
const eogCard = ref<{ rootEl: HTMLElement | null } | null>(null)

function captureEog(el: unknown, game: GameEntry) {
  if (game.id === EMPIRE_OF_GOLD.id) {
    eogCard.value = el as { rootEl: HTMLElement | null } | null
  }
}

onMounted(async () => {
  const el = eogCard.value?.rootEl ?? null
  await init(
    el ? [{ id: EMPIRE_OF_GOLD.id, el }] : [],
    {
      onTargetChange: (id) => console.log('[lobby] target:', id),
      onChunkLoaded: (id, i, total, stats) =>
        console.log(`[lobby] ${id} chunk ${i}/${total}: ${stats.hit} cached, ${stats.miss} fetched, ${stats.unknown} unknown`),
      onDone: (id) => console.log('[lobby] prefetch complete:', id),
      onError: (info) => console.error('[lobby] error:', info),
    }
  )
})

function onCardSelect(game: GameEntry) {
  cancel()
  launchedGame.value = game
}

useHead({
  title: 'EMPIRE — Casino Lobby',
})
</script>

<template>
  <div>
    <HeroCarousel @launch="onCardSelect(EMPIRE_OF_GOLD)" />

    <GameRow label="Top picks" :count="String(topPicks.length)">
      <GameCard
        v-for="g in topPicks"
        :key="g.id"
        :ref="(el) => captureEog(el, g)"
        :game="g"
        @select="onCardSelect"
      />
    </GameRow>

    <GameRow label="Games" :count="String(gamesRow.length)">
      <GameCard
        v-for="g in gamesRow"
        :key="g.id"
        :game="g"
        @select="onCardSelect"
      />
    </GameRow>

    <div class="mt-7 rounded-lg border border-line bg-panel px-4 h-11 flex items-center gap-2 text-[11px] text-faint">
      <span
        class="w-1.5 h-1.5 rounded-full"
        :class="activeId === EMPIRE_OF_GOLD.id ? 'bg-accent' : 'bg-faint/40'"
      />
      <span class="font-bold uppercase tracking-[0.16em] text-mute">Prefetch</span>
      <span v-if="activeId === EMPIRE_OF_GOLD.id">tracking — Empire of Gold</span>
      <span v-else>idle — hover a game card to warm its assets</span>
    </div>

    <LiveBetsTicker />

    <GameLaunchModal :game="launchedGame" @close="launchedGame = null" />
  </div>
</template>
