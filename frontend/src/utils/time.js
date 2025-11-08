export const toIso = (date) => new Date(date).toISOString();

export const addHours = (date, hours) => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

export const formatTimeRange = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d) => `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:00`;
  return `${fmt(s)} - ${String(e.getHours()).padStart(2, '0')}:00`;
};

export const formatDate = (value) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(
    d.getHours()
  ).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
