import SectionHeader from '../components/SectionHeader.jsx';
import ContentCard from '../components/ContentCard.jsx';
import { plans } from '../data/content.js';

export default function Plans() {
  return (
    <section className="page section">
      <SectionHeader
        eyebrow="Caminos de fe"
        title="Planes bíblicos"
        description="Devocionales organizados por días. Cada plan contiene versículo, reflexión, oración y una acción práctica."
        align="center"
      />
      <div className="card-grid two">
        {plans.map((plan) => (
          <ContentCard
            key={plan.slug}
            image={plan.image}
            title={plan.title}
            description={plan.description}
            meta={`${plan.category} · ${plan.duration}`}
            to={`/planes/${plan.slug}`}
            action="Comenzar plan"
          />
        ))}
      </div>
    </section>
  );
}
