import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  ListChecks,
  NotebookPen,
  Sparkles,
  Target,
  Trophy
} from 'lucide-react';
import { plans } from '../data/content.js';

export default function PlanDetail() {
  const { slug } = useParams();
  const plan = plans.find((item) => item.slug === slug);
  const [screen, setScreen] = useState('overview');
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [completedDays, setCompletedDays] = useState([]);

  const totalDays = plan?.days.length ?? 0;
  const progress = totalDays ? Math.round((completedDays.length / totalDays) * 100) : 0;
  const activeDay = plan?.days[activeDayIndex];
  const recommendedPlan = useMemo(() => plans.find((item) => item.slug !== slug) ?? plans[0], [slug]);

  if (!plan) {
    return (
      <section className="section page not-found">
        <h1>Plan no encontrado</h1>
        <Link className="btn secondary" to="/planes">Volver a planes</Link>
      </section>
    );
  }

  function openDay(index) {
    setActiveDayIndex(index);
    setScreen('reading');
  }

  function completeDay() {
    const nextCompleted = completedDays.includes(activeDayIndex)
      ? completedDays
      : [...completedDays, activeDayIndex].sort((a, b) => a - b);

    setCompletedDays(nextCompleted);

    if (nextCompleted.length >= totalDays) {
      setScreen('complete');
      return;
    }

    setActiveDayIndex(Math.min(activeDayIndex + 1, totalDays - 1));
    setScreen('days');
  }

  function startPlan() {
    setScreen('days');
  }

  return (
    <section className="page section plan-experience-page">
      {screen === 'overview' && (
        <>
          <Link className="back-link" to="/planes"><ArrowLeft size={17} /> Volver a planes</Link>
          <div className="plan-overview-layout">
            <article className="plan-overview-cover" style={{ backgroundImage: `url(${plan.image})` }}>
              <span className="plan-cover-chip"><Sparkles size={16} /> {plan.category}</span>
              <h1>{plan.title}</h1>
              <div className="plans-progress-row" aria-label={`${progress}% completado`}>
                <span className="plans-progress"><span style={{ width: `${Math.max(progress, 8)}%` }} /></span>
                <strong>{progress}% completado</strong>
              </div>
              <div className="plans-meta-line">
                <span><CalendarDays size={18} /> {plan.duration}</span>
                <span><Clock3 size={18} /> {plan.time}</span>
              </div>
            </article>

            <div className="plan-overview-content">
              <div className="plan-description-card">
                <p>{plan.description}</p>
                <span aria-hidden="true" className="plan-big-mark">✝</span>
              </div>

              <div className="plan-learning-card">
                <h2>En este plan aprenderás</h2>
                <ul>
                  {plan.learning.map((item) => (
                    <li key={item}><Check size={17} /> {item}</li>
                  ))}
                </ul>
                <div className="plan-action-stack">
                  <button className="plan-btn plan-btn-gold" type="button" onClick={startPlan}>
                    Comenzar plan <ArrowRight size={19} />
                  </button>
                  <button className="plan-btn plan-btn-secondary" type="button">
                    <Bookmark size={18} /> Guardar plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {screen === 'days' && (
        <div className="plan-days-screen">
          <button className="round-back" type="button" onClick={() => setScreen('overview')} aria-label="Volver al detalle">
            <ArrowLeft size={20} />
          </button>
          <div className="plan-days-header">
            <h1>{plan.title}</h1>
            <div className="plan-wide-progress">
              <span><span style={{ width: `${progress}%` }} /></span>
              <strong>{progress}%</strong>
            </div>
            <p><CalendarDays size={17} /> Día {Math.min(completedDays.length + 1, totalDays)} de {totalDays}</p>
            <small>Cada día que eliges la Palabra, tu fe se fortalece y tu vida se transforma.</small>
          </div>

          <div className="plan-day-list">
            {plan.days.map((day, index) => {
              const completed = completedDays.includes(index);
              const current = !completed && index === Math.min(completedDays.length, totalDays - 1);
              return (
                <button
                  key={`${day.title}-${index}`}
                  type="button"
                  className={`plan-day-row ${completed ? 'completed' : ''} ${current ? 'current' : ''}`}
                  onClick={() => openDay(index)}
                >
                  <span className="plan-day-icon">{completed ? <CheckCircle2 /> : current ? <BookOpen /> : <CalendarDays />}</span>
                  <span className="plan-day-copy">
                    <small>Día {index + 1}</small>
                    <strong>{day.title}</strong>
                    <em>{day.subtitle}</em>
                  </span>
                  <span className="plan-day-status">{completed ? 'Completado' : current ? 'Hoy' : 'Pendiente'}</span>
                  <ArrowRight className="plan-day-arrow" size={18} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {screen === 'reading' && activeDay && (
        <article className="plan-reading-screen">
          <button className="round-back" type="button" onClick={() => setScreen('days')} aria-label="Volver a los días">
            <ArrowLeft size={20} />
          </button>

          <header className="plan-reading-header">
            <span><CalendarDays size={17} /> Día {activeDayIndex + 1} de {totalDays}</span>
            <div className="mini-progress"><span style={{ width: `${Math.max(progress, 10)}%` }} /></div>
            <p>{plan.title}</p>
            <h1>{activeDay.title}</h1>
          </header>

          <section className="verse-reading-card">
            <span className="verse-reading-icon"><BookOpen size={28} /></span>
            <div>
              <h2>{activeDay.verse}</h2>
              <blockquote>“{activeDay.verseText}”</blockquote>
            </div>
          </section>

          <section className="reading-block reflection-block">
            <span className="reading-floating-icon">❧</span>
            <div>
              <h2>Reflexión</h2>
              {activeDay.text.split('\n\n').map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section className="reading-block prayer-block">
            <span className="reading-round-icon">🙏</span>
            <div>
              <h2>Oración del día</h2>
              <p>{activeDay.prayer}</p>
            </div>
          </section>

          <section className="reading-block action-block">
            <span className="reading-round-icon"><Target size={28} /></span>
            <div>
              <h2>Acción de hoy</h2>
              <p>{activeDay.action}</p>
            </div>
          </section>

          <div className="plan-reading-actions">
            <button className="plan-btn plan-btn-gold" type="button" onClick={completeDay}>
              <CheckCircle2 size={21} /> Marcar como completado
            </button>
            <button className="plan-text-action" type="button"><NotebookPen size={18} /> Agregar nota</button>
          </div>
        </article>
      )}

      {screen === 'complete' && (
        <section className="plan-complete-screen">
          <div className="complete-hero" style={{ backgroundImage: `url(${plan.image})` }}>
            <button className="round-back" type="button" onClick={() => setScreen('days')} aria-label="Volver a los días">
              <ArrowLeft size={20} />
            </button>
          </div>
          <div className="complete-content-card">
            <span className="complete-badge"><Trophy size={28} /></span>
            <h1>¡Plan completado!</h1>
            <p>Has terminado {plan.title}. Dios ha sido fiel en este tiempo contigo.</p>
            <strong className="complete-days"><CheckCircle2 size={19} /> {totalDays} de {totalDays} días</strong>
          </div>

          <div className="complete-gains-card">
            <h2>Lo que has ganado</h2>
            {(plan.gains ?? ['Más confianza en Dios', 'Constancia en la oración', 'Palabra aplicada cada día']).map((item) => (
              <p key={item}><ListChecks size={19} /> {item}</p>
            ))}
          </div>

          <div className="complete-actions">
            <Link className="plan-btn plan-btn-gold" to="/planes">Comenzar otro plan <ArrowRight size={19} /></Link>
            <button className="plan-btn plan-btn-secondary" type="button"><NotebookPen size={18} /> Ver mis notas</button>
          </div>

          <Link className="complete-next-card" to={`/planes/${recommendedPlan.slug}`}>
            <img src={recommendedPlan.image} alt="" />
            <span>
              <small>Recomendado para seguir</small>
              <strong>{recommendedPlan.title}</strong>
              <em>{recommendedPlan.duration}</em>
            </span>
            <ArrowRight size={18} />
          </Link>
        </section>
      )}
    </section>
  );
}
