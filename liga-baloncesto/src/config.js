// Datos de presentacion de la liga.
// El backend gestiona equipos/partidos/clasificacion; estos valores describen la liga
// en si misma (no persistidos) y se centralizan aca para mantenerlos en un unico lugar.
export const LEAGUE = {
  name: "Liga Metropolitana de Baloncesto Juvenil",
  shortName: "LMB Juvenil",
  season: "Temporada 2026",
  description:
    "Torneo juvenil que reune a los mejores equipos de la region. Segui la clasificacion en vivo, el calendario de partidos y el detalle de cada equipo, fecha a fecha.",
  city: "Area Metropolitana"
};

// URL base de la API. Se puede sobrescribir con la variable de entorno VITE_API_BASE_URL.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
