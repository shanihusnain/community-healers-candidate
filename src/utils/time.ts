/** Normalize API times ("09:00:00", "09:00", ISO) to HH:mm. */
export function toTimeInputValue(time?: string | null, fallback = '09:00'): string {
  if (!time) return fallback;
  if (time.includes('T')) {
    const d = new Date(time);
    if (!Number.isNaN(d.getTime())) {
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
  }
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (!match) return fallback;
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

/** Format a time string for display (e.g. "09:00:00" → "9:00 AM"). */
export function formatTimeLabel(
  time?: string | null,
  options?: { fallback?: string; datePart?: string },
): string {
  const fallback = options?.fallback ?? '—';
  if (!time) return fallback;

  if (/\b(AM|PM)\b/i.test(time)) return time;

  try {
    if (time.includes('T')) {
      const d = new Date(time);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      }
    }

    const hm = toTimeInputValue(time, '');
    if (!hm) return fallback;

    const datePart = (options?.datePart || new Date().toISOString()).split('T')[0];
    const d = new Date(`${datePart}T${hm}:00`);
    if (Number.isNaN(d.getTime())) return time;
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return time;
  }
}

export function centerInitials(name?: string | null, fallback = 'CENTER'): string {
  if (!name?.trim()) return fallback;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return initials || fallback;
}
