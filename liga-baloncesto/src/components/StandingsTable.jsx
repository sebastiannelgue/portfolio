import { useNavigate } from "react-router-dom";
import EmptyState from "./ui/EmptyState";
import TeamLogo from "./TeamLogo";

function formatDiff(value) {
  return value > 0 ? `+${value}` : String(value);
}

// Tabla de clasificacion. En modo `compact` oculta TF/TC (para previews chicas).
export default function StandingsTable({ rows, compact = false }) {
  const navigate = useNavigate();

  if (!rows || rows.length === 0) {
    return (
      <EmptyState
        icon="🏀"
        title="Sin clasificacion todavia"
        message="Cuando se carguen resultados, la tabla se calculara automaticamente."
      />
    );
  }

  return (
    <div className="table-wrap">
      <table className="data data--clickable">
        <thead>
          <tr>
            <th>#</th>
            <th>Equipo</th>
            <th>Pts</th>
            <th>PJ</th>
            <th>PG</th>
            <th>PE</th>
            <th>PP</th>
            {!compact && (
              <>
                <th>TF</th>
                <th>TC</th>
              </>
            )}
            <th>DIF</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.teamId}
              onClick={() => navigate(`/equipos/${row.teamId}`)}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate(`/equipos/${row.teamId}`);
              }}
            >
              <td>
                <span
                  className={`pos ${row.position <= 3 ? `pos--${row.position}` : ""}`}
                >
                  {row.position}
                </span>
              </td>
              <td>
                <span className="cell-team">
                  <TeamLogo
                    team={{ name: row.team, logoUrl: row.logoUrl }}
                    size={26}
                    round
                  />
                  {row.team}
                </span>
              </td>
              <td className="cell-strong">{row.points}</td>
              <td>{row.played}</td>
              <td>{row.won}</td>
              <td>{row.drawn}</td>
              <td>{row.lost}</td>
              {!compact && (
                <>
                  <td>{row.pointsFor}</td>
                  <td>{row.pointsAgainst}</td>
                </>
              )}
              <td className="cell-strong">{formatDiff(row.pointDifference)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
