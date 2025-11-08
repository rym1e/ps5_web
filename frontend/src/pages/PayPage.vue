<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <section class="bg-white rounded-lg shadow-sm p-6 space-y-6" v-if="order">
      <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">完成支付</h1>
          <p class="text-sm text-gray-500">请使用下方二维码转账，并在备注中填写订单号。</p>
        </div>
        <Countdown :expire-at="order.expire_at" @expire="handleExpire" />
      </header>
      <div class="grid md:grid-cols-2 gap-6">
        <div class="space-y-3">
          <div class="bg-gray-50 rounded-md p-4 space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">订单号</span>
              <button class="text-xs text-brand-primary" @click="copyOrderNo">复制</button>
            </div>
            <p class="text-lg font-mono">{{ order.order_no }}</p>
          </div>
          <div class="bg-gray-50 rounded-md p-4 space-y-1">
            <span class="text-sm text-gray-500">应付金额</span>
            <p class="text-xl font-semibold text-brand-primary">¥ {{ (order.amount / 100).toFixed(2) }}</p>
          </div>
          <div class="bg-gray-50 rounded-md p-4 space-y-1">
            <span class="text-sm text-gray-500">预约时段</span>
            <p class="text-base">{{ formattedRange }}</p>
          </div>
        </div>
        <div class="flex flex-col items-center gap-3">
          <img :src="order.pay_qr_url" alt="支付二维码" class="w-64 h-64 object-contain border rounded-md" />
          <p class="text-xs text-gray-500">请在支付备注填写订单号：{{ order.order_no }}</p>
        </div>
      </div>
      <ProofUploader
        :files="previewFiles"
        @pick="handlePick"
        @remove="removeFile"
      >
        <template #actions>
          <div class="flex items-center gap-3">
            <input
              v-model="note"
              type="text"
              placeholder="可选：填写付款备注或流水号"
              class="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
            />
            <button
              class="px-4 py-2 rounded-md text-white bg-brand-primary disabled:opacity-50"
              :disabled="previewFiles.length === 0"
              @click="submitProof"
            >
              提交凭证
            </button>
          </div>
        </template>
      </ProofUploader>
    </section>
    <EmptyState v-else>未找到对应订单。</EmptyState>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Countdown from '../components/Countdown.vue';
import ProofUploader from '../components/ProofUploader.vue';
import EmptyState from '../components/EmptyState.vue';
import { useOrdersStore } from '../store/orders';
import { useAuthStore } from '../store/auth';
import { formatTimeRange } from '../utils/time';
import { useToast } from '../utils/toast';

const router = useRouter();
const route = useRoute();
const store = useOrdersStore();
const authStore = useAuthStore();
const toast = useToast();

const order = computed(() => store.currentOrder);
const note = ref('');
const previewFiles = ref([]);

const formattedRange = computed(() => (order.value ? formatTimeRange(order.value.start_time, order.value.end_time) : ''));

const handleExpire = () => {
  toast.warning('订单已过期，请重新预约。');
  router.replace({ name: 'Reservation' });
};

const copyOrderNo = async () => {
  if (!order.value) return;
  await navigator.clipboard.writeText(order.value.order_no);
  toast.success('订单号已复制');
};

const handlePick = async () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  input.onchange = () => {
    const files = Array.from(input.files ?? []);
    const next = [...previewFiles.value];
    files.forEach((file) => {
      if (next.length >= 3) return;
      if (file.size > 5 * 1024 * 1024) {
        toast.warning('单张图片不能超过 5MB');
        return;
      }
      next.push({ id: `${file.name}-${file.lastModified}`, file, preview: URL.createObjectURL(file) });
    });
    previewFiles.value = next;
  };
  input.click();
};

const removeFile = (id) => {
  previewFiles.value = previewFiles.value.filter((file) => file.id !== id);
};

const submitProof = async () => {
  if (!order.value) return;
  await store.submitProof(order.value.id, previewFiles.value.map((item) => item.file), note.value);
  previewFiles.value.forEach((item) => URL.revokeObjectURL(item.preview));
  previewFiles.value = [];
  note.value = '';
};

onMounted(async () => {
  await authStore.ensureLogin();
  await store.fetchDetail(route.params.orderId);
});
</script>
