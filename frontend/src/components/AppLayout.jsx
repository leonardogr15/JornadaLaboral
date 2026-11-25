import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiClock, FiLogOut, FiUsers } from 'react-icons/fi';
import api from '../api';
import { roleLabel } from '../utils/format';
import { signOut, tokenRole } from '../utils/session';

export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <FiClock />
    </span>
  );
}

/** Shared header and page frame for the signed-in pages. */
export default function AppLayout({ title, children }) {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  // Navigation only: the API enforces the real role on every request.
  const esAdmin = tokenRole() === 'admin';

  useEffect(() => {
    document.title = `${title} · Jornada Laboral`;
  }, [title]);

  useEffect(() => {
    let activo = true;
    api
      .get('/usuarios/me')
      .then(({ data }) => {
        if (activo && data && data.nombre) setPerfil(data);
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, []);

  const cerrarSesion = () => {
    signOut();
    navigate('/');
  };

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/dashboard" className="brand">
            <BrandMark />
            Jornada Laboral
          </Link>
          <nav className="app-nav" aria-label="Principal">
            <NavLink to="/dashboard">
              <FiClock aria-hidden="true" /> Mis jornadas
            </NavLink>
            {esAdmin && (
              <NavLink to="/configuracion">
                <FiUsers aria-hidden="true" /> Usuarios
              </NavLink>
            )}
          </nav>
          <div className="app-user">
            {perfil && (
              <div className="app-user-name">
                <strong>{perfil.nombre}</strong>
                <span>{roleLabel(perfil.rol)}</span>
              </div>
            )}
            <button type="button" className="btn btn-header" onClick={cerrarSesion}>
              <FiLogOut aria-hidden="true" /> <span className="btn-label">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>
      <main id="contenido" className="app-main" tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
