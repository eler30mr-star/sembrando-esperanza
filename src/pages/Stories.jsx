import { useEffect, useState } from 'react';
import SectionHeader from '../components/SectionHeader.jsx';
import ContentCard from '../components/ContentCard.jsx';
import { getPublishedStories } from '../services/storiesService.js';

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadStories() {
      const publishedStories = await getPublishedStories();
      if (!alive) return;
      setStories(publishedStories);
      setLoading(false);
    }

    loadStories();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="page section library-page">
      <SectionHeader
        eyebrow="Biblioteca de Esperanza"
        title="Historias y reflexiones"
        description="Lecturas cristianas con estilo elegante, pensadas para leerse con calma como páginas de un libro."
        align="center"
      />

      {loading && <p className="empty-copy">Cargando historias...</p>}

      <div className="card-grid two">
        {stories.map((story) => (
          <ContentCard
            key={story.slug}
            image={story.image}
            title={story.title}
            description={story.description}
            meta={`${story.category} · ${story.readingTime}`}
            to={`/historias/${story.slug}`}
            action="Leer historia"
            variant="book"
          />
        ))}
      </div>
    </section>
  );
}
