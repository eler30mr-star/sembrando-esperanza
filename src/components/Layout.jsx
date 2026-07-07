import { Link, NavLink } from 'react-router-dom';
import {
  BookOpen,
  Heart,
  Home,
  Images,
  LogIn,
  LogOut,
  Menu,
  MessageCircleHeart,
  PlayCircle,
  ScrollText,
  X
} from 'lucide-react';
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

const bottomNavItems = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/planes', label: 'Planes', icon: BookOpen },
  { to: '/historias', label: 'Historias', icon: ScrollText },
  { to: '/imagenes', label: 'Imágenes', icon: Images },
  { to: '/oracion', label: 'Orar', icon: MessageCircleHeart }
];

const moreNavItems = [
  { to: '/versiculos', label: 'Versículos', icon: Heart },
  { to: '/videos', label: 'Videos', icon: PlayCircle },
  { to: '/app', label: 'Biblia Universal', icon: BookOpen }
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
    <div className="app-viewport-shell">
      <div className="site-shell mobile-app-frame">
        <header className="header app-header">
          <Link className="brand" to="/" onClick={() => setOpen(false)}>
            <span className="brand-icon" aria-hidden="true">🕊</span>
            <span>
              <strong>Sembrando Esperanza</strong>
              <small>Comunidad cristiana</small>
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

        <main className="app-scroll-content">{children}</main>

        <footer className="footer app-footer">
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

        <nav className="app-bottom-nav" aria-label="Navegación principal">
          {bottomNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}>
              <Icon size={21} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={`app-more-panel ${open ? 'open' : ''}`}>
          {moreNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          <button type="button" onClick={handleAuthClick}>
            {user ? <LogOut size={17} /> : <LogIn size={17} />}
            {user ? 'Salir' : 'Iniciar con Google'}
          </button>
        </div>
      </div>
    </div>
  );
}
