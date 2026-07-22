import { useEffect, useMemo, useState } from "react";

import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useLeague } from "../context/LeagueContext";
import { getMatches } from "../services/matchService";
import MatchCard from "../components/MatchCard";
import { SkeletonCards } from "../components/ui/Skeleton";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import { formatLongDate } from "../utils/format";

// Agrupa los partidos por fecha (YYYY-MM-DD) y ordena las fechas ascendente.
function groupByDate(matches) {
  const map = new Map();
  matches.forEach((match) => {
    if (!map.has(match.date)) {
      map.set(match.date, []);
    }
    map.get(match.date).push(match);
  });
  return Array.from(map.entries())
    .map(([date, list]) => ({ date, matches: list }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Indice de la fecha con partidos mas cercana a hoy (o la ultima si todas pasaron).
function nearestDayIndex(days) {
  if (days.length === 0) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const idx = days.findIndex((day) => day.date >= today);
  return idx === -1 ? days.length - 1 : idx;
}

export default function MatchesPage() {
  const { seasonId, category } = useLeague();
  useDocumentTitle(`Partidos${category ? ` · ${category}` : ""}`);

  const { data, loading, error } = useAsync(
    () => getMatches(undefined, seasonId, category),
    [seasonId, category]
  );

  const days = useMemo(() => groupByDate(data || []), [data]);
  const [index, setIndex] = useState(0);

  // Al cargar o cambiar datos/filtro, ubicarse en la fecha mas cercana a hoy.
  useEffect(() => {
    setIndex(nearestDayIndex(days));
  }, [days]);

  const current = days[index];
  const goPrev = () => setIndex((value) => Math.max(0, value - 1));
  const goNext = () => setIndex((value) => Math.min(days.length - 1, value + 1));
  const goToday = () => setIndex(nearestDayIndex(days));

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Partidos {category && `· ${category}`}</h1>
        <p>
          Resultados y próximos encuentros del torneo. Usá las flechas para
          moverte entre fechas y tocá un partido para ver el detalle.
        </p>
      </header>

      {loading ? (
        <SkeletonCards count={6} />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : days.length === 0 || !current ? (
        <EmptyState
          icon="🏀"
          title="No hay partidos"
          message="No hay partidos para esta temporada, categoría o filtro."
        />
      ) : (
        <>
          <div className="day-nav">
            <button
              type="button"
              className="day-nav__btn"
              onClick={goPrev}
              disabled={index <= 0}
              aria-label="Fecha anterior"
            >
              ◀
            </button>
            <div className="day-nav__center">
              <span className="day-nav__date">{formatLongDate(current.date)}</span>
              <span className="day-nav__meta">
                Fecha {index + 1} de {days.length} · {current.matches.length}{" "}
                {current.matches.length === 1 ? "partido" : "partidos"}
                {" · "}
                <button type="button" className="link-btn" onClick={goToday}>
                  Hoy
                </button>
              </span>
            </div>
            <button
              type="button"
              className="day-nav__btn"
              onClick={goNext}
              disabled={index >= days.length - 1}
              aria-label="Fecha siguiente"
            >
              ▶
            </button>
          </div>

          <div className="grid grid--cards fade-in" key={current.date}>
            {current.matches.map((match) => (
              <MatchCard key={match.id} match={match} to={`/partidos/${match.id}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
