<template>
  <footer class="bg-white border-t">
    <div class="max-w-6xl mx-auto px-4 py-6 text-xs text-gray-500 flex flex-col gap-1">
      <p>© {{ year }} PS5 预约系统. 保留所有权利。</p>
      <p>提示：本系统使用个人收款二维码，需人工核验支付凭证。</p>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear();
</script>
