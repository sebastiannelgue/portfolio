import { Link } from "react-router-dom";

import TeamLogo from "./TeamLogo";
import { MatchStatusBadge } from "./ui/Badge";
import { formatLongDate, formatTime } from "../utils/format";
import { shortTeamName } from "../utils/text";

// Tarjeta de partido reutilizada en partidos, vista de equipo y admin.
// `actions` permite inyectar botones (ej. editar / cargar resultado) desde el admin.
// `to` convierte toda la tarjeta en un enlace al detalle del partido.
export default function MatchCard({ match, actions, to }) {
  const played = match.status === "played";
  const result = match.result;
  const homeWin = played && result && result.homeScore > result.awayScore;
  const awayWin = played && result && result.awayScore > result.homeScore;

  const card = (
    <article className={`match-card ${to ? "match-card--link" : ""}`}>
      <div className="match-card__top">
        {match.category && <span className="match-card__cat">{match.category}</span>}
        <MatchStatusBadge status={match.status} />
      </div>

      <div className="match-card__rows">
        <div className={`match-row ${homeWin ? "match-row--win" : ""}`}>
          <TeamLogo team={match.homeTeam} size={34} round />
          <span className="match-row__name" title={match.homeTeam?.name}>
            {shortTeamName(match.homeTeam?.name) || "Equipo"}
          </span>
          {played && result ? (
            <span className="match-row__score">{result.homeScore}</span>
          ) : (
            <span className="match-row__ha">L</span>
          )}
        </div>

        <div className={`match-row ${awayWin ? "match-row--win" : ""}`}>
          <TeamLogo team={match.awayTeam} size={34} round />
          <span className="match-row__name" title={match.awayTeam?.name}>
            {shortTeamName(match.awayTeam?.name) || "Equipo"}
          </span>
          {played && result ? (
            <span className="match-row__score">{result.awayScore}</span>
          ) : (
            <span className="match-row__ha">V</span>
          )}
        </div>
      </div>

      <div className="match-card__foot">
        <span>📅 {formatLongDate(match.date)}</span>
        <span>🕒 {formatTime(match.time)}</span>
        <span>📍 {match.venue}</span>
        {actions && <span className="match-card__actions">{actions}</span>}
      </div>
    </article>
  );

  if (to) {
    return (
      <Link to={to} className="match-card-link">
        {card}
      </Link>
    );
  }

  return card;
}
