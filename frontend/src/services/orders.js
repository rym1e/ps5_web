import { addHours, toIso } from '../utils/time';

let orders = [
  {
    id: 1,
    order_no: 'MOCK2024001',
    amount: 0,
    status: 'pending',
    start_time: toIso(addHours(new Date(), 2)),
    end_time: toIso(addHours(new Date(), 3)),
    created_at: toIso(new Date()),
    updated_at: toIso(new Date()),
    expire_at: toIso(addHours(new Date(), 0.2)),
    pay_qr_url: 'https://via.placeholder.com/256x256.png?text=QR',
    proofs: []
  }
];

export const fetchOrdersMock = async () => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return orders;
};

export const fetchOrderDetailMock = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return orders.find((item) => item.id == id) ?? null;
};

export const cancelOrderMock = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  orders = orders.map((item) => (item.id === Number(id) ? { ...item, status: 'cancelled' } : item));
};

export const submitProofMock = async (id, files, note) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  orders = orders.map((item) => {
    if (item.id !== Number(id)) return item;
    const proofs = files.map((file, index) => ({
      image_url: URL.createObjectURL(file),
      note: index === 0 ? note : ''
    }));
    return { ...item, status: 'proof_submitted', proofs };
  });
};

export const fetchPendingOrderMock = async () => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return orders.find((item) => ['pending', 'proof_submitted'].includes(item.status)) ?? null;
};

export const appendOrderMock = (order) => {
  orders = [order, ...orders.filter((item) => item.id !== order.id)];
};
