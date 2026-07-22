import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div
      className="container"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        padding: "var(--space-6)"
      }}
    >
      <div>
        <div style={{ fontSize: "4rem" }} aria-hidden="true">
          🏀
        </div>
        <h1 style={{ fontSize: "2rem", marginBottom: "var(--space-2)" }}>
          Pagina no encontrada
        </h1>
        <p className="text-muted" style={{ marginBottom: "var(--space-5)" }}>
          La pagina que buscas no existe o fue movida.
        </p>
        <Link to="/" className="btn btn--primary">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
