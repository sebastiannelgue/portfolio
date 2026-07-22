import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { login as loginRequest } from "../services/authService";

const AuthContext = createContext(null);

function readStoredAdmin() {
  const raw = localStorage.getItem("admin");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [admin, setAdmin] = useState(readStoredAdmin);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    setToken(null);
    setAdmin(null);
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await loginRequest(username, password);
    localStorage.setItem("token", data.token);
    localStorage.setItem("admin", JSON.stringify(data.admin));
    setToken(data.token);
    setAdmin(data.admin);
    return data;
  }, []);

  // El interceptor de axios emite "auth:expired" cuando un 401 invalida la sesion.
  useEffect(() => {
    const handleExpired = () => logout();
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, [logout]);

  const value = useMemo(
    () => ({
      token,
      admin,
      isAuthenticated: Boolean(token),
      login,
      logout
    }),
    [token, admin, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider.");
  }
  return context;
}
