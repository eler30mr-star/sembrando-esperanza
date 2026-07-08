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
        <main className="page section plans-web-page">
          <div className="plans-web-heading">
            <span className="eyebrow">Sembrando Esperanza</span>
            <h1>Estamos restaurando la página</h1>
            <p>Recarga en unos segundos. La navegación principal sigue disponible.</p>
            <a className="plans-see-all" href="/">Volver al inicio</a>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <Layout>
      <AppErrorBoundary>
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
      </AppErrorBoundary>
    </Layout>
  );
}
