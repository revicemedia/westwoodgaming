const dateFormat = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Berlin',
})

export function formatEventDate(date?: string | null) {
  return date ? `${dateFormat.format(new Date(date))} Uhr` : 'Termin folgt'
}
