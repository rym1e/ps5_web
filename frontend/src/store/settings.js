import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchSettingsMock } from '../services/settings';

export const useSettingsStore = defineStore('settings', () => {
  const holdMinutes = ref(15);
  const pricePerHour = ref(0);
  const payQrUrl = ref('');

  const fetchSettings = async () => {
    const settings = await fetchSettingsMock();
    holdMinutes.value = settings.hold_minutes;
    pricePerHour.value = settings.price_per_hour;
    payQrUrl.value = settings.pay_qr_url;
  };

  return {
    holdMinutes,
    pricePerHour,
    payQrUrl,
    fetchSettings
  };
});
