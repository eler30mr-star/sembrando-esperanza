import { Component } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Plans from './pages/Plans.jsx';
import PlanDetail from './pages/PlanDetail.jsx';
import Stories from './pages/Stories.jsx';
import StoryDetail from './pages/StoryDetail.jsx';
import Verses from './pages/Verses.jsx';
import Gallery from './pages/Gallery.jsx';
import Videos from './pages/Videos.jsx';
import Prayer from './pages/Prayer.jsx';
import AppPage from './pages/AppPage.jsx';
import NotFound from './pages/NotFound.jsx';

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Sembrando Esperanza render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          style={{
            minHeight: '100vh',
            padding: '36px 20px',
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(180deg, #fffaf1 0%, #ffffff 100%)',
            color: '#071d3a',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            textAlign: 'center'
          }}
        >
          <section style={{ maxWidth: 520 }}>
            <p style={{ margin: '0 0 10px', color: '#c58b24', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Sembrando Esperanza
            </p>
            <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(2rem, 9vw, 3.2rem)', lineHeight: 1.04 }}>
              Estamos restaurando la página
            </h1>
            <p style={{ margin: '0 0 22px', color: '#425066', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Recarga en unos segundos. La página ya tiene protección para no quedarse en blanco.
            </p>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 48,
                padding: '0 22px',
                borderRadius: 999,
                background: '#071d3a',
                color: '#ffffff',
                fontWeight: 800,
                textDecoration: 'none'
              }}
            >
              Volver al inicio
            </a>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/planes" element={<Plans />} />
          <Route path="/planes/:slug" element={<PlanDetail />} />
          <Route path="/historias" element={<Stories />} />
          <Route path="/historias/categoria/:categorySlug" element={<Stories />} />
          <Route path="/historias/:slug" element={<StoryDetail />} />
          <Route path="/versiculos" element={<Verses />} />
          <Route path="/imagenes" element={<Gallery />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/oracion" element={<Prayer />} />
          <Route path="/app" element={<AppPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </AppErrorBoundary>
  );
}
