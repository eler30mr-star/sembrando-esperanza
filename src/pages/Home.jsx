import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, PlayCircle, Sparkles } from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import ContentCard from '../components/ContentCard.jsx';
import AppStoreCard from '../components/AppStoreCard.jsx';
import { getPublishedPlans } from '../services/plansService.js';
import { getPublishedStories } from '../services/storiesService.js';
import { getPublishedVideos } from '../services/videosService.js';
import { getPublishedAlbums, getPublishedVerses, getPublishedPrayers, getPublishedHomeSettings } from '../services/siteContentService.js';
import { selectFeatured } from '../services/contentSelectors.js';

const emptyContent = { plans: [], stories: [], videos: [], albums: [], verses: [], prayers: [], settings: null };

function priorityItems(items, featured, limit) {
  return [featured, ...items.filter((item) => item.id !== featured?.id)]
    .filter(Boolean).slice(0, limit);
}

export default function Home() {
  const [content, setContent] = useState(emptyContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([
      getPublishedPlans(), getPublishedStories(), getPublishedVideos(), getPublishedAlbums(),
      getPublishedVerses(), getPublishedPrayers(), getPublishedHomeSettings()
    ]).then(([plans, stories, videos, albums, verses, prayers, settings]) => {
      if (alive) setContent({ plans, stories, videos, albums, verses, prayers, settings });
    }).catch((error) => {
      console.error('Error cargando el contenido de inicio.', error);
    }).finally(() => {
      if (alive) setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  const { plans, stories, videos, albums, verses, prayers, settings } = content;
  const mainPlan = selectFeatured(plans, settings?.planFeatured);
  const mainStory = selectFeatured(stories, settings?.storyFeatured);
  const mainVideo = selectFeatured(videos, settings?.videoFeatured);
  const mainVerse = selectFeatured(verses, settings?.verseFeatured, ['id', 'reference']);
  const mainPrayer = prayers[0] || null;
  const featuredPlans = priorityItems(plans, mainPlan, 2);
  const featuredStories = priorityItems(stories, mainStory, 4);
  const featuredVerses = priorityItems(verses, mainVerse, 4);
  const featuredAlbums = albums.slice(0, 2);

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow"><Sparkles size={16} /> Comunidad cristiana</span>
          <h1>Sembrando Esperanza 🕊</h1>
          <p>Planes bíblicos, historias, versículos, imágenes cristianas, videos y oraciones para fortalecer tu fe cada día.</p>
          <div className="hero-actions">
            <Link className="btn primary" to="/planes">Ver planes</Link>
            <Link className="btn secondary" to="/historias">Leer historias</Link>
          </div>
        </div>
        <div className="hero-panel">
          <span>Versículo destacado</span>
          {mainVerse ? <>
            <h2>{mainVerse.text}</h2>
            <p>{mainVerse.reference}</p>
          </> : <h2>{loading ? 'Cargando contenido...' : 'Próximamente encontrarás nuevos versículos aquí.'}</h2>}
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Portada" title="Contenido para alimentar tu vida espiritual"
          description="Un resumen de todo lo que encontrarás en la comunidad. Entra a cada sección para leer, ver y compartir más contenido cristiano." />
        <div className="feature-grid">
          <Link to="/planes" className="feature-tile"><BookOpen /> Planes bíblicos <ArrowRight /></Link>
          <Link to="/historias" className="feature-tile"><BookOpen /> Historias y reflexiones <ArrowRight /></Link>
          <Link to="/videos" className="feature-tile"><PlayCircle /> Videos cristianos <ArrowRight /></Link>
        </div>
      </section>

      <section className="section soft-section">
        <SectionHeader eyebrow="Planes" title="Planes destacados" description="Lecturas organizadas por días para crecer con dirección espiritual." />
        <div className="card-grid two">
          {featuredPlans.map((plan) => (
            <ContentCard key={plan.id || plan.slug} image={plan.image} title={plan.title}
              description={plan.description} meta={`${plan.category} · ${plan.duration}`}
              to={`/planes/${plan.slug}`} action="Comenzar plan" />
          ))}
        </div>
        {!loading && !plans.length && <p className="managed-message">No hay planes publicados por ahora.</p>}
      </section>

      <section className="section">
        <SectionHeader eyebrow="Biblioteca" title="Historias y reflexiones" description="Lecturas con estilo de libro para meditar con calma." />
        <div className="card-grid two">
          {featuredStories.map((story) => (
            <ContentCard key={story.id || story.slug} image={story.image} title={story.title}
              description={story.description} meta={`${story.category} · ${story.readingTime}`}
              to={`/historias/${story.slug}`} action="Abrir lectura" variant="book" />
          ))}
        </div>
        {!loading && !stories.length && <p className="managed-message">Próximamente encontrarás nuevas historias.</p>}
      </section>

      <section className="section split-section">
        <div>
          <SectionHeader eyebrow="Versículos" title="Palabra para hoy" description="Versículos organizados por temas para acompañar tus momentos de fe." />
          <div className="verse-grid compact">
            {featuredVerses.map((item) => (
              <article className="verse-card" key={item.id}>
                <span>{item.theme}</span><p>“{item.text}”</p><strong>{item.reference}</strong>
              </article>
            ))}
          </div>
          {!loading && !verses.length && <p className="managed-message">Próximamente más versículos.</p>}
        </div>
        <div className="prayer-panel">
          <span className="eyebrow">Oración</span>
          <h2>{mainPrayer?.title || 'Oraciones'}</h2>
          <p>{mainPrayer?.text || (loading ? 'Cargando...' : 'Descubre nuevas oraciones en nuestra comunidad.')}</p>
          <Link className="text-link" to="/oracion">Ver más oraciones</Link>
        </div>
      </section>

      <section className="section soft-section">
        <SectionHeader eyebrow="Multimedia" title="Imágenes y videos" description="Galerías visuales y enlaces cristianos organizados para compartir y edificar." />
        <div className="card-grid three">
          {featuredAlbums.map((album) => (
            <ContentCard key={album.id} image={album.image} title={album.title}
              description={album.description} meta={`${album.count} imágenes`} to="/galeria" action="Ver álbum" />
          ))}
          {mainVideo && <ContentCard key={mainVideo.id} image={mainVideo.thumbnail} title={mainVideo.title}
            description={mainVideo.description} meta={mainVideo.category} to="/videos" action="Ver videos" />}
        </div>
        {!loading && !albums.length && !mainVideo && <p className="managed-message">Próximamente encontrarás imágenes y videos.</p>}
      </section>

      <section className="section"><AppStoreCard /></section>
    </>
  );
}
