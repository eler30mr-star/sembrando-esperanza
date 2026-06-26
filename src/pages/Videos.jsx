import { ExternalLink, PlayCircle } from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import { videos } from '../data/content.js';

export default function Videos() {
  return (
    <section className="section page">
      <SectionHeader eyebrow="Galería audiovisual" title="Videos cristianos" description="Visualización con miniaturas, descripciones cortas y botones hacia los enlaces externos." align="center" />
      <div className="video-grid">
        {videos.map((video) => (
          <article className="video-card" key={video.title}>
            <div className="video-thumb">
              <img src={video.thumbnail} alt={video.title} loading="lazy" />
              <span><PlayCircle size={42} /></span>
            </div>
            <div className="video-body">
              <span className="card-meta">{video.category}</span>
              <h3>{video.title}</h3>
              <p>{video.description}</p>
              <a className="btn secondary" href={video.url} target="_blank" rel="noreferrer">
                Abrir video <ExternalLink size={16} />
              </a>
            </div>
          </article>
        ))}
      </div>
      <p className="content-disclaimer">Los videos enlazados desde plataformas externas pertenecen a sus respectivos propietarios.</p>
    </section>
  );
}
