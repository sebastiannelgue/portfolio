import { useAsync } from "../hooks/useAsync";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useLeague } from "../context/LeagueContext";
import { getStandings } from "../services/standingService";
import StandingsTable from "../components/StandingsTable";
import { SkeletonRows } from "../components/ui/Skeleton";
import Alert from "../components/ui/Alert";

export default function StandingsPage() {
  const { seasonId, category } = useLeague();
  useDocumentTitle(`Clasificación${category ? ` · ${category}` : ""}`);
  const { data, loading, error } = useAsync(
    () => getStandings(seasonId, category),
    [seasonId, category]
  );

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Clasificacion {category && `· ${category}`}</h1>
        <p>
          Tabla calculada automaticamente: 3 puntos por partido ganado, 1 por empate
          y 0 por derrota. Los empates se resuelven por diferencia de tantos y luego
          por tantos a favor.
        </p>
      </header>

      {loading ? (
        <SkeletonRows count={10} />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : (
        <>
          <StandingsTable rows={data} />
          <p className="text-muted mt-4" style={{ fontSize: "0.82rem" }}>
            Referencias: <strong>Pts</strong> puntos · <strong>PJ</strong> jugados ·{" "}
            <strong>PG</strong> ganados · <strong>PE</strong> empatados ·{" "}
            <strong>PP</strong> perdidos · <strong>TF</strong> tantos a favor ·{" "}
            <strong>TC</strong> tantos en contra · <strong>DIF</strong> diferencia de
            tantos.
          </p>
        </>
      )}
    </div>
  );
}
