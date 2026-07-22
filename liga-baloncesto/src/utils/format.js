const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre"
];

const WEEKDAYS = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado"
];

// La API guarda las fechas como "YYYY-MM-DD". Se parsean por partes para evitar
// corrimientos de zona horaria (new Date("2026-05-10") interpreta UTC).
function parseISODate(iso) {
  if (!iso) return null;
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

// "2026-05-10" -> "10/05/2026"
export function formatDate(iso) {
  const date = parseISODate(iso);
  if (!date) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

// "2026-05-10" -> "Domingo 10 de mayo de 2026"
export function formatLongDate(iso) {
  const date = parseISODate(iso);
  if (!date) return "";
  const weekday = WEEKDAYS[date.getDay()];
  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalized} ${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
}

// "2026-05-10" -> "10 may"  (etiqueta corta para tarjetas)
export function formatShortDate(iso) {
  const date = parseISODate(iso);
  if (!date) return "";
  return `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)}`;
}

// "20:30" -> "20:30 hs"
export function formatTime(time) {
  return time ? `${time} hs` : "";
}
