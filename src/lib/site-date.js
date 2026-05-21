const IST_TIME_ZONE = 'Asia/Kolkata';

export const SITE_TIME_ZONE = IST_TIME_ZONE;

export function getIstDateKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function dateFromDateKey(dateKey) {
  return new Date(`${dateKey}T12:00:00Z`);
}

export function formatDateKey(date) {
  return date.toISOString().slice(0, 10);
}

export function formatDisplayDate(dateOrDateKey) {
  const date = typeof dateOrDateKey === 'string' ? dateFromDateKey(dateOrDateKey) : dateOrDateKey;
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
