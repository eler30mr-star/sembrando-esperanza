import { Link, NavLink } from 'react-router-dom';
import {
  BookOpen,
  GalleryHorizontalEnd,
  Heart,
  Home,
  LogIn,
  LogOut,
  UserRound,
  Menu,
  MessageCircleHeart,
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
  { to: '/galeria', label: 'Galería' },
  { to: '/oracion', label: 'Oración' },
  { to: '/app', label: 'App' }
];

const bottomNavItems = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/planes', label: 'Planes', icon: BookOpen },
  { to: '/historias', label: 'Historias', icon: ScrollText },
  { to: '/galeria', label: 'Galería', icon: GalleryHorizontalEnd },
  { to: '/oracion', label: 'Orar', icon: MessageCircleHeart }
];

const moreNavItems = [
  { to: '/versiculos', label: 'Versículos', icon: Heart },
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [authError, setAuthError] = useState('');
  const account = user && !user.isAnonymous ? user : null;

  useEffect(() => listenToUser(setUser), []);

  async function handleGoogleLogin() {
    setAuthError('');
    try {
      await loginWithGoogle();
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setAuthError('No se pudo iniciar sesión con Google: ' + error.message);
      }
    }
  }

  async function handleLogout() {
    setAuthError('');
    try { await logout(); }
    catch (error) { setAuthError('No se pudo cerrar sesión: ' + error.message); }
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

          <button type="button" className="profile-trigger" aria-label="Mi perfil"
            onClick={() => { setProfileOpen(!profileOpen); setOpen(false); }}>
            {account?.photoURL
              ? <img src={account.photoURL} alt="" referrerPolicy="no-referrer" />
              : <UserRound size={22} />}
          </button>

          <button className="menu-button" type="button" onClick={() => setOpen(!open)} aria-label="Abrir menú">
            {open ? <X /> : <Menu />}
          </button>

          <nav className={`nav ${open ? 'nav-open' : ''}`}>
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
            <button type="button" style={authButtonStyle} onClick={() => { setProfileOpen(true); setOpen(false); }}>
              <UserRound size={16} /> Mi perfil
            </button>
          </nav>
        </header>

        {profileOpen && (
          <div className="profile-backdrop" onClick={() => setProfileOpen(false)}>
            <section className="profile-panel" role="dialog" aria-modal="true" aria-label="Mi perfil"
              onClick={(event) => event.stopPropagation()}>
              <div className="profile-panel-heading">
                <strong>Mi perfil</strong>
                <button type="button" aria-label="Cerrar perfil" onClick={() => setProfileOpen(false)}><X size={20} /></button>
              </div>
              <div className="profile-account">
                {account?.photoURL ? <img src={account.photoURL} alt="Foto de perfil" referrerPolicy="no-referrer" />
                  : <div className="profile-placeholder"><UserRound size={27} /></div>}
                <div>
                  <strong>{account?.displayName || 'Visitante'}</strong>
                  <small>{account?.email || 'Explora sin registrarte'}</small>
                </div>
              </div>
              <p className="profile-description">
                {account ? 'Tu cuenta de Google está conectada. Puedes comentar historias y reaccionar.'
                  : 'Puedes leer y dar Me gusta sin registrarte. Para comentar, inicia sesión con Google.'}
              </p>
              {authError && <p className="profile-error" role="alert">{authError}</p>}
              {account ? (
                <button className="profile-action secondary" type="button" onClick={handleLogout}>
                  <LogOut size={18} /> Cerrar sesión
                </button>
              ) : (
                <button className="profile-action" type="button" onClick={handleGoogleLogin}>
                  <LogIn size={18} /> Continuar con Google
                </button>
              )}
            </section>
          </div>
        )}

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
          <button type="button" onClick={() => { setProfileOpen(true); setOpen(false); }}>
            <UserRound size={17} /> Mi perfil
          </button>
        </div>
      </div>
    </div>
  );
}
