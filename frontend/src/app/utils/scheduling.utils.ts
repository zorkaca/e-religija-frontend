export const DEFAULT_TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export function resolveTimeSlots(workingHours?: string): string[] {
  if (!workingHours) {
    return [...DEFAULT_TIME_SLOTS];
  }

  const match = workingHours.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!match) {
    return [...DEFAULT_TIME_SLOTS];
  }

  const open = parseTime(match[1]);
  const close = parseTime(match[2]);
  if (open === null || close === null || close <= open) {
    return [...DEFAULT_TIME_SLOTS];
  }

  const slots: string[] = [];
  let current = open;

  while (current + 60 <= close) {
    slots.push(formatTime(current));
    current += 60;
  }

  return slots.length > 0 ? slots : [...DEFAULT_TIME_SLOTS];
}

function parseTime(value: string): number | null {
  const parts = value.split(':');
  if (parts.length !== 2) {
    return null;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function isWeddingCeremony(name: string): boolean {
  const normalized = name.toLowerCase();
  return normalized.includes('vjenčanje') || normalized.includes('vencanje') || normalized.includes('nikah');
}

export function getMapEmbedUrl(latitude: number, longitude: number): string {
  const delta = 0.01;
  const left = longitude - delta;
  const right = longitude + delta;
  const top = latitude + delta;
  const bottom = latitude - delta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}

export function getMapExternalUrl(latitude: number, longitude: number): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
}
