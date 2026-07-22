// variant: "scheduled" | "played" | "neutral" | "primary" | "warning"
export default function Badge({ variant = "neutral", style, children }) {
  return (
    <span className={`badge badge--${variant}`} style={style}>
      {children}
    </span>
  );
}

// Helper de estado de partido reutilizable en varias vistas.
export function MatchStatusBadge({ status }) {
  return status === "played" ? (
    <Badge variant="played">
      <span className="badge__dot" aria-hidden="true" />
      Finalizado
    </Badge>
  ) : (
    <Badge variant="scheduled">
      <span className="badge__dot" aria-hidden="true" />
      Programado
    </Badge>
  );
}
