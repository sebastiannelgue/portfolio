import { useState } from "react";
import { useNavigate, useLocation, Link, Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { LEAGUE } from "../../config";
import Field from "../../components/ui/Field";
import Alert from "../../components/ui/Alert";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Si ya hay sesion activa, no tiene sentido mostrar el login.
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Completa usuario y contrasena.");
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.uiMessage || "No se pudo iniciar sesion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-card__brand">
          <img src="/favicon.svg" alt="" aria-hidden="true" />
          <h1>Acceso administrador</h1>
          <p>{LEAGUE.shortName}</p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          {error && <Alert type="error">{error}</Alert>}

          <Field label="Usuario" htmlFor="username">
            <input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="admin"
              autoComplete="username"
              autoFocus
            />
          </Field>

          <Field label="Contrasena" htmlFor="password">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Field>

          <button className="btn btn--primary btn--block" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="login-hint">
          Credenciales de prueba: <strong>admin</strong> / <strong>Admin1234</strong>
        </div>

        <Link to="/" className="back-home">
          ← Volver al sitio publico
        </Link>
      </div>
    </div>
  );
}
