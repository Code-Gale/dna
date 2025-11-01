export function buildICS() {
  const dtStart = toICSDate(new Date('2025-12-10T15:00:00+01:00'))
  const dtEnd = toICSDate(new Date('2025-12-10T18:00:00+01:00'))
  const uid = `dinner-awards-${Date.now()}@victory-house`
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dinner N\' Awards Night//The Great Banquet//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    'SUMMARY:Dinner N\' Awards Night — The Great Banquet',
    'LOCATION:Victory House',
    'DESCRIPTION:Red Carpet 2PM · Main Event 3PM. Dress Code: Royal Elegance.',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}

function toICSDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  )
}
