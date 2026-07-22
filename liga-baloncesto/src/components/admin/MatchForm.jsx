import { useState } from "react";

import Field from "../ui/Field";
import Alert from "../ui/Alert";
import { required, isDate, isTime, collectErrors } from "../../utils/validation";

export default function MatchForm({
  initial,
  teams,
  seasons,
  categories,
  onSubmit,
  onCancel,
  submitting,
  submitError
}) {
  const defaultSeason =
    initial?.season?.id || seasons.find((s) => s.isActive)?.id || seasons[0]?.id || "";
  const defaultCategory = initial?.category || categories[0]?.name || "";

  const [seasonId, setSeasonId] = useState(defaultSeason);
  const [category, setCategory] = useState(defaultCategory);
  const [homeTeamId, setHomeTeamId] = useState(initial?.homeTeam?.id || "");
  const [awayTeamId, setAwayTeamId] = useState(initial?.awayTeam?.id || "");
  const [date, setDate] = useState(initial?.date || "");
  const [time, setTime] = useState(initial?.time || "");
  const [venue, setVenue] = useState(initial?.venue || "");
  const [errors, setErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = collectErrors({
      seasonId: required(seasonId, "La temporada"),
      category: required(category, "La categoria"),
      homeTeamId: required(homeTeamId, "El equipo local"),
      awayTeamId: required(awayTeamId, "El equipo visitante"),
      date: required(date, "La fecha") || isDate(date),
      time: required(time, "La hora") || isTime(time),
      venue: required(venue, "El lugar")
    });

    if (homeTeamId && awayTeamId && homeTeamId === awayTeamId) {
      nextErrors.awayTeamId = "El local y el visitante deben ser distintos.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({ seasonId, category, homeTeamId, awayTeamId, date, time, venue: venue.trim() });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      {submitError && <Alert type="error">{submitError}</Alert>}

      <div className="form-row">
        <Field label="Temporada" htmlFor="match-season" error={errors.seasonId}>
          <select
            id="match-season"
            value={seasonId}
            onChange={(event) => setSeasonId(event.target.value)}
          >
            <option value="">Seleccionar</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
                {season.isActive ? " · actual" : ""}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Categoria" htmlFor="match-category" error={errors.category}>
          <select
            id="match-category"
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
      </div>

      <div className="form-row">
        <Field label="Equipo local" htmlFor="match-home" error={errors.homeTeamId}>
          <select
            id="match-home"
            value={homeTeamId}
            onChange={(event) => setHomeTeamId(event.target.value)}
          >
            <option value="">Seleccionar</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Equipo visitante" htmlFor="match-away" error={errors.awayTeamId}>
          <select
            id="match-away"
            value={awayTeamId}
            onChange={(event) => setAwayTeamId(event.target.value)}
          >
            <option value="">Seleccionar</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="form-row">
        <Field label="Fecha" htmlFor="match-date" error={errors.date}>
          <input
            id="match-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </Field>

        <Field label="Horario" htmlFor="match-time" error={errors.time}>
          <input
            id="match-time"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
          />
        </Field>
      </div>

      <Field label="Lugar / sede" htmlFor="match-venue" error={errors.venue}>
        <input
          id="match-venue"
          value={venue}
          onChange={(event) => setVenue(event.target.value)}
          placeholder="Ej: Microestadio Sur"
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
