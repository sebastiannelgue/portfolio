import { useState } from "react";

import Field from "../ui/Field";
import Alert from "../ui/Alert";
import { required, collectErrors } from "../../utils/validation";

export default function PlayerForm({
  initial,
  teams,
  categories = [],
  onSubmit,
  onCancel,
  submitting,
  submitError
}) {
  const [firstName, setFirstName] = useState(initial?.firstName || "");
  const [lastName, setLastName] = useState(initial?.lastName || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [extraCategory, setExtraCategory] = useState(initial?.extraCategory || "");
  const [teamId, setTeamId] = useState(initial?.team?.id || "");
  const [errors, setErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = collectErrors({
      firstName: required(firstName, "El nombre"),
      lastName: required(lastName, "El apellido"),
      category: required(category, "La categoria"),
      teamId: required(teamId, "El equipo")
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      category: category.trim(),
      extraCategory: extraCategory ? extraCategory.trim() : "",
      teamId
    });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      {submitError && <Alert type="error">{submitError}</Alert>}

      <div className="form-row">
        <Field label="Nombre" htmlFor="player-first" error={errors.firstName}>
          <input
            id="player-first"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="Ej: Tomas"
            autoFocus
          />
        </Field>

        <Field label="Apellido" htmlFor="player-last" error={errors.lastName}>
          <input
            id="player-last"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder="Ej: Rossi"
          />
        </Field>
      </div>

      <div className="form-row">
        <Field label="Categoria" htmlFor="player-category" error={errors.category}>
          <select
            id="player-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">Seleccionar</option>
            {categories.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Equipo" htmlFor="player-team" error={errors.teamId}>
          <select
            id="player-team"
            value={teamId}
            onChange={(event) => setTeamId(event.target.value)}
          >
            <option value="">Seleccionar equipo</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="form-row">
        <Field
          label="Asciende a (opcional)"
          htmlFor="player-extra"
          hint="Si juega tambien en una categoria superior"
        >
          <select
            id="player-extra"
            value={extraCategory}
            onChange={(event) => setExtraCategory(event.target.value)}
          >
            <option value="">Sin ascenso</option>
            {categories
              .filter((item) => item.name !== category)
              .map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
          </select>
        </Field>
      </div>

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
