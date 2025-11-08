<template>
  <div class="text-sm font-medium" :class="expired ? 'text-brand-danger' : 'text-brand-primary'">
    {{ display }}
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps({
  expireAt: { type: String, required: true }
});
const emit = defineEmits(['expire']);

const remaining = ref(0);
const expired = computed(() => remaining.value <= 0);
const display = computed(() => {
  if (expired.value) return '已过期';
  const totalSeconds = Math.floor(remaining.value / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `剩余 ${minutes}:${seconds}`;
});

let timer;

const update = () => {
  const target = new Date(props.expireAt).getTime();
  const now = Date.now();
  remaining.value = Math.max(target - now, 0);
  if (remaining.value === 0) {
    emit('expire');
    clearInterval(timer);
  }
};

onMounted(() => {
  update();
  timer = setInterval(update, 1000);
});

onBeforeUnmount(() => clearInterval(timer));
</script>
