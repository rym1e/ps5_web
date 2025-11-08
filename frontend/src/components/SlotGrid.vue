<template>
  <section class="bg-white rounded-lg shadow-sm p-4">
    <header class="flex items-center justify-between mb-4">
      <h2 class="text-base font-semibold">选择预约时段</h2>
      <p class="text-xs text-gray-500">展示未来 72 小时内的可预约整点</p>
    </header>
    <div class="grid gap-3 md:grid-cols-4">
      <button
        v-for="slot in slots"
        :key="slot.start_time"
        class="rounded-md border px-3 py-2 text-left transition-colors"
        :class="buttonClass(slot)"
        :disabled="!slot.available && !slot.mine"
        @click="toggle(slot)"
      >
        <div class="text-sm font-medium">{{ formatRange(slot) }}</div>
        <div class="text-xs" :class="statusClass(slot)">{{ statusLabel(slot) }}</div>
      </button>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  slots: { type: Array, required: true },
  modelValue: { type: String, default: '' }
});
const emit = defineEmits(['update:modelValue']);

const toggle = (slot) => {
  if (!slot.available && !slot.mine) return;
  emit('update:modelValue', props.modelValue === slot.start_time ? '' : slot.start_time);
};

const formatRange = (slot) => {
  const start = new Date(slot.start_time);
  const end = new Date(slot.end_time);
  const fmt = (d) => `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:00`;
  return `${fmt(start)} - ${end.getHours()}:00`;
};

const statusLabel = (slot) => {
  if (slot.mine) return '我的预约';
  return slot.available ? '可预约' : '已占用';
};

const statusClass = (slot) => {
  if (slot.mine) return 'text-brand-primary';
  return slot.available ? 'text-brand-success' : 'text-gray-400';
};

const buttonClass = (slot) => {
  const active = props.modelValue === slot.start_time;
  if (!slot.available && !slot.mine) return 'border-gray-200 text-gray-400 cursor-not-allowed';
  const base = 'border-gray-200 hover:border-brand-primary hover:text-brand-primary';
  return [
    active ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : base,
    slot.mine && !active ? 'border-brand-primary/70 text-brand-primary' : ''
  ];
};
</script>
