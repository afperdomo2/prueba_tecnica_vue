const DATE_LOCALE = 'es';
const TIME_ZONE = 'UTC';

const shortDateFormatter = new Intl.DateTimeFormat(DATE_LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: TIME_ZONE,
});

const dateTimeFormatter = new Intl.DateTimeFormat(DATE_LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: TIME_ZONE,
});

export function formatDateShort(iso: string): string {
  return shortDateFormatter.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}
