import SectionHeader from '../components/SectionHeader.jsx';
import ContentCard from '../components/ContentCard.jsx';
import { stories } from '../data/content.js';

export default function Stories() {
  return (
    <section className="page section library-page">
      <SectionHeader
        eyebrow="Biblioteca de Esperanza"
        title="Historias y reflexiones"
        description="Lecturas cristianas con estilo elegante, pensadas para leerse con calma como páginas de un libro."
        align="center"
      />
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
