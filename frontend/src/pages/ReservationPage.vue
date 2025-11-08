<template>
  <div class="max-w-6xl mx-auto px-4 py-8 space-y-6">
    <section class="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">预约 PS5</h1>
          <p class="text-sm text-gray-500">请选择未来 72 小时内的可用时段。单次预约时长为 1 小时。</p>
        </div>
        <button class="px-3 py-2 text-sm rounded-md border border-gray-200 hover:border-brand-primary" @click="refresh">
          刷新时段
        </button>
      </header>
      <AlertBanner v-if="pendingOrder" variant="warning">
        您有未完成订单（#{{ pendingOrder.order_no }}）。完成支付或取消后才能继续预约。
      </AlertBanner>
      <SlotGrid v-model="selectedSlot" :slots="slots" />
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <p class="text-xs text-gray-500">确认预约后将生成订单，并在 {{ holdMinutes }} 分钟内保留时段。</p>
        <button
          class="px-4 py-2 rounded-md text-white disabled:opacity-50"
          :class="selectedSlot ? 'bg-brand-primary hover:bg-brand-primary/90' : 'bg-gray-300'"
          :disabled="!selectedSlot || Boolean(pendingOrder)"
          @click="createReservation"
        >
          创建预约
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import SlotGrid from '../components/SlotGrid.vue';
import AlertBanner from '../components/system/AlertBanner.vue';
import { useSlotsStore } from '../store/slots';
import { useOrdersStore } from '../store/orders';
import { useSettingsStore } from '../store/settings';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const slotsStore = useSlotsStore();
const ordersStore = useOrdersStore();
const settingsStore = useSettingsStore();
const authStore = useAuthStore();

const selectedSlot = ref('');

const slots = computed(() => slotsStore.slots);
const pendingOrder = computed(() => ordersStore.pendingOrder);
const holdMinutes = computed(() => settingsStore.holdMinutes);

const refresh = async () => {
  await authStore.ensureLogin();
  await settingsStore.fetchSettings();
  await slotsStore.fetchSlots();
  await ordersStore.fetchPending();
};

const createReservation = async () => {
  if (!selectedSlot.value) return;
  const order = await slotsStore.createReservation(selectedSlot.value);
  if (order) {
    await ordersStore.fetchList();
    router.push({ name: 'Pay', params: { orderId: order.id } });
  }
};

onMounted(refresh);
</script>
