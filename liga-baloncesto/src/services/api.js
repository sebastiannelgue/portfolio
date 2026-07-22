import axios from "axios";
import { API_BASE_URL } from "../config";

// Instancia central de axios. Todos los servicios la reutilizan para hablar con la API.
const api = axios.create({
  baseURL: API_BASE_URL
});

// Interceptor de request: adjunta el token JWT como Bearer en cada llamada.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response: normaliza los errores del backend a un mensaje legible
// (express-validator devuelve { errors: [...] }, httpError devuelve { message }).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    let message = "Ocurrio un error inesperado. Intenta nuevamente.";

    if (error.code === "ERR_NETWORK") {
      message =
        "No se pudo conectar con el servidor. Verifica que el backend este encendido.";
    } else if (data) {
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        message = data.errors.map((item) => item.message).join(" ");
      } else if (data.message) {
        message = data.message;
      }
    }

    // Token vencido o invalido en una ruta protegida: cerrar sesion.
    if (error.response?.status === 401 && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("admin");
      window.dispatchEvent(new Event("auth:expired"));
    }

    error.uiMessage = message;
    return Promise.reject(error);
  }
);

export default api;
