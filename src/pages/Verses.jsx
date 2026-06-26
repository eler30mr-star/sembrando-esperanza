import SectionHeader from '../components/SectionHeader.jsx';
import { verses } from '../data/content.js';

export default function Verses() {
  return (
    <section className="section page">
      <SectionHeader eyebrow="Palabra por tema" title="Versículos" description="Tarjetas bíblicas organizadas por temas para leer, meditar y compartir." align="center" />
      <div className="verse-grid">
        {verses.map((verse) => (
          <article className="verse-card large" key={verse.reference}>
            <span>{verse.theme}</span>
            <p>“{verse.text}”</p>
            <strong>{verse.reference}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
