<template>
  <section class="space-y-3">
    <header class="flex items-center justify-between">
      <h3 class="text-sm font-semibold">支付凭证</h3>
      <span class="text-xs text-gray-500">最多 3 张，单张不超过 5MB</span>
    </header>
    <div class="flex flex-wrap gap-3">
      <div
        v-for="file in files"
        :key="file.id"
        class="relative w-28 h-28 rounded-md overflow-hidden border border-gray-200"
      >
        <img :src="file.preview" alt="支付凭证" class="w-full h-full object-cover" />
        <button
          class="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
          @click="$emit('remove', file.id)"
        >
          ×
        </button>
      </div>
      <button
        v-if="files.length < limit"
        class="w-28 h-28 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-xs text-gray-500 hover:border-brand-primary hover:text-brand-primary"
        @click="$emit('pick')"
      >
        <span class="text-2xl">＋</span>
        上传凭证
      </button>
    </div>
    <slot name="actions" />
  </section>
</template>

<script setup>
defineProps({
  files: {
    type: Array,
    default: () => []
  },
  limit: {
    type: Number,
    default: 3
  }
});
</script>
