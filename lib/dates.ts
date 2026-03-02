export function toMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function nextMonth(date: Date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()));
  return d;
}

export function ensureFutureMonth(due: Date, today = new Date()) {
  let next = new Date(due);
  const todayMonthKey = toMonthKey(today);
  while (toMonthKey(next) < todayMonthKey || (toMonthKey(next) === todayMonthKey && next.getUTCDate() < today.getUTCDate())) {
    next = nextMonth(next);
  }
  return next;
}
