<template>
  <span :class="classes" class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium">
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true
  }
});

const colorMap = {
  pending: 'bg-yellow-100 text-yellow-700',
  proof_submitted: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
  expired: 'bg-gray-100 text-gray-400'
};

const classes = computed(() => colorMap[props.status] ?? 'bg-gray-100 text-gray-500');
</script>
