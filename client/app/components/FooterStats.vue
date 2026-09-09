<script setup lang="ts">
const providers = [
  'Pragmatic Play',
  'Evolution',
  'Hacksaw Gaming',
  'Nolimit City',
  'Push Gaming',
  'Relax Gaming',
]

const betsToday = ref(1_284_902)
const playersOnline = ref(24_318)

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    betsToday.value += Math.floor(Math.random() * 40) + 8
    playersOnline.value += Math.floor(Math.random() * 21) - 10
  }, 2000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const links = [
  { title: 'Company', items: ['About us', 'Careers', 'Press', 'Affiliates'] },
  { title: 'Legal', items: ['Terms of service', 'Privacy policy', 'AML & KYC', 'Self-exclusion'] },
  { title: 'Help', items: ['Support', 'FAQ', 'Payment methods', 'Responsible gaming'] },
]
</script>

<template>
  <footer class="mt-10 border-t border-line bg-panel">
    <!-- live counters -->
    <div class="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-line">
      <div>
        <div class="text-[10px] font-bold uppercase tracking-[0.18em] text-faint mb-1">Bets placed today</div>
        <div class="text-xl font-extrabold tabular-nums text-ink">{{ betsToday.toLocaleString('en-US') }}</div>
      </div>
      <div>
        <div class="text-[10px] font-bold uppercase tracking-[0.18em] text-faint mb-1">Players online</div>
        <div class="text-xl font-extrabold tabular-nums text-ink flex items-center gap-2">
          {{ playersOnline.toLocaleString('en-US') }}
          <span class="w-1.5 h-1.5 rounded-full bg-accent" />
        </div>
      </div>
      <div>
        <div class="text-[10px] font-bold uppercase tracking-[0.18em] text-faint mb-1">Avg. payout time</div>
        <div class="text-xl font-extrabold tabular-nums text-ink">2m 14s</div>
      </div>
      <div>
        <div class="text-[10px] font-bold uppercase tracking-[0.18em] text-faint mb-1">Largest win 24h</div>
        <div class="text-xl font-extrabold tabular-nums text-gold">€48,120.00</div>
      </div>
    </div>

    <!-- links -->
    <div class="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-line">
      <div>
        <div class="flex items-center gap-2 mb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="12" y="2.5" width="13.4" height="13.4" transform="rotate(45 12 2.5)" fill="var(--color-gold)" />
          </svg>
          <span class="text-[14px] font-extrabold tracking-[0.14em] text-ink">EMPIRE</span>
        </div>
        <p class="text-[11px] text-faint leading-relaxed">
          Operating under licence. Play within your limits.
        </p>
      </div>
      <div v-for="col in links" :key="col.title">
        <div class="text-[10px] font-bold uppercase tracking-[0.18em] text-faint mb-3">{{ col.title }}</div>
        <ul class="space-y-2">
          <li v-for="l in col.items" :key="l">
            <a href="#" class="text-[12px] text-mute hover:text-ink transition-colors">{{ l }}</a>
          </li>
        </ul>
      </div>
    </div>

    <!-- providers + age -->
    <div class="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center gap-4">
      <div class="flex flex-wrap justify-center gap-x-5 gap-y-1">
        <span
          v-for="p in providers"
          :key="p"
          class="text-[10px] font-bold uppercase tracking-[0.14em] text-faint"
        >
          {{ p }}
        </span>
      </div>
      <div class="flex-1" />
      <span class="w-8 h-8 rounded-full border border-faint/40 text-faint text-[10px] font-extrabold flex items-center justify-center shrink-0">
        18+
      </span>
    </div>
  </footer>
</template>
