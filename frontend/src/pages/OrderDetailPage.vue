<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <section v-if="order" class="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <header class="space-y-1">
        <h1 class="text-2xl font-semibold">订单详情</h1>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500">订单号：{{ order.order_no }}</span>
          <StatusTag :status="order.status">{{ statusText(order.status) }}</StatusTag>
        </div>
      </header>
      <section class="space-y-2">
        <h2 class="text-base font-semibold">预约信息</h2>
        <p class="text-sm text-gray-500">预约时段：{{ formatTimeRange(order.start_time, order.end_time) }}</p>
        <p class="text-sm text-gray-500">创建时间：{{ formatDate(order.created_at) }}</p>
      </section>
      <section class="space-y-2">
        <h2 class="text-base font-semibold">支付信息</h2>
        <p class="text-sm text-gray-500">应付金额：¥ {{ (order.amount / 100).toFixed(2) }}</p>
        <p class="text-sm text-gray-500">状态更新时间：{{ formatDate(order.updated_at) }}</p>
      </section>
      <section class="space-y-2">
        <h2 class="text-base font-semibold">凭证</h2>
        <div v-if="order.proofs?.length" class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <img v-for="proof in order.proofs" :key="proof.image_url" :src="proof.image_url" class="w-full h-40 object-cover rounded-md border" />
        </div>
        <EmptyState v-else>暂未上传支付凭证</EmptyState>
      </section>
      <div class="flex items-center gap-3">
        <RouterLink v-if="order.status === 'pending'" :to="{ name: 'Pay', params: { orderId: order.id } }" class="px-3 py-2 text-sm text-white bg-brand-primary rounded-md">
          去支付
        </RouterLink>
        <RouterLink v-if="order.status === 'proof_submitted'" :to="{ name: 'Pay', params: { orderId: order.id } }" class="px-3 py-2 text-sm text-white bg-brand-primary rounded-md">
          追加凭证
        </RouterLink>
      </div>
    </section>
    <EmptyState v-else>未找到该订单。</EmptyState>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useOrdersStore } from '../store/orders';
import { useAuthStore } from '../store/auth';
import StatusTag from '../components/StatusTag.vue';
import EmptyState from '../components/EmptyState.vue';
import { formatTimeRange, formatDate } from '../utils/time';

const route = useRoute();
const store = useOrdersStore();
const authStore = useAuthStore();

const order = computed(() => store.currentOrder);

const statusMap = {
  pending: '待支付',
  proof_submitted: '待核验',
  paid: '已确认',
  rejected: '已驳回',
  expired: '已过期',
  cancelled: '已取消'
};

const statusText = (status) => statusMap[status] ?? status;

onMounted(async () => {
  await authStore.ensureLogin();
  await store.fetchDetail(route.params.orderId);
});
</script>
