import { Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import PlanDetail from './pages/PlanDetail.jsx';
import Stories from './pages/Stories.jsx';
import StoryDetail from './pages/StoryDetail.jsx';
import Verses from './pages/Verses.jsx';
import Gallery from './pages/Gallery.jsx';
import Videos from './pages/Videos.jsx';
import Prayer from './pages/Prayer.jsx';
import AppPage from './pages/AppPage.jsx';
import NotFound from './pages/NotFound.jsx';

function StablePlansFallback() {
  return (
    <section className="page section" style={{ paddingTop: 32, paddingBottom: 120 }}>
      <span className="eyebrow">Caminos de fe</span>
      <h1 style={{ margin: '12px 0 10px', color: '#071d3a', fontFamily: 'Georgia, Times New Roman, serif', fontSize: 'clamp(3rem, 8vw, 5rem)', lineHeight: 0.95 }}>
        Planes Bíblicos
      </h1>
      <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '1.15rem', lineHeight: 1.45 }}>
        Lecturas guiadas para crecer cada día con la Palabra de Dios.
      </p>

      <div style={{ display: 'grid', gap: 18 }}>
        <Link
          to="/planes/cuando-dios-sostiene-tu-confianza"
          style={{
            display: 'block',
            overflow: 'hidden',
            color: 'inherit',
            background: '#ffffff',
            border: '1px solid rgba(7,29,58,.1)',
            borderRadius: 22,
            boxShadow: '0 18px 42px rgba(7,29,58,.1)',
            textDecoration: 'none'
          }}
        >
          <img
            src="/images/plans/cuando-dios-sostiene-tu-confianza.png"
            alt=""
            style={{ width: '100%', height: 210, objectFit: 'cover', display: 'block' }}
          />
          <div style={{ padding: 20 }}>
            <span style={{ color: '#c99a38', fontWeight: 900 }}>Fe · 7 días</span>
            <h2 style={{ margin: '8px 0', color: '#071d3a', fontSize: '1.7rem', lineHeight: 1.08 }}>
              Cuando Dios sostiene tu confianza
            </h2>
            <p style={{ margin: 0, color: '#64748b', lineHeight: 1.55 }}>
              Un plan bíblico para fortalecer una fe firme, madura y perseverante.
            </p>
            <strong style={{ display: 'inline-flex', marginTop: 14, color: '#0b6d62' }}>
              Comenzar →
            </strong>
          </div>
        </Link>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/planes" element={<StablePlansFallback />} />
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
  );
}
