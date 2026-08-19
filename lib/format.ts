const KRW = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

const NUMBER = new Intl.NumberFormat("ko-KR");

const DATE = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const DATE_TIME = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatKRW(value: number) {
  return KRW.format(value);
}

export function formatNumber(value: number) {
  return NUMBER.format(value);
}

export function formatDate(value: string | Date) {
  return DATE.format(new Date(value));
}

export function formatDateTime(value: string | Date) {
  return DATE_TIME.format(new Date(value));
}

export function remainingSeats(capacity: number, enrolled: number) {
  if (capacity <= 0) return Infinity;
  return Math.max(capacity - enrolled, 0);
}
