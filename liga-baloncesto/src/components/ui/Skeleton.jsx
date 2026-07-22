// Placeholders animados mientras carga el contenido (mejor percepcion que un spinner).
export function Skeleton({ width, height = 16, radius = "var(--radius-sm)", style }) {
  return (
    <span
      className="skeleton"
      style={{ width: width || "100%", height, borderRadius: radius, ...style }}
    />
  );
}

// Grilla de tarjetas "fantasma" para listas (equipos, partidos, etc.).
export function SkeletonCards({ count = 6 }) {
  return (
    <div className="grid grid--cards">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <Skeleton height={20} width="60%" />
          <Skeleton height={48} radius="var(--radius)" />
          <Skeleton height={14} width="80%" />
        </div>
      ))}
    </div>
  );
}

// Filas "fantasma" para una tabla.
export function SkeletonRows({ count = 8 }) {
  return (
    <div className="skeleton-rows">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height={44} />
      ))}
    </div>
  );
}
