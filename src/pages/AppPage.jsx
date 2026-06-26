import { ExternalLink } from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';

const appsemUrl = import.meta.env.VITE_APPSEM_STORE_URL || 'https://appsem-store.vercel.app';

export default function AppPage() {
  return (
    <section className="section page app-page">
      <SectionHeader eyebrow="Biblia Universal" title="Una app cristiana para acompañar tu día" description="Acceso a la app desde Appsem Store, sin convertir esta página en una tienda." align="center" />
      <div className="app-showcase">
        <div>
          <span className="eyebrow">Creada por AppsMart Technology</span>
          <h2>Biblia Universal</h2>
          <p>Lee la Biblia, escucha audio, guarda versículos, escribe notas, registra oraciones y continúa tu crecimiento espiritual con una experiencia clara y moderna.</p>
          <a className="btn primary" href={appsemUrl} target="_blank" rel="noreferrer">
            Ver en Appsem Store <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
