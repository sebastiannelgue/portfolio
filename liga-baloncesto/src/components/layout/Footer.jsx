import { Link } from "react-router-dom";
import { LEAGUE } from "../../config";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <div className="footer__brand">{LEAGUE.name}</div>
          <div style={{ fontSize: "0.85rem" }}>
            {LEAGUE.season} · {LEAGUE.city}
          </div>
        </div>
        <nav className="flex gap-3 flex-wrap" style={{ fontSize: "0.9rem" }}>
          <Link to="/clasificacion">Clasificacion</Link>
          <Link to="/partidos">Partidos</Link>
          <Link to="/equipos">Equipos</Link>
          <Link to="/admin">Acceso admin</Link>
        </nav>
      </div>
    </footer>
  );
}
