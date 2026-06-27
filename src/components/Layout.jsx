import { Link, NavLink } from 'react-router-dom';
import { LogIn, LogOut, Menu, X, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { listenToUser, loginWithGoogle, logout } from '../services/authService.js';

const navItems = [
  { to: '/', label: 'Inicio' },
  { to: '/planes', label: 'Planes' },
  { to: '/historias', label: 'Historias' },
  { to: '/versiculos', label: 'Versículos' },
  { to: '/imagenes', label: 'Imágenes' },
  { to: '/videos', label: 'Videos' },
  { to: '/oracion', label: 'Oración' },
  { to: '/app', label: 'App' }
];

const authButtonStyle = {
  border: '1px solid rgba(120, 79, 23, 0.2)',
  borderRadius: '999px',
  padding: '9px 13px',
  background: '#fff8ea',
  color: '#5a3b12',
  fontWeight: 800,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '7px',
  cursor: 'pointer'
};

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => listenToUser(setUser), []);

  async function handleAuthClick() {
    if (user) {
      await logout();
    } else {
      await loginWithGoogle();
    }
    setOpen(false);
  }

  return (
    <div className="site-shell">
      <header className="header">
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          <span className="brand-icon" aria-hidden="true">🕊</span>
          <span>
            <strong>Sembrando Esperanza</strong>
            <small>Contenido cristiano diario</small>
          </span>
        </Link>

        <button className="menu-button" type="button" onClick={() => setOpen(!open)} aria-label="Abrir menú">
          {open ? <X /> : <Menu />}
        </button>

        <nav className={`nav ${open ? 'nav-open' : ''}`}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>
              {item.label}
            </NavLink>
          ))}
          <button type="button" style={authButtonStyle} onClick={handleAuthClick}>
            {user ? <LogOut size={16} /> : <LogIn size={16} />}
            {user ? 'Salir' : 'Iniciar con Google'}
          </button>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="footer">
        <div>
          <h3>Sembrando Esperanza 🕊</h3>
          <p>Una comunidad cristiana creada para compartir planes bíblicos, historias, versículos, imágenes, videos y oración.</p>
        </div>
        <div className="footer-links">
          <Link to="/planes">Planes</Link>
          <Link to="/historias">Historias</Link>
          <Link to="/app">Biblia Universal</Link>
        </div>
        <div className="footer-note">
          <Heart size={16} /> Creado por AppsMart Technology
        </div>
      </footer>
    </div>
  );
}
