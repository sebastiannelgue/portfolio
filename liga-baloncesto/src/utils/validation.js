// Validaciones de formularios en el frontend. Reflejan las reglas que el backend
// aplica con express-validator, para dar feedback inmediato antes de enviar.

export function required(value, label = "Este campo") {
  return value && String(value).trim() ? null : `${label} es obligatorio.`;
}

export function isDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    return "La fecha debe tener formato AAAA-MM-DD.";
  }
  return null;
}

export function isTime(value) {
  if (!/^\d{2}:\d{2}$/.test(value || "")) {
    return "La hora debe tener formato HH:mm.";
  }
  return null;
}

export function isNonNegativeInt(value, label = "El valor") {
  if (value === "" || value === null || value === undefined) {
    return `${label} es obligatorio.`;
  }
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    return `${label} debe ser un numero entero igual o mayor a 0.`;
  }
  return null;
}

// Recibe un objeto { campo: mensajeDeError|null } y devuelve solo los que fallaron.
export function collectErrors(map) {
  return Object.fromEntries(
    Object.entries(map).filter(([, message]) => Boolean(message))
  );
}
