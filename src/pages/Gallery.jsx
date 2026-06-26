import SectionHeader from '../components/SectionHeader.jsx';
import ContentCard from '../components/ContentCard.jsx';
import { albums } from '../data/content.js';

export default function Gallery() {
  return (
    <section className="section page">
      <SectionHeader eyebrow="Álbumes de fe" title="Imágenes cristianas" description="Álbumes con frases, versículos y fondos espirituales para compartir en redes." align="center" />
      <div className="card-grid three">
        {albums.map((album) => (
          <ContentCard key={album.title} image={album.image} title={album.title} description={album.description} meta={`${album.count} imágenes`} />
        ))}
      </div>
    </section>
  );
}
