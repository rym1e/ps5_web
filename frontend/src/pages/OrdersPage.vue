<template>
  <div class="max-w-5xl mx-auto px-4 py-8 space-y-6">
    <section class="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">我的订单</h1>
          <p class="text-sm text-gray-500">查看预约状态、上传凭证或取消待支付的订单。</p>
        </div>
        <select
          v-model="statusFilter"
          class="px-3 py-2 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
        >
          <option value="all">全部状态</option>
          <option value="pending">待支付</option>
          <option value="proof_submitted">待核验</option>
          <option value="paid">已确认</option>
          <option value="rejected">已驳回</option>
          <option value="expired">已过期</option>
          <option value="cancelled">已取消</option>
        </select>
      </header>
      <div class="space-y-4">
        <article
          v-for="item in filteredOrders"
          :key="item.id"
          class="border border-gray-100 rounded-lg p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <h2 class="text-base font-semibold">订单号：{{ item.order_no }}</h2>
              <StatusTag :status="item.status">{{ statusText(item.status) }}</StatusTag>
            </div>
            <p class="text-sm text-gray-500">预约时段：{{ formatTimeRange(item.start_time, item.end_time) }}</p>
            <p class="text-sm text-gray-500">金额：¥ {{ (item.amount / 100).toFixed(2) }}</p>
          </div>
          <div class="flex items-center gap-3">
            <RouterLink
              :to="{ name: 'OrderDetail', params: { orderId: item.id } }"
              class="text-sm text-brand-primary hover:underline"
            >
              查看详情
            </RouterLink>
            <button
              v-if="item.status === 'pending'"
              class="px-3 py-2 text-sm border border-gray-200 rounded-md hover:border-brand-danger hover:text-brand-danger"
              @click="cancel(item.id)"
            >
              取消
            </button>
            <RouterLink
              v-if="item.status === 'pending'"
              :to="{ name: 'Pay', params: { orderId: item.id } }"
              class="px-3 py-2 text-sm text-white bg-brand-primary rounded-md"
            >
              去支付
            </RouterLink>
            <RouterLink
              v-if="item.status === 'proof_submitted'"
              :to="{ name: 'Pay', params: { orderId: item.id } }"
              class="px-3 py-2 text-sm text-white bg-brand-primary rounded-md"
            >
              追加凭证
            </RouterLink>
          </div>
        </article>
        <EmptyState v-if="!filteredOrders.length">暂无订单记录</EmptyState>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useOrdersStore } from '../store/orders';
import { useAuthStore } from '../store/auth';
import StatusTag from '../components/StatusTag.vue';
import EmptyState from '../components/EmptyState.vue';
import { formatTimeRange } from '../utils/time';

const store = useOrdersStore();
const authStore = useAuthStore();
const statusFilter = ref('all');

const filteredOrders = computed(() => {
  if (statusFilter.value === 'all') return store.orders;
  return store.orders.filter((item) => item.status === statusFilter.value);
});

const statusMap = {
  pending: '待支付',
  proof_submitted: '待核验',
  paid: '已确认',
  rejected: '已驳回',
  expired: '已过期',
  cancelled: '已取消'
};

const statusText = (status) => statusMap[status] ?? status;

const cancel = async (id) => {
  await store.cancel(id);
};

onMounted(async () => {
  await authStore.ensureLogin();
  await store.fetchList();
});
</script>
