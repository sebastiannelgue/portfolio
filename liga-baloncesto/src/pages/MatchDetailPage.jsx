import { Link, useParams } from "react-router-dom";

import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getMatch } from "../services/matchService";
import TeamLogo from "../components/TeamLogo";
import Badge, { MatchStatusBadge } from "../components/ui/Badge";
import Loading from "../components/ui/Loading";
import Alert from "../components/ui/Alert";
import { formatLongDate, formatTime } from "../utils/format";

function Lineup({ team, side, played, mvpId }) {
  const total = (team.lineup || []).reduce((sum, p) => sum + (p.points || 0), 0);
  // El goleador del equipo es el primero (la API ya ordena por puntos desc).
  const topScorerId = played && team.lineup?.[0]?.points > 0 ? team.lineup[0].id : null;

  return (
    <div className="lineup">
      <div className="lineup__head">
        <span className="lineup__side">{side}</span>
        <h3 className="lineup__team">{team.name}</h3>
        {team.coachName && <span className="lineup__coach">DT: {team.coachName}</span>}
        {played && <span className="lineup__total">Total: {total} pts</span>}
      </div>
      {team.lineup && team.lineup.length > 0 ? (
        <ul className="lineup__list">
          {team.lineup.map((player) => (
            <li key={player.id} className="lineup__row">
              <span className="lineup__player">
                {player.id === topScorerId && (
                  <span className="lineup__star" title="Goleador del equipo">⭐</span>
                )}
                {player.fullName}
                {player.promoted && (
                  <Badge variant="warning" style={{ marginLeft: 8 }}>
                    ↑ {player.category}
                  </Badge>
                )}
                {player.id === mvpId && (
                  <Badge variant="primary" style={{ marginLeft: 8 }}>
                    MVP
                  </Badge>
                )}
              </span>
              {played && <span className="lineup__pts">{player.points} pts</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="lineup__empty">Sin jugadores cargados en esta categoría.</p>
      )}
    </div>
  );
}

export default function MatchDetailPage() {
  const { matchId } = useParams();
  const { data: match, loading, error } = useAsync(() => getMatch(matchId), [matchId]);
  useDocumentTitle(
    match ? `${match.homeTeam?.name} vs ${match.awayTeam?.name}` : "Partido"
  );

  if (loading) {
    return (
      <div className="container page">
        <Loading label="Cargando partido..." />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="container page">
        <Alert type="error">{error || "Partido no encontrado."}</Alert>
        <Link to="/partidos" className="btn btn--secondary btn--sm" style={{ marginTop: 16 }}>
          ← Volver a partidos
        </Link>
      </div>
    );
  }

  const played = match.status === "played";
  const result = match.result;
  const homeWin = played && result && result.homeScore > result.awayScore;
  const awayWin = played && result && result.awayScore > result.homeScore;

  // MVP del partido: el jugador con mas puntos entre ambos equipos.
  const allPlayers = [
    ...(match.homeTeam?.lineup || []),
    ...(match.awayTeam?.lineup || [])
  ];
  const mvp =
    played && allPlayers.length
      ? allPlayers.reduce((a, b) => (b.points > a.points ? b : a))
      : null;
  const mvpId = mvp && mvp.points > 0 ? mvp.id : null;

  return (
    <div className="container page">
      <Link to="/partidos" className="back-link">
        ← Volver a partidos
      </Link>

      <article className="match-detail">
        <div className="match-detail__top">
          {match.category && <span className="match-card__cat">{match.category}</span>}
          <MatchStatusBadge status={match.status} />
        </div>

        <div className="match-detail__scoreboard">
          <div className={`match-detail__team ${homeWin ? "is-winner" : ""}`}>
            <span className="match-detail__role">Local</span>
            <TeamLogo team={match.homeTeam} size={64} />
            <span className="match-detail__name">{match.homeTeam?.name}</span>
          </div>

          <div className="match-detail__score">
            {played && result ? (
              <>
                <span className={`score-num ${homeWin ? "score-num--win" : ""}`}>
                  {result.homeScore}
                </span>
                <span className="match-detail__sep">:</span>
                <span className={`score-num ${awayWin ? "score-num--win" : ""}`}>
                  {result.awayScore}
                </span>
              </>
            ) : (
              <span className="match-card__vs">VS</span>
            )}
          </div>

          <div className={`match-detail__team ${awayWin ? "is-winner" : ""}`}>
            <span className="match-detail__role">Visitante</span>
            <TeamLogo team={match.awayTeam} size={64} />
            <span className="match-detail__name">{match.awayTeam?.name}</span>
          </div>
        </div>

        <div className="match-detail__info">
          <span>📅 {formatLongDate(match.date)}</span>
          <span>🕒 {formatTime(match.time)}</span>
          <span>📍 {match.venue}</span>
        </div>
      </article>

      <h2 className="section-title" style={{ marginTop: 28 }}>
        Alineaciones
      </h2>
      <div className="lineups">
        <Lineup team={match.homeTeam} side="Local" played={played} mvpId={mvpId} />
        <Lineup team={match.awayTeam} side="Visitante" played={played} mvpId={mvpId} />
      </div>
    </div>
  );
}
