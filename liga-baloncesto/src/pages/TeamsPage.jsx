import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getTeams } from "../services/teamService";
import TeamLogo from "../components/TeamLogo";

import { SkeletonCards } from "../components/ui/Skeleton";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";

export default function TeamsPage() {
  useDocumentTitle("Equipos");
  const { data, loading, error } = useAsync(getTeams, []);
  const [query, setQuery] = useState("");

  const teams = useMemo(() => {
    const list = data || [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.coachName || "").toLowerCase().includes(q)
    );
  }, [data, query]);

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Equipos de la liga</h1>
        <p>Conoce a los clubes participantes. Toca un equipo para ver su plantel completo.</p>
      </header>

      {!loading && !error && (data || []).length > 0 && (
        <div className="search-bar">
          <span className="search-bar__icon" aria-hidden="true">🔎</span>
          <input
            type="search"
            className="search-bar__input"
            placeholder="Buscar equipo o entrenador..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Buscar equipo"
          />
        </div>
      )}

      {loading ? (
        <SkeletonCards count={8} />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : teams.length === 0 ? (
        <EmptyState
          icon="👥"
          title={query ? "Sin resultados" : "Todavia no hay equipos"}
          message={
            query
              ? `No se encontraron equipos para "${query}".`
              : "Cuando se den de alta equipos apareceran en esta seccion."
          }
        />
      ) : (
        <div className="grid grid--cards fade-in">
          {teams.map((team) => (
            <Link
              key={team.id}
              to={`/equipos/${team.id}`}
              className="card card--interactive team-card"
            >
              <TeamLogo team={team} size={52} />
              <div>
                <h3>{team.name}</h3>
                <div className="team-card__coach">DT: {team.coachName}</div>
              </div>
              <div className="team-card__meta">
                <span>
                  👥 {team.playerCount} jugador{team.playerCount === 1 ? "" : "es"}
                </span>
                <span className="quick-card__link" style={{ marginLeft: "auto" }}>
                  Ver detalle →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
