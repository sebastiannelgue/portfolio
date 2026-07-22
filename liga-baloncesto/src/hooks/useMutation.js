import { useState } from "react";

/**
 * Maneja el ciclo de una operacion de escritura (crear/editar/eliminar):
 * estado `submitting`, captura de errores y callback de exito.
 */
export function useMutation() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const run = async (action, onSuccess) => {
    setSubmitting(true);
    setError("");
    try {
      const result = await action();
      if (onSuccess) await onSuccess(result);
      return true;
    } catch (err) {
      setError(err.uiMessage || "No se pudo completar la operacion.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => setError("");

  return { submitting, error, run, reset };
}
