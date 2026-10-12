import { useEffect, useState } from 'react';
import SectionHeader from '../components/SectionHeader.jsx';
import { getPublishedPrayers } from '../services/siteContentService.js';

export default function Prayer() {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getPublishedPrayers().then((items) => { if (active) setPrayers(items); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section className="section page prayer-page">
      <SectionHeader eyebrow="Hablar con Dios" title="Oraciones"
        description="Oraciones para iniciar el día, cerrar la noche y encontrar paz en momentos difíciles." align="center" />
      {loading ? <p className="managed-message">Cargando oraciones...</p>
        : prayers.length === 0 ? <p className="managed-message">Todavía no hay oraciones publicadas.</p>
        : <div className="prayer-list">
          {prayers.map((prayer) => (
            <article className="prayer-card" key={prayer.id}>
              <span>{prayer.moment}</span>
              <h3>{prayer.title}</h3>
              <p>{prayer.text}</p>
            </article>
          ))}
        </div>}
    </section>
  );
}
