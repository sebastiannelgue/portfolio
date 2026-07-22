// Envoltorio de campo de formulario: etiqueta + control + ayuda/error.
export default function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div className={`field ${error ? "field--error" : ""}`}>
      {label && <label htmlFor={htmlFor}>{label}</label>}
      {children}
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}
