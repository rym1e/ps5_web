<template>
  <transition name="fade">
    <div
      v-if="toast.state.visible"
      class="fixed top-5 right-5 z-50 rounded-md px-4 py-2 text-white shadow-lg"
      :class="variantClass"
    >
      {{ toast.state.message }}
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';
import { useToast } from '../../utils/toast';

const toast = useToast();

const map = {
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  info: 'bg-gray-700'
};

const variantClass = computed(() => map[toast.state.type] ?? map.info);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
