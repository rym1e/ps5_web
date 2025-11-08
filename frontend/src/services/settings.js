export const fetchSettingsMock = async () => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return {
    hold_minutes: 15,
    price_per_hour: 0,
    pay_qr_url: 'https://via.placeholder.com/256x256.png?text=QR'
  };
};
