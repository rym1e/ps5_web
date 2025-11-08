<template>
  <div :class="classes" class="rounded-md px-3 py-2 text-sm">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'info'
  }
});

const map = {
  info: 'bg-blue-50 text-blue-600 border border-blue-100',
  warning: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
  danger: 'bg-red-50 text-red-600 border border-red-100'
};

const classes = computed(() => map[props.variant] ?? map.info);
</script>
