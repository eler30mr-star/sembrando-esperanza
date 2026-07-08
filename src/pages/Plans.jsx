import { useEffect, useMemo, useState } from 'react';
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
import { getPublishedPlans } from '../services/plansService.js';

const categories = [
  { label: 'Fe', icon: Heart, active: true },
  { label: 'Oración', icon: BookOpen },
  { label: 'Ansiedad', icon: Wind },
  { label: 'Paz', icon: Leaf },
  { label: 'Familia', icon: Users },
  { label: 'Gratitud', icon: ShieldCheck }
];

function storageKey(slug) {
  return `sembrando-plan-progress-${slug}`;
}

function readPlanProgress(slug) {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function completedCount(progress) {
  return Array.isArray(progress?.completedDays) ? progress.completedDays.length : 0;
}

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressMap, setProgressMap] = useState({});

  useEffect(() => {
    let alive = true;

    async function loadPlans() {
      const publishedPlans = await getPublishedPlans();
      if (!alive) return;
      setPlans(publishedPlans);
      setLoading(false);
    }

    loadPlans();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const nextProgress = {};
    plans.forEach((plan) => {
      const saved = readPlanProgress(plan.slug);
      if (saved) nextProgress[plan.slug] = saved;
    });
    setProgressMap(nextProgress);
  }, [plans]);

  const featured = useMemo(() => {
    const activePlan = plans.find((plan) => {
      const progress = progressMap[plan.slug];
      const count = completedCount(progress);
      const total = plan.dayCount || plan.days?.length || 0;
      return count > 0 && count < total;
    });

    return activePlan || plans[0] || null;
  }, [plans, progressMap]);

  const featuredProgress = featured ? progressMap[featured.slug] : null;
  const featuredCompleted = completedCount(featuredProgress);
  const featuredTotalDays = featured?.dayCount || featured?.days?.length || 0;
  const featuredPercent = featuredTotalDays ? Math.round((featuredCompleted / featuredTotalDays) * 100) : 0;
  const featuredDay = featuredTotalDays ? Math.min(featuredCompleted + 1, featuredTotalDays) : 0;
  const hasStarted = featuredCompleted > 0;
  const recommended = plans.slice(0, 3);
  const otherPlans = plans.slice(3);

  if (loading) {
    return (
      <section className="page section plans-web-page">
        <div className="plans-web-heading">
          <span className="eyebrow"><Sparkles size={15} /> Caminos de fe</span>
          <h1>Planes Bíblicos</h1>
          <p>Cargando planes...</p>
        </div>
      </section>
    );
  }

  if (!plans.length) {
    return (
      <section className="page section plans-web-page">
        <div className="plans-web-heading">
          <span className="eyebrow"><Sparkles size={15} /> Caminos de fe</span>
          <h1>Planes Bíblicos</h1>
          <p>Aún no hay planes publicados. Crea y publica un plan desde el panel administrador.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page section plans-web-page">
      <div className="plans-web-heading">
        <span className="eyebrow"><Sparkles size={15} /> Caminos de fe</span>
        <h1>Planes Bíblicos</h1>
        <p>Lecturas guiadas para crecer cada día con la Palabra de Dios.</p>
      </div>

      {featured && (
        <Link className="plans-continue-card" to={`/planes/${featured.slug}`}>
          <img className="plans-continue-cover" src={featured.image} alt="" loading="eager" />
          <div className="plans-continue-info">
            <span className="plans-kicker"><Sparkles size={16} /> {hasStarted ? 'Continúa tu plan' : 'Empieza un plan'}</span>
            <h2>{featured.title}</h2>
            <div className="plans-progress-row" aria-label={`${featuredPercent}% completado`}>
              <span className="plans-progress"><span style={{ width: `${Math.max(featuredPercent, hasStarted ? 8 : 0)}%` }} /></span>
              <strong>{featuredPercent}%</strong>
            </div>
            <div className="plans-meta-line">
              <span><CalendarDays size={17} /> Día {featuredDay} de {featuredTotalDays}</span>
              <span><Clock3 size={17} /> {featured.time}</span>
            </div>
          </div>
          <span className="plans-continue-button">{hasStarted ? 'Continuar' : 'Comenzar'} <ArrowRight size={18} /></span>
        </Link>
      )}

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
              <strong>{completedCount(progressMap[plan.slug]) ? 'Continuar' : 'Comenzar'} <ArrowRight size={16} /></strong>
            </div>
          </Link>
        ))}
      </div>

      {otherPlans.length > 0 && (
        <>
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
        </>
      )}
    </section>
  );
}
