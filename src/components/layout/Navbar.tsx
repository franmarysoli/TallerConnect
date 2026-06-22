import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Menu, X } from "lucide-react";
import { Logo } from "../common/Logo";

export function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link ${isActive ? 'active' : ''}`;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-header">
          <Link to="/" className="navbar-brand">
            <Logo size={32} />
            <span className="logo-text ml-2">TallerConnect</span>
          </Link>
          {usuario && (
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          )}
        </div>

        {usuario && (
          <div className={`navbar-menu ${isMenuOpen ? 'is-open' : ''}`}>
            {usuario.rol === "cliente" && (
              <div className="nav-links">
                <NavLink to="/cliente/inicio" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Inicio</NavLink>
                <NavLink to="/cliente/prendas" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Prendas</NavLink>
                <NavLink to="/cliente/medidas" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Medidas</NavLink>
                <NavLink to="/cliente/citas" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Citas</NavLink>
                <NavLink to="/cliente/perfil" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Mi Perfil</NavLink>
              </div>
            )}

            {usuario.rol === "sastre" && (
              <div className="nav-links sastre-nav-links">
                <NavLink to="/sastre/dashboard" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink>
                <NavLink to="/sastre/clientes" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Clientes</NavLink>
                <NavLink to="/sastre/prendas" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Prendas</NavLink>
                <NavLink to="/sastre/citas" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Citas</NavLink>
                <NavLink to="/sastre/telas" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Telas</NavLink>
                <NavLink to="/sastre/estilos" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Estilos</NavLink>
              </div>
            )}

            <div className="user-profile">
              <div className="avatar">
                {usuario.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{usuario.nombre}</span>
                <span className="user-role badge-role">{usuario.rol}</span>
              </div>
              <button
                onClick={() => { cerrarSesion(); setIsMenuOpen(false); }}
                className="btn btn-outline btn-sm ml-4"
                title="Cerrar sesión"
              >
                <LogOut size={16} /> Salir
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
