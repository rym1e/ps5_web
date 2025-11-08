import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  fetchOrdersMock,
  fetchOrderDetailMock,
  cancelOrderMock,
  submitProofMock,
  fetchPendingOrderMock
} from '../services/orders';

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([]);
  const currentOrder = ref(null);
  const pending = ref(null);

  const fetchList = async () => {
    orders.value = await fetchOrdersMock();
    pending.value = orders.value.find((item) => ['pending', 'proof_submitted'].includes(item.status)) ?? null;
  };

  const fetchDetail = async (id) => {
    currentOrder.value = await fetchOrderDetailMock(id);
  };

  const cancel = async (id) => {
    await cancelOrderMock(id);
    await fetchList();
    if (currentOrder.value?.id === Number(id)) {
      currentOrder.value = await fetchOrderDetailMock(id);
    }
  };

  const submitProof = async (id, files, note) => {
    await submitProofMock(id, files, note);
    await fetchDetail(id);
    await fetchList();
  };

  const fetchPending = async () => {
    pending.value = await fetchPendingOrderMock();
    return pending.value;
  };

  const pendingOrder = computed(() => pending.value);

  return {
    orders,
    currentOrder,
    pendingOrder,
    fetchList,
    fetchDetail,
    cancel,
    submitProof,
    fetchPending
  };
});
