import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

// Provee notificaciones flotantes ("toasts") que se autodescartan.
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message, type = "success") => {
      const id = Date.now() + Math.random();
      setToasts((list) => [...list, { id, message, type }]);
      setTimeout(() => dismiss(id), 3200);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`} onClick={() => dismiss(t.id)}>
            <span className="toast__icon" aria-hidden="true">
              {t.type === "error" ? "⚠️" : "✓"}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  // Si no hay provider (no deberia pasar), devuelve un no-op para no romper.
  return ctx || { notify: () => {} };
}
