import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <>
      <header className="navbar">
        <div className="container navbar__inner">
          <Link to="/" className="brand">
            <img src="/favicon.svg" className="brand__logo" alt="" aria-hidden="true" />
            <span className="brand__text">
              Panel de administracion
              <small>Liga de Baloncesto</small>
            </span>
          </Link>
          <div className="flex gap-3" style={{ alignItems: "center" }}>
            <span style={{ color: "#c9cbe0", fontSize: "0.9rem" }}>
              Hola, <strong style={{ color: "#fff" }}>{admin?.username}</strong>
            </span>
            <button className="btn btn--outline-light btn--sm" onClick={handleLogout}>
              Cerrar sesion
            </button>
          </div>
        </div>
      </header>

      <div className="admin-bar">
        <div className="container admin-tabs">
          <NavLink to="/admin" end>
            Resumen
          </NavLink>
          <NavLink to="/admin/temporadas">Temporadas</NavLink>
          <NavLink to="/admin/categorias">Categorías</NavLink>
          <NavLink to="/admin/equipos">Equipos</NavLink>
          <NavLink to="/admin/jugadores">Jugadores</NavLink>
          <NavLink to="/admin/partidos">Partidos</NavLink>
        </div>
      </div>

      <main className="container page">
        <Outlet />
      </main>
    </>
  );
}
