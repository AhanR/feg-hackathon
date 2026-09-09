<script setup lang="ts">
const emit = defineEmits<{ (e: 'launch', id: string): void }>()

const { heroArt } = useGameCatalog()
const { public: { prefetchBase } } = useRuntimeConfig()

  const slides = [
    {
      id: 'empire-of-gold',
      eyebrow: 'SpinIQ Originals',
      title: 'EMPIRE OF GOLD',
      sub: 'Claim the throne. 5,000× max win. Multiplier collection in free spins.',
      cta: 'Play now',
      art: heroArt,
      dark: true,
      game: true,
    },
    {
      id: 'splash-2',
      eyebrow: 'Bonus',
      title: 'MAKE MONEY',
      sub: 'Unlock the second layer of the Empire. Every spin builds your stake.',
      cta: 'Explore',
      art: `/thumbnail/splash2.jpg`,
      dark: true,
      game: false,
    },
    {
      id: 'splash-3',
      eyebrow: 'Campaign',
      title: 'WIN MONEY',
      sub: 'The final vault opens. Your legacy is waiting inside.',
      cta: 'Discover',
      art: `/thumbnail/splash3.jpg`,
      dark: true,
      game: false,
    },
  ]

const current = ref(0)
const paused = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

function go(i: number) {
  current.value = (i + slides.length) % slides.length
}

onMounted(() => {
  timer = setInterval(() => {
    if (!paused.value) go(current.value + 1)
  }, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <section
    class="relative overflow-hidden rounded-lg border border-line bg-panel h-56 md:h-64"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
  >
    <div
      class="flex h-full transition-transform duration-500 ease-out"
      :style="{ transform: `translateX(-${current * 100}%)` }"
    >
      <div
        v-for="s in slides"
        :key="s.id"
        class="relative w-full h-full shrink-0"
      >
        <img
          v-if="s.art"
          :src="s.art"
          alt=""
          class="absolute inset-0 w-full h-full object-cover"
          :class="s.dark ? 'opacity-80' : 'opacity-25'"
        />
        <div class="absolute inset-0" :class="s.dark ? 'bg-gradient-to-r from-black/70 via-black/30 to-transparent' : 'bg-gradient-to-r from-panel via-panel/80 to-panel/40'" />

        <div class="relative h-full flex flex-col justify-center gap-2 px-6 md:px-10 max-w-xl">
          <span class="text-[10px] font-bold uppercase tracking-[0.2em]" :class="s.game ? 'text-gold' : 'text-faint'">
            {{ s.eyebrow }}
          </span>
          <h2 class="text-2xl md:text-4xl font-extrabold tracking-wide" :class="s.game ? 'text-gold' : 'text-ink'">
            {{ s.title }}
          </h2>
          <p class="text-[13px] text-mute leading-relaxed">{{ s.sub }}</p>
          <div class="pt-1">
            <button
              class="h-9 px-5 rounded text-[13px] font-bold transition-colors"
              :class="s.game ? 'bg-accent text-black hover:bg-accent-dim' : 'bg-panel2 text-ink hover:bg-panel3/40 border border-line'"
              @click="s.game ? emit('launch', s.id) : null"
            >
              {{ s.cta }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- arrows -->
    <button
      class="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded bg-black/40 border border-line text-ink flex items-center justify-center hover:bg-black/60 transition-colors"
      aria-label="Previous slide"
      @click="go(current - 1)"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 6-6 6 6 6" /></svg>
    </button>
    <button
      class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded bg-black/40 border border-line text-ink flex items-center justify-center hover:bg-black/60 transition-colors"
      aria-label="Next slide"
      @click="go(current + 1)"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 6 6 6-6 6" /></svg>
    </button>

    <!-- dots -->
    <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
      <button
        v-for="(s, i) in slides"
        :key="s.id"
        class="h-1.5 rounded-full transition-all"
        :class="i === current ? 'w-5 bg-accent' : 'w-1.5 bg-white/25 hover:bg-white/40'"
        :aria-label="`Go to slide ${i + 1}`"
        @click="go(i)"
      />
    </div>
  </section>
</template>
