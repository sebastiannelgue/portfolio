import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync";
import { getTeams } from "../../services/teamService";
import { getPlayers } from "../../services/playerService";
import { getMatches } from "../../services/matchService";
import { getSeasons } from "../../services/seasonService";
import { getCategories } from "../../services/categoryService";

import Loading from "../../components/ui/Loading";
import Alert from "../../components/ui/Alert";

const MANAGE_LINKS = [
  { to: "/admin/temporadas", icon: "📅", title: "Temporadas", text: "Crear años y elegir la temporada activa." },
  { to: "/admin/categorias", icon: "🏷️", title: "Categorías", text: "Torneos por categoria (U13, U15, U17...)." },
  { to: "/admin/equipos", icon: "🛡️", title: "Equipos", text: "Alta, edicion, escudo y plantel de cada club." },
  { to: "/admin/jugadores", icon: "🏃", title: "Jugadores", text: "Plantel de cada equipo por categoria." },
  { to: "/admin/partidos", icon: "🏀", title: "Partidos", text: "Programar encuentros y cargar resultados." }
];

export default function AdminDashboardPage() {
  const { admin } = useAuth();
  const teams = useAsync(getTeams, []);
  const players = useAsync(getPlayers, []);
  const matches = useAsync(() => getMatches(), []);
  const seasons = useAsync(getSeasons, []);
  const categories = useAsync(getCategories, []);

  const loading =
    teams.loading ||
    players.loading ||
    matches.loading ||
    seasons.loading ||
    categories.loading;
  const error =
    teams.error || players.error || matches.error || seasons.error || categories.error;

  const allMatches = matches.data || [];
  const playedCount = allMatches.filter((match) => match.status === "played").length;
  const scheduledCount = allMatches.filter((match) => match.status === "scheduled").length;

  const metrics = [
    { icon: "📅", label: "Temporadas", value: seasons.data?.length ?? 0 },
    { icon: "🏷️", label: "Categorías", value: categories.data?.length ?? 0 },
    { icon: "🛡️", label: "Equipos", value: teams.data?.length ?? 0 },
    { icon: "🏃", label: "Jugadores", value: players.data?.length ?? 0 },
    { icon: "📊", label: "Partidos jugados", value: playedCount },
    { icon: "🗓️", label: "Partidos programados", value: scheduledCount }
  ];

  return (
    <>
      <div className="admin-welcome section">
        <div>
          <h1>Hola, {admin?.username} 👋</h1>
          <p className="text-muted">
            Desde este panel gestionas equipos, jugadores, partidos y resultados.
          </p>
        </div>
        <Link to="/" className="btn btn--secondary btn--sm">
          Ver sitio publico
        </Link>
      </div>

      {error && (
        <div className="section">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {loading ? (
        <Loading label="Cargando resumen..." />
      ) : (
        <>
          <section className="section">
            <div className="metric-grid">
              {metrics.map((metric) => (
                <div key={metric.label} className="metric">
                  <span className="metric__icon" aria-hidden="true">
                    {metric.icon}
                  </span>
                  <div>
                    <div className="metric__value">{metric.value}</div>
                    <div className="metric__label">{metric.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Accesos de gestion</h2>
            <div className="grid grid--quick">
              {MANAGE_LINKS.map((item) => (
                <Link key={item.to} to={item.to} className="quick-card">
                  <span className="quick-card__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <span className="quick-card__link">Ingresar →</span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
