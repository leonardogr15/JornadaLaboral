/**
 * Display helpers. They only format values the API already returns; the worked hours are still
 * calculated by the server (horasTrabajadas) and shift dates are calendar days stored as
 * midnight UTC, so dates are always formatted in UTC.
 */

/** 8.5 -> "8 h 30 min", 8 -> "8 h", 0.75 -> "45 min". */
export function formatDuration(hours) {
  const total = Math.round(Number(hours) * 60);
  if (!Number.isFinite(total) || total <= 0) return '0 min';
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** Minutes between two "HH:MM" values on the same day, or null when not a valid range. */
export function minutesBetween(entrada, salida) {
  if (!entrada || !salida) return null;
  const toMin = (v) => {
    const [h, m] = v.split(':').map(Number);
    return h * 60 + m;
  };
  const diff = toMin(salida) - toMin(entrada);
  return diff > 0 ? diff : null;
}

/** "2026-11-16T00:00:00Z" -> { date: "16/11/2026", weekday: "lunes" }. */
export function formatShiftDate(iso) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('es-ES', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }),
    weekday: d.toLocaleDateString('es-ES', { timeZone: 'UTC', weekday: 'long' }),
  };
}

/** Today in the user's time zone, e.g. "martes, 25 de noviembre de 2026". */
export function todayLong() {
  return new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function roleLabel(rol) {
  return rol === 'admin' ? 'Administrador' : 'Usuario';
}

export function initials(nombre = '') {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}
