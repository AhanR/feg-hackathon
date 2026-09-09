<script setup lang="ts">
interface Bet {
  user: string
  game: string
  multiplier: number
  payout: number
}

const users = ['KrisH06', 'mulletegg_', 'Dane_92', 'Vesper', 'quietfox', 'A.Milanov', 'Tombaker88', 'nordlys', 'PetraWins', 'goldrush7']
const gameNames = [
  'Empire of Gold',
  'Royale 81',
  'Book of Storms',
  'Frosted Market Bonanza',
  'Sweet Salon',
  'Meow Meow Meow',
  'New Conquest',
]

const bets = ref<Bet[]>([
  { user: 'KrisH06', game: 'Empire of Gold', multiplier: 42.1, payout: 210.5 },
  { user: 'quietfox', game: 'Book of Storms', multiplier: 0.0, payout: 0 },
  { user: 'Vesper', game: 'Royale 81', multiplier: 2.31, payout: 11.55 },
  { user: 'nordlys', game: 'Frosted Market Bonanza', multiplier: 8.74, payout: 43.7 },
  { user: 'Tombaker88', game: 'Sweet Salon', multiplier: 0.0, payout: 0 },
  { user: 'goldrush7', game: 'Empire of Gold', multiplier: 128.4, payout: 642.0 },
])

function randomBet(): Bet {
  const bet = 1 + Math.floor(Math.random() * 40) / 4
  const roll = Math.random()
  const multiplier = roll < 0.55 ? 0 : Math.round((0.2 + Math.random() * 60) * 100) / 100
  return {
    user: users[Math.floor(Math.random() * users.length)],
    game: gameNames[Math.floor(Math.random() * gameNames.length)],
    multiplier,
    payout: Math.round(bet * multiplier * 100) / 100,
  }
}

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    bets.value = [randomBet(), ...bets.value.slice(0, 5)]
  }, 2600)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <section class="mt-7 rounded-lg border border-line bg-panel overflow-hidden">
    <div class="flex items-center gap-2.5 px-4 h-11 border-b border-line">
      <span class="relative flex w-2 h-2">
        <span class="absolute inline-flex w-full h-full rounded-full bg-accent opacity-60 animate-ping" />
        <span class="relative inline-flex w-2 h-2 rounded-full bg-accent" />
      </span>
      <h3 class="text-[11px] font-bold uppercase tracking-[0.16em] text-mute">Live bets</h3>
      <div class="flex-1" />
      <span class="text-[10px] font-semibold uppercase tracking-wider text-faint">Last 5 minutes</span>
    </div>

    <TransitionGroup name="betrow" tag="ul" class="divide-y divide-line">
      <li
        v-for="(b, i) in bets"
        :key="`${b.user}-${i}`"
        class="flex items-center gap-3 px-4 h-10 text-[12px]"
      >
        <span class="w-6 h-6 rounded-full bg-panel2 border border-line flex items-center justify-center text-[9px] font-bold text-mute shrink-0">
          {{ b.user.slice(0, 2).toUpperCase() }}
        </span>
        <span class="font-semibold text-mute w-24 truncate">{{ b.user }}</span>
        <span class="text-faint truncate hidden sm:block">{{ b.game }}</span>
        <div class="flex-1" />
        <span class="w-16 text-right font-bold tabular-nums" :class="b.multiplier >= 1 ? 'text-win' : 'text-loss'">
          {{ b.multiplier.toFixed(2) }}×
        </span>
        <span class="w-20 text-right font-semibold tabular-nums text-ink">
          €{{ b.payout.toFixed(2) }}
        </span>
      </li>
    </TransitionGroup>
  </section>
</template>

<style scoped>
.betrow-enter-active {
  transition: all 0.35s ease-out;
}
.betrow-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.betrow-leave-active {
  display: none;
}
</style>
