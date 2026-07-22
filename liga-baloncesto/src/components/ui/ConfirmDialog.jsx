import Modal from "./Modal";
import Alert from "./Alert";

// Dialogo de confirmacion para acciones destructivas (ej. eliminar).
export default function ConfirmDialog({
  title = "Confirmar accion",
  message,
  confirmLabel = "Eliminar",
  loading = false,
  error,
  onConfirm,
  onClose
}) {
  return (
    <Modal title={title} onClose={onClose} maxWidth="440px">
      <p className="text-muted">{message}</p>
      {error && (
        <div className="mt-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}
      <div className="form-actions mt-5">
        <button className="btn btn--ghost" onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button className="btn btn--danger" onClick={onConfirm} disabled={loading}>
          {loading ? "Procesando..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
