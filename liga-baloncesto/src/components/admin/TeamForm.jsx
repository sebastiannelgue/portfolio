import { useState } from "react";

import Field from "../ui/Field";
import Alert from "../ui/Alert";
import TeamLogo from "../TeamLogo";
import { required, collectErrors } from "../../utils/validation";

export default function TeamForm({ initial, onSubmit, onCancel, submitting, submitError }) {
  const [name, setName] = useState(initial?.name || "");
  const [coachName, setCoachName] = useState(initial?.coachName || "");
  const [logoUrl, setLogoUrl] = useState(initial?.logoUrl || "");
  const [errors, setErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = collectErrors({
      name: required(name, "El nombre del equipo"),
      coachName: required(coachName, "El nombre del entrenador")
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      name: name.trim(),
      coachName: coachName.trim(),
      logoUrl: logoUrl.trim()
    });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      {submitError && <Alert type="error">{submitError}</Alert>}

      <Field label="Nombre del equipo" htmlFor="team-name" error={errors.name}>
        <input
          id="team-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ej: Halcones del Sur"
          autoFocus
        />
      </Field>

      <Field label="Entrenador/a" htmlFor="team-coach" error={errors.coachName}>
        <input
          id="team-coach"
          value={coachName}
          onChange={(event) => setCoachName(event.target.value)}
          placeholder="Ej: Mariana Gomez"
        />
      </Field>

      <Field
        label="Escudo / foto del equipo"
        htmlFor="team-logo"
        hint="Pega la URL de una imagen (opcional). Si la dejas vacia se usan las iniciales."
      >
        <div className="logo-field">
          <TeamLogo team={{ name, logoUrl }} size={48} />
          <input
            id="team-logo"
            value={logoUrl}
            onChange={(event) => setLogoUrl(event.target.value)}
            placeholder="https://.../escudo.png"
          />
        </div>
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
