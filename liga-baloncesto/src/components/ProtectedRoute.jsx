import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Bloquea el acceso a rutas privadas: si no hay sesion, redirige al login
// recordando el destino original para volver tras autenticarse.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}
