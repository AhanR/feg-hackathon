<script setup lang="ts">
const items = [
  { label: 'Casino', active: true, icon: 'diamond' },
  { label: 'Sports', active: false, icon: 'ball' },
  { label: 'Promotions', active: false, icon: 'gift' },
  { label: 'Tournaments', active: false, icon: 'trophy' },
  { label: 'VIP Club', active: false, icon: 'crown' },
]

const secondary = [
  { label: 'Blog', icon: 'doc' },
  { label: 'Affiliate', icon: 'users' },
  { label: 'Support', icon: 'help' },
]
</script>

<template>
  <aside class="flex-col w-56 shrink-0 border-r border-line bg-panel px-2 py-4 overflow-y-auto">
    <nav class="flex flex-col gap-0.5">
      <a
        v-for="it in items"
        :key="it.label"
        href="#"
        class="flex items-center gap-3 px-3 h-10 rounded text-[13px] font-semibold transition-colors"
        :class="it.active ? 'bg-panel2 text-ink' : 'text-mute hover:text-ink hover:bg-panel2/60'"
      >
        <svg v-if="it.icon === 'diamond'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" />
        </svg>
        <svg v-else-if="it.icon === 'ball'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v18M3 12h18" />
        </svg>
        <svg v-else-if="it.icon === 'gift'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <rect x="3.5" y="8" width="17" height="4" />
          <rect x="5" y="12" width="14" height="8.5" />
          <path d="M12 8v12.5M12 8s-4.5.2-4.5-2.7C7.5 3.5 10 3 11 4.2c.9 1.1 1 3.8 1 3.8Zm0 0s4.5.2 4.5-2.7C16.5 3.5 14 3 13 4.2c-.9 1.1-1 3.8-1 3.8Z" />
        </svg>
        <svg v-else-if="it.icon === 'trophy'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M8 4h8v6a4 4 0 0 1-8 0Z" />
          <path d="M8 5H4.5v1.5A3.5 3.5 0 0 0 8 10M16 5h3.5v1.5A3.5 3.5 0 0 1 16 10M12 14v4m-4 3h8" />
        </svg>
        <svg v-else-if="it.icon === 'crown'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M4 8.5 8.5 12 12 6.5 15.5 12 20 8.5V18H4Z" />
        </svg>
        {{ it.label }}
      </a>
    </nav>

    <div class="my-4 border-t border-line" />

    <nav class="flex flex-col gap-0.5">
      <a
        v-for="it in secondary"
        :key="it.label"
        href="#"
        class="flex items-center gap-3 px-3 h-10 rounded text-[13px] font-semibold text-mute hover:text-ink hover:bg-panel2/60 transition-colors"
      >
        <svg v-if="it.icon === 'doc'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
          <path d="M8.5 8h7m-7 4h7m-7 4h4.5" />
        </svg>
        <svg v-else-if="it.icon === 'users'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <circle cx="9" cy="8.5" r="3.2" />
          <path d="M3.5 20c.5-3.5 2.7-5.5 5.5-5.5s5 2 5.5 5.5M16 5.6a3.2 3.2 0 0 1 0 5.8M17.5 14.7c1.7.8 2.7 2.6 3 5.3" />
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M9.6 9.2A2.6 2.6 0 0 1 14.5 10c0 1.8-2.5 2-2.5 3.6M12 17h.01" />
        </svg>
        {{ it.label }}
      </a>
    </nav>

    <div class="mt-auto pt-6">
      <div class="flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-faint">
        <span class="w-1.5 h-1.5 rounded-full bg-accent" />
        All systems live
      </div>
    </div>
  </aside>
</template>
