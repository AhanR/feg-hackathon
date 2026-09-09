<script setup lang="ts">
defineProps<{
  label: string
  count?: string
}>()
</script>

<template>
  <section class="mt-7">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2.5">
        <h3 class="text-[11px] font-bold uppercase tracking-[0.16em] text-mute">{{ label }}</h3>
        <span v-if="count" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-panel2 text-faint">{{ count }}</span>
      </div>
      <a href="#" class="text-[11px] font-bold uppercase tracking-[0.16em] text-faint hover:text-ink transition-colors flex items-center gap-1">
        View all
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 6 6 6-6 6" /></svg>
      </a>
    </div>
    <div class="flex gap-3 overflow-x-auto scroll-row pb-2 -mb-2">
      <slot />
    </div>
  </section>
</template>
