import { useState } from "react";

import Field from "../ui/Field";
import Alert from "../ui/Alert";
import { isNonNegativeInt, collectErrors } from "../../utils/validation";

// Carga / edicion del marcador de un partido.
export default function ResultForm({ match, onSubmit, onCancel, submitting, submitError }) {
  const [homeScore, setHomeScore] = useState(
    match.result ? String(match.result.homeScore) : ""
  );
  const [awayScore, setAwayScore] = useState(
    match.result ? String(match.result.awayScore) : ""
  );
  const [errors, setErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = collectErrors({
      homeScore: isNonNegativeInt(homeScore, "Los puntos del local"),
      awayScore: isNonNegativeInt(awayScore, "Los puntos del visitante")
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({ homeScore: Number(homeScore), awayScore: Number(awayScore) });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      {submitError && <Alert type="error">{submitError}</Alert>}

      <div className="form-row">
        <Field
          label={`Puntos · ${match.homeTeam?.name || "Local"}`}
          htmlFor="home-score"
          error={errors.homeScore}
        >
          <input
            id="home-score"
            type="number"
            min="0"
            value={homeScore}
            onChange={(event) => setHomeScore(event.target.value)}
            placeholder="0"
            autoFocus
          />
        </Field>

        <Field
          label={`Puntos · ${match.awayTeam?.name || "Visitante"}`}
          htmlFor="away-score"
          error={errors.awayScore}
        >
          <input
            id="away-score"
            type="number"
            min="0"
            value={awayScore}
            onChange={(event) => setAwayScore(event.target.value)}
            placeholder="0"
          />
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
          {submitting ? "Guardando..." : "Guardar resultado"}
        </button>
      </div>
    </form>
  );
}
