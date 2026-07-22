import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook reutilizable para cargar datos de la API.
 * Centraliza el manejo de loading/error y expone `reload` para refrescar.
 *
 * @param {Function} asyncFn  Funcion async que devuelve los datos.
 * @param {Array}    deps     Dependencias que disparan una recarga al cambiar.
 */
export function useAsync(asyncFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Id de llamada: evita que una respuesta vieja (lenta) pise a una mas nueva.
  const callId = useRef(0);

  const run = useCallback(async () => {
    const id = (callId.current += 1);
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      if (id === callId.current) setData(result);
    } catch (err) {
      if (id === callId.current) {
        setError(err.uiMessage || "No se pudieron cargar los datos.");
      }
    } finally {
      if (id === callId.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, reload: run, setData };
}
