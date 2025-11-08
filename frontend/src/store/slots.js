import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchSlotsMock, createReservationMock } from '../services/slots';

export const useSlotsStore = defineStore('slots', () => {
  const slots = ref([]);
  const loading = ref(false);

  const fetchSlots = async () => {
    loading.value = true;
    try {
      slots.value = await fetchSlotsMock();
    } finally {
      loading.value = false;
    }
  };

  const createReservation = async (startTime) => {
    const order = await createReservationMock(startTime);
    await fetchSlots();
    return order;
  };

  return {
    slots,
    loading,
    fetchSlots,
    createReservation
  };
});
