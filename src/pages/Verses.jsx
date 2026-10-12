import { useEffect, useState } from 'react';
import SectionHeader from '../components/SectionHeader.jsx';
import { getPublishedVerses } from '../services/siteContentService.js';

export default function Verses() {
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getPublishedVerses().then((items) => { if (active) setVerses(items); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section className="section page">
      <SectionHeader eyebrow="Palabra por tema" title="Versículos"
        description="Tarjetas bíblicas organizadas por temas para leer, meditar y compartir." align="center" />
      {loading ? <p className="managed-message">Cargando versículos...</p>
        : verses.length === 0 ? <p className="managed-message">Todavía no hay versículos publicados.</p>
        : <div className="verse-grid">
          {verses.map((verse) => (
            <article className="verse-card large" key={verse.id}>
              <span>{verse.theme}</span>
              <p>“{verse.text}”</p>
              <strong>{verse.reference}</strong>
            </article>
          ))}
        </div>}
    </section>
  );
}
