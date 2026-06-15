import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Shirt, Calendar, Layers, Palette } from "lucide-react";

export function Sidebar() {
  const enlaces = [
    { to: "/sastre/dashboard", texto: "Dashboard", icono: <LayoutDashboard size={20} /> },
    { to: "/sastre/clientes",  texto: "Clientes",  icono: <Users size={20} /> },
    { to: "/sastre/prendas",   texto: "Prendas",   icono: <Shirt size={20} /> },
    { to: "/sastre/citas",     texto: "Citas",     icono: <Calendar size={20} /> },
    { to: "/sastre/telas",     texto: "Telas",     icono: <Layers size={20} /> },
    { to: "/sastre/estilos",   texto: "Estilos",   icono: <Palette size={20} /> },
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <h3>Panel Sastre</h3>
      </div>
      <nav className="sidebar-nav">
        {enlaces.map((enlace) => (
          <NavLink
            key={enlace.to}
            to={enlace.to}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">{enlace.icono}</span>
            <span className="sidebar-text">{enlace.texto}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
