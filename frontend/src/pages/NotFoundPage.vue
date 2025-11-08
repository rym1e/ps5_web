<template>
  <EmptyState>
    <p class="text-base">页面不存在</p>
    <RouterLink to="/" class="text-brand-primary">返回首页</RouterLink>
  </EmptyState>
</template>

<script setup>
import EmptyState from '../components/EmptyState.vue';
</script>
