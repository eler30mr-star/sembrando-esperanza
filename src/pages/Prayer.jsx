import SectionHeader from '../components/SectionHeader.jsx';
import { prayers } from '../data/content.js';

export default function Prayer() {
  return (
    <section className="section page prayer-page">
      <SectionHeader eyebrow="Hablar con Dios" title="Oraciones" description="Oraciones para iniciar el día, cerrar la noche y encontrar paz en momentos difíciles." align="center" />
      <div className="prayer-list">
        {prayers.map((prayer) => (
          <article className="prayer-card" key={prayer.title}>
            <span>{prayer.moment}</span>
            <h3>{prayer.title}</h3>
            <p>{prayer.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
