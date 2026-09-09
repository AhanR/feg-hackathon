<script setup lang="ts">
const tabs = ['Casino', 'Sports']
const activeTab = ref('Casino')
const balance = ref('€1,234.56')
</script>

<template>
  <header class="sticky top-0 z-40 h-16 flex items-center gap-3 px-4 lg:px-6 bg-panel border-b border-line">
    <!-- brand -->
    <NuxtLink to="/" class="flex items-center gap-2 mr-2">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="12" y="2.5" width="13.4" height="13.4" transform="rotate(45 12 2.5)" fill="var(--color-gold)" />
        <rect x="12" y="7.5" width="6.4" height="6.4" transform="rotate(45 12 7.5)" fill="var(--color-gold-deep)" />
      </svg>
      <span class="text-[17px] font-extrabold tracking-[0.14em] text-ink">EMPIRE</span>
    </NuxtLink>

    <!-- section tabs -->
    <nav class="hidden sm:flex items-center gap-1">
      <button
        v-for="t in tabs"
        :key="t"
        class="px-3.5 h-9 rounded text-[13px] font-semibold transition-colors"
        :class="activeTab === t ? 'bg-panel2 text-ink' : 'text-mute hover:text-ink'"
        @click="activeTab = t"
      >
        {{ t }}
      </button>
    </nav>

    <div class="flex-1" />

    <!-- search -->
    <label class="hidden md:flex items-center gap-2 w-60 h-9 px-3 rounded bg-panel2 border border-line text-mute">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="text"
        placeholder="Search games"
        class="bg-transparent text-[13px] text-ink placeholder:text-faint outline-none w-full"
      />
    </label>

    <!-- balance -->
    <button class="hidden sm:flex items-center gap-2 h-9 px-3 rounded bg-panel2 border border-line text-[13px] font-semibold text-ink">
      {{ balance }}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <button class="h-9 px-4 rounded bg-accent text-black text-[13px] font-bold hover:bg-accent-dim transition-colors">
      Wallet
    </button>

    <div class="w-8 h-8 rounded-full bg-panel2 border border-line flex items-center justify-center text-[11px] font-bold text-mute">
      AH
    </div>
  </header>
</template>
