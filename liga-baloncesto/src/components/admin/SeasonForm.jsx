import { useState } from "react";

import Field from "../ui/Field";
import Alert from "../ui/Alert";
import { required, collectErrors } from "../../utils/validation";

export default function SeasonForm({ initial, onSubmit, onCancel, submitting, submitError }) {
  const [name, setName] = useState(initial?.name || "");
  const [year, setYear] = useState(initial?.year ? String(initial.year) : "");
  const [isActive, setIsActive] = useState(initial?.isActive || false);
  const [errors, setErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = collectErrors({
      name: required(name, "El nombre de la temporada"),
      year: required(year, "El anio")
    });
    if (year && !/^\d{4}$/.test(year)) {
      nextErrors.year = "El anio debe tener 4 digitos.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({ name: name.trim(), year: Number(year), isActive });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      {submitError && <Alert type="error">{submitError}</Alert>}

      <Field label="Nombre" htmlFor="season-name" error={errors.name}>
        <input
          id="season-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ej: Temporada 2026"
          autoFocus
        />
      </Field>

      <Field label="Anio" htmlFor="season-year" error={errors.year}>
        <input
          id="season-year"
          type="number"
          value={year}
          onChange={(event) => setYear(event.target.value)}
          placeholder="2026"
        />
      </Field>

      <label className="check">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
        />
        Marcar como temporada activa (la que se muestra por defecto)
      </label>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </button>
        <button className="btn btn--primary" disabled={submitting}>
          {submitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
