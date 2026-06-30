import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  Heart,
  Leaf,
  ShieldCheck,
  Sparkles,
  Users,
  Wind
} from 'lucide-react';
import { plans } from '../data/content.js';

const categories = [
  { label: 'Fe', icon: Heart, active: true },
  { label: 'Oración', icon: BookOpen },
  { label: 'Ansiedad', icon: Wind },
  { label: 'Paz', icon: Leaf },
  { label: 'Familia', icon: Users },
  { label: 'Gratitud', icon: ShieldCheck }
];

export default function Plans() {
  const featured = plans[0];
  const recommended = plans.slice(0, 3);
  const otherPlans = plans.slice(3);

  return (
    <section className="page section plans-web-page">
      <div className="plans-web-heading">
        <span className="eyebrow"><Sparkles size={15} /> Caminos de fe</span>
        <h1>Planes Bíblicos</h1>
        <p>Lecturas guiadas para crecer cada día con la Palabra de Dios.</p>
      </div>

      <Link className="plans-continue-card" to={`/planes/${featured.slug}`}>
        <div className="plans-continue-info">
          <span className="plans-kicker"><Sparkles size={16} /> Continúa tu plan</span>
          <h2>{featured.title}</h2>
          <div className="plans-progress-row" aria-label="57% completado">
            <span className="plans-progress"><span style={{ width: '57%' }} /></span>
            <strong>57%</strong>
          </div>
          <div className="plans-meta-line">
            <span><CalendarDays size={17} /> Día 4 de {featured.days.length}</span>
            <span><Clock3 size={17} /> {featured.time}</span>
          </div>
        </div>
        <div className="plans-continue-image" style={{ backgroundImage: `url(${featured.image})` }} />
        <span className="plans-continue-button">Continuar <ArrowRight size={18} /></span>
      </Link>

      <div className="plans-category-row" aria-label="Categorías de planes bíblicos">
        {categories.map(({ label, icon: Icon, active }) => (
          <button key={label} type="button" className={`plans-category-chip ${active ? 'active' : ''}`}>
            <Icon size={18} /> {label}
          </button>
        ))}
      </div>

      <div className="plans-section-title">
        <div>
          <span>Escogidos para ti</span>
          <h2>Recomendados para ti</h2>
        </div>
        <Link to="/planes" className="plans-see-all">Ver todos <ArrowRight size={17} /></Link>
      </div>

      <div className="plans-recommended-grid">
        {recommended.map((plan) => (
          <Link className="plan-recommend-card" to={`/planes/${plan.slug}`} key={plan.slug}>
            <div className="plan-recommend-image" style={{ backgroundImage: `url(${plan.image})` }}>
              <span className="plan-bookmark" aria-hidden="true">♡</span>
            </div>
            <div className="plan-recommend-body">
              <span className="plan-card-meta"><CalendarDays size={15} /> {plan.duration}</span>
              <h3>{plan.title}</h3>
              <p>{plan.description}</p>
              <strong>Comenzar <ArrowRight size={16} /></strong>
            </div>
          </Link>
        ))}
      </div>

      <div className="plans-section-title compact">
        <div>
          <span>Biblioteca</span>
          <h2>Todos los planes</h2>
        </div>
      </div>

      <div className="plans-list-grid">
        {otherPlans.map((plan) => (
          <Link className="plans-list-card" to={`/planes/${plan.slug}`} key={plan.slug}>
            <img src={plan.image} alt="" />
            <div>
              <span className="plan-card-meta">{plan.category} · {plan.duration}</span>
              <h3>{plan.title}</h3>
              <p>{plan.description}</p>
            </div>
            <span className="plans-arrow"><ArrowRight size={18} /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
