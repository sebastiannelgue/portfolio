// Iniciales de un nombre (max. 2) para avatares: "Halcones del Sur" -> "HS".
export function teamInitials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .filter((word) => !["del", "de", "la", "los", "las", "el"].includes(word.toLowerCase()))
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

// Iniciales de una persona: "Tomas Rossi" -> "TR".
export function personInitials(firstName, lastName) {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";
}

// Nombre corto para espacios reducidos (tarjetas de partido):
// "Estudiantes de La Plata" -> "Estudiantes", "Talleres de Cordoba" -> "Talleres".
// Quita el complemento de ciudad ("... de ...") y abrevia casos conocidos.
const SHORT_NAME_OVERRIDES = {
  "Newell's Old Boys": "Newell's",
  "Velez Sarsfield": "Velez",
  "Racing Club": "Racing"
};

export function shortTeamName(name) {
  if (!name) return "";
  if (SHORT_NAME_OVERRIDES[name]) return SHORT_NAME_OVERRIDES[name];
  return name.split(/\s+de\s+/i)[0];
}
