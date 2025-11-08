<template>
  <header class="bg-white shadow-sm">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <RouterLink to="/" class="text-lg font-semibold text-brand-primary">
        PS5 预约系统
      </RouterLink>
      <nav class="flex items-center gap-4 text-sm">
        <RouterLink to="/" class="hover:text-brand-primary">预约</RouterLink>
        <RouterLink to="/orders" class="hover:text-brand-primary">我的订单</RouterLink>
      </nav>
    </div>
  </header>
</template>
