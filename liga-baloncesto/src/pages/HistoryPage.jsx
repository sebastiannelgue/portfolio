import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getChampions } from "../services/standingService";

import TeamLogo from "../components/TeamLogo";
import Badge from "../components/ui/Badge";
import Loading from "../components/ui/Loading";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";

export default function HistoryPage() {
  useDocumentTitle("Históricos");
  const { data, loading, error } = useAsync(getChampions, []);

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Históricos y palmarés</h1>
        <p>
          Campeones de cada temporada y categoría, y los títulos acumulados por cada
          club a lo largo de la historia de la liga.
        </p>
      </header>

      {loading ? (
        <Loading label="Cargando históricos..." />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : (
        <>
          <section className="section">
            <h2 className="section-title">Palmarés · títulos por equipo</h2>
            {data.palmares.length === 0 ? (
              <EmptyState
                icon="🏆"
                title="Todavía no hay campeones"
                message="Cuando se cierre una temporada con resultados, aparecerán los títulos."
              />
            ) : (
              <div className="grid grid--cards">
                {data.palmares.map((team) => (
                  <div
                    key={team.teamId}
                    className="card card--pad flex gap-3"
                    style={{ alignItems: "center" }}
                  >
                    <TeamLogo team={team} size={48} />
                    <div>
                      <div className="cell-strong">{team.team}</div>
                      <div className="text-muted">
                        🏆 {team.titles} título{team.titles === 1 ? "" : "s"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="section">
            <h2 className="section-title">Campeones por temporada</h2>
            {data.champions.length === 0 ? (
              <EmptyState
                icon="📜"
                title="Sin historial"
                message="Todavía no hay torneos con partidos jugados."
              />
            ) : (
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Temporada</th>
                      <th>Categoría</th>
                      <th>Equipo</th>
                      <th>Puntos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.champions.map((champion) => (
                      <tr key={`${champion.seasonId}-${champion.category}`}>
                        <td className="cell-strong">{champion.season}</td>
                        <td>{champion.category}</td>
                        <td>
                          <span className="cell-team">
                            <TeamLogo team={champion} size={26} round />
                            {champion.team}
                            {champion.seasonActive ? (
                              <Badge variant="scheduled">Líder actual</Badge>
                            ) : (
                              <Badge variant="played">Campeón</Badge>
                            )}
                          </span>
                        </td>
                        <td className="cell-strong">{champion.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
