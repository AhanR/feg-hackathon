<template>
  <div class="min-h-screen flex flex-col bg-canvas">
    <TopNav />
    <div class="flex flex-1 min-h-0">
      <SideNav class="hidden lg:flex" />
      <main class="flex-1 min-w-0 px-4 py-5 lg:px-6">
        <slot />
      </main>
    </div>
    <FooterStats />
  </div>
</template>
