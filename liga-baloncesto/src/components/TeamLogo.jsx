import { useEffect, useState } from "react";
import { teamInitials } from "../utils/text";

const MAX_RETRIES = 2;

// Escudo/foto del equipo. Si hay logoUrl muestra la imagen; si no (o si falla la
// carga tras reintentar) muestra un avatar con las iniciales. Reutilizable en
// todas las vistas.
export default function TeamLogo({ team, size = 48, round = false }) {
  const logoUrl = team?.logoUrl;
  const [attempt, setAttempt] = useState(0);
  const [broken, setBroken] = useState(false);

  // Si cambia el logo, reiniciar el estado de carga.
  useEffect(() => {
    setAttempt(0);
    setBroken(false);
  }, [logoUrl]);

  const showImage = logoUrl && !broken;
  // Cache-busting solo en reintentos, para forzar una nueva carga.
  const src = attempt > 0 ? `${logoUrl}?r=${attempt}` : logoUrl;

  const handleError = () => {
    if (attempt < MAX_RETRIES) {
      setAttempt((a) => a + 1);
    } else {
      setBroken(true);
    }
  };

  return (
    <span
      className={`team-logo ${round ? "team-logo--round" : ""}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {showImage ? (
        <img src={src} alt="" loading="lazy" onError={handleError} />
      ) : (
        <span className="team-logo__initials" style={{ fontSize: Math.round(size * 0.4) }}>
          {teamInitials(team?.name)}
        </span>
      )}
    </span>
  );
}
