import { useState } from "react";

import Field from "../ui/Field";
import Alert from "../ui/Alert";
import { required, collectErrors } from "../../utils/validation";

export default function CategoryForm({ initial, onSubmit, onCancel, submitting, submitError }) {
  const [name, setName] = useState(initial?.name || "");
  const [order, setOrder] = useState(initial?.order !== undefined ? String(initial.order) : "");
  const [errors, setErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = collectErrors({
      name: required(name, "El nombre de la categoria")
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({ name: name.trim(), order: order === "" ? 0 : Number(order) });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      {submitError && <Alert type="error">{submitError}</Alert>}

      <Field label="Nombre" htmlFor="category-name" error={errors.name}>
        <input
          id="category-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ej: U15"
          autoFocus
        />
      </Field>

      <Field
        label="Orden"
        htmlFor="category-order"
        hint="Numero para ordenar las categorias (opcional)."
      >
        <input
          id="category-order"
          type="number"
          value={order}
          onChange={(event) => setOrder(event.target.value)}
          placeholder="1"
        />
      </Field>

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
