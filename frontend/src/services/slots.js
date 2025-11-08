import { addHours, toIso } from '../utils/time';
import { appendOrderMock } from './orders';

const generateSlots = () => {
  const now = new Date();
  const start = new Date(now);
  if (start.getMinutes() > 0 || start.getSeconds() > 0 || start.getMilliseconds() > 0) {
    start.setHours(start.getHours() + 1);
  }
  start.setMinutes(0, 0, 0);
  const slots = [];
  for (let i = 0; i < 72; i++) {
    const slotStart = addHours(start, i);
    const slotEnd = addHours(slotStart, 1);
    slots.push({
      start_time: toIso(slotStart),
      end_time: toIso(slotEnd),
      available: Math.random() > 0.2,
      mine: false
    });
  }
  return slots;
};

let mockedSlots = generateSlots();
let mockedOrder = null;

export const fetchSlotsMock = async () => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  if (mockedOrder) {
    mockedSlots = mockedSlots.map((slot) =>
      slot.start_time === mockedOrder.start_time ? { ...slot, available: false, mine: true } : slot
    );
  }
  return mockedSlots;
};

export const createReservationMock = async (startTime) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const slot = mockedSlots.find((item) => item.start_time === startTime);
  if (!slot || !slot.available) {
    throw new Error('时段不可用');
  }
  mockedOrder = {
    id: Math.floor(Math.random() * 10000),
    start_time: slot.start_time,
    end_time: slot.end_time,
    order_no: `MOCK${Date.now()}`,
    amount: 0,
    expire_at: toIso(addHours(new Date(), 0.25)),
    pay_qr_url: 'https://via.placeholder.com/256x256.png?text=QR',
    status: 'pending',
    created_at: toIso(new Date()),
    updated_at: toIso(new Date()),
    proofs: []
  };
  slot.available = false;
  slot.mine = true;
  appendOrderMock(mockedOrder);
  return mockedOrder;
};
