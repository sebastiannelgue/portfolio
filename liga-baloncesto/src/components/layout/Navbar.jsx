import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { LEAGUE } from "../../config";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="brand" onClick={close}>
          <img src="/favicon.svg" className="brand__logo" alt="" aria-hidden="true" />
          <span className="brand__text">
            {LEAGUE.shortName}
            <small>{LEAGUE.season}</small>
          </span>
        </Link>

        <button
          className="nav-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-label="Abrir menu"
          aria-expanded={open}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <nav className={`nav-links ${open ? "is-open" : ""}`}>
          <NavLink to="/" end onClick={close}>
            Inicio
          </NavLink>
          <NavLink to="/clasificacion" onClick={close}>
            Clasificacion
          </NavLink>
          <NavLink to="/partidos" onClick={close}>
            Partidos
          </NavLink>
          <NavLink to="/equipos" onClick={close}>
            Equipos
          </NavLink>
          <NavLink to="/historicos" onClick={close}>
            Históricos
          </NavLink>
          <Link to="/admin" className="btn btn--primary btn--sm" onClick={close}>
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
