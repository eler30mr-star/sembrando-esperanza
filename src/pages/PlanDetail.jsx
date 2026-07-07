import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  HandHeart,
  NotebookPen,
  Shield,
  Sparkles,
  Target,
  Trophy
} from 'lucide-react';
import { getPublishedPlanBySlug, getPublishedPlans } from '../services/plansService.js';

function storageKey(slug) {
  return `sembrando-plan-progress-${slug}`;
}

function readSavedProgress(slug) {
  if (typeof window === 'undefined' || !slug) return null;

  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProgress(slug, data) {
  if (typeof window === 'undefined' || !slug) return;

  window.localStorage.setItem(storageKey(slug), JSON.stringify({
    ...data,
    updatedAt: new Date().toISOString()
  }));
}

function uniqueSortedDays(days) {
  return [...new Set(days.map(Number).filter((day) => Number.isInteger(day) && day >= 0))]
    .sort((a, b) => a - b);
}

function normalizeDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date();
  return date;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function formatPlanDate(date) {
  return new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long'
  }).format(date);
}

function getGainItems(plan) {
  const gains = Array.isArray(plan?.gains)
    ? plan.gains.map((gain) => String(gain || '').trim()).filter(Boolean)
    : [];

  const icons = [Shield, HandHeart, BookOpen];
  return gains.map((gain, index) => ({ gain, Icon: icons[index] || CheckCircle2 }));
}

export default function PlanDetail() {
  const { slug } = useParams();
  const [plan, setPlan] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('overview');
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [completedDays, setCompletedDays] = useState([]);
  const [savedPlan, setSavedPlan] = useState(false);
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());

  useEffect(() => {
    let alive = true;

    async function loadPlan() {
      setLoading(true);
      const [selectedPlan, publishedPlans] = await Promise.all([
        getPublishedPlanBySlug(slug),
        getPublishedPlans()
      ]);

      if (!alive) return;
      setPlan(selectedPlan);
      setAllPlans(publishedPlans);
      setLoading(false);
    }

    loadPlan();
    return () => { alive = false; };
  }, [slug]);

  const totalDays = plan?.days.length ?? 0;
  const progress = totalDays ? Math.round((completedDays.length / totalDays) * 100) : 0;
  const nextDayIndex = totalDays ? Math.min(completedDays.length, totalDays - 1) : 0;
  const activeDay = plan?.days[activeDayIndex];
  const startDate = normalizeDate(startedAt);
  const recommendedPlan = useMemo(() => allPlans.find((item) => item.slug !== slug) ?? allPlans[0] ?? null, [slug, allPlans]);
  const gainItems = getGainItems(plan);

  useEffect(() => {
    if (!slug || !plan) return;

    const saved = readSavedProgress(slug);
    if (!saved) return;

    const validCompletedDays = uniqueSortedDays(saved.completedDays || [])
      .filter((day) => day < plan.days.length);

    setCompletedDays(validCompletedDays);
    setSavedPlan(Boolean(saved.savedPlan));
    setStartedAt(saved.startedAt || new Date().toISOString());
    setActiveDayIndex(
      Number.isInteger(saved.lastDayIndex)
        ? Math.min(Math.max(saved.lastDayIndex, 0), plan.days.length - 1)
        : Math.min(validCompletedDays.length, plan.days.length - 1)
    );

    if (validCompletedDays.length >= plan.days.length && plan.days.length > 0) {
      setScreen('complete');
    }
  }, [slug, plan]);

  if (loading) {
    return (
      <section className="section page not-found">
        <h1>Cargando plan...</h1>
      </section>
    );
  }

  if (!plan) {
    return (
      <section className="section page not-found">
        <h1>Plan no encontrado</h1>
        <Link className="btn secondary" to="/planes">Volver a planes</Link>
      </section>
    );
  }

  function persist(nextCompletedDays, nextLastDayIndex = activeDayIndex, nextSavedPlan = savedPlan) {
    const finalCompletedDays = uniqueSortedDays(nextCompletedDays).filter((day) => day < totalDays);
    const saved = readSavedProgress(slug);
    const finalStartedAt = saved?.startedAt || startedAt || new Date().toISOString();
    setStartedAt(finalStartedAt);

    saveProgress(slug, {
      planSlug: slug,
      planTitle: plan.title,
      completedDays: finalCompletedDays,
      lastDayIndex: Math.min(Math.max(nextLastDayIndex, 0), totalDays - 1),
      savedPlan: nextSavedPlan,
      startedAt: finalStartedAt,
      completedAt: finalCompletedDays.length >= totalDays ? new Date().toISOString() : null
    });
  }

  function openDay(index) {
    setActiveDayIndex(index);
    persist(completedDays, index, savedPlan);
    setScreen('reading');
  }

  function completeDay() {
    const nextCompleted = completedDays.includes(activeDayIndex)
      ? completedDays
      : [...completedDays, activeDayIndex];

    const finalCompletedDays = uniqueSortedDays(nextCompleted);
    const nextIndex = Math.min(activeDayIndex + 1, totalDays - 1);

    setCompletedDays(finalCompletedDays);
    persist(finalCompletedDays, nextIndex, savedPlan);

    if (finalCompletedDays.length >= totalDays) {
      setScreen('complete');
      return;
    }

    setActiveDayIndex(nextIndex);
    setScreen('days');
  }

  function startPlan() {
    const targetIndex = completedDays.length >= totalDays ? totalDays - 1 : nextDayIndex;
    setActiveDayIndex(targetIndex);
    persist(completedDays, targetIndex, savedPlan);
    setScreen('days');
  }

  function toggleSavePlan() {
    const nextSavedPlan = !savedPlan;
    setSavedPlan(nextSavedPlan);
    persist(completedDays, activeDayIndex, nextSavedPlan);
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
                  {(plan.learning.length ? plan.learning : ['Meditar en la Palabra', 'Orar con intención', 'Aplicar una acción diaria']).map((item) => (
                    <li key={item}><Check size={17} /> {item}</li>
                  ))}
                </ul>
                <div className="plan-action-stack">
                  <button className="plan-btn plan-btn-gold" type="button" onClick={startPlan}>
                    {completedDays.length ? 'Continuar plan' : 'Comenzar plan'} <ArrowRight size={19} />
                  </button>
                  <button className="plan-btn plan-btn-secondary" type="button" onClick={toggleSavePlan}>
                    <Bookmark size={18} /> {savedPlan ? 'Plan guardado' : 'Guardar plan'}
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
              const dayDate = formatPlanDate(addDays(startDate, index));
              return (
                <button
                  key={`${day.title}-${index}`}
                  type="button"
                  className={`plan-day-row ${completed ? 'completed' : ''} ${current ? 'current' : ''}`}
                  onClick={() => openDay(index)}
                >
                  <span className="plan-day-icon">{completed ? <CheckCircle2 /> : current ? <BookOpen /> : <CalendarDays />}</span>
                  <span className="plan-day-copy">
                    <small>Día {index + 1} · {dayDate}</small>
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
            <span><CalendarDays size={17} /> Día {activeDayIndex + 1} de {totalDays} · {formatPlanDate(addDays(startDate, activeDayIndex))}</span>
            <div className="mini-progress"><span style={{ width: `${Math.max(progress, 10)}%` }} /></div>
            <p>{plan.title}</p>
            <h1>{activeDay.title}</h1>
          </header>

          <section className="verse-reading-card">
            <span className="verse-reading-icon"><BookOpen size={28} /></span>
            <div>
              <h2>{activeDay.verse}</h2>
            </div>
          </section>

          <section className="reading-block reflection-block">
            <span className="reading-floating-icon">❧</span>
            <div>
              <h2>Reflexión</h2>
              {String(activeDay.text || '').split('\n\n').map((paragraph) => (
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
              <CheckCircle2 size={21} /> {completedDays.includes(activeDayIndex) ? 'Día completado' : 'Marcar como completado'}
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
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: -1,
                height: 155,
                zIndex: 3,
                background: 'linear-gradient(to bottom, transparent 0%, #fffaf0 92%)'
              }}
            />
          </div>
          <div className="complete-content-card">
            <span className="complete-badge"><Trophy size={28} /></span>
            <h1>¡Plan completado!</h1>
            <p>Has terminado {plan.title}. Dios ha sido fiel en este tiempo contigo.</p>
            <strong className="complete-days"><CheckCircle2 size={19} /> {totalDays} de {totalDays} días</strong>
          </div>

          {gainItems.length > 0 && (
            <div className="complete-gains-card">
              <h2>Lo que has ganado</h2>
              {gainItems.map(({ gain, Icon }) => (
                <div className="complete-gain-item" key={gain}><Icon size={24} strokeWidth={1.9} /><span>{gain}</span></div>
              ))}
            </div>
          )}

          <div className="complete-actions">
            <Link className="plan-btn plan-btn-gold" to="/planes">Comenzar otro plan <ArrowRight size={19} /></Link>
            <button className="plan-btn plan-btn-secondary" type="button"><NotebookPen size={18} /> Ver mis notas</button>
          </div>

          {recommendedPlan && recommendedPlan.slug !== plan.slug && (
            <Link className="complete-next-card" to={`/planes/${recommendedPlan.slug}`}>
              <img src={recommendedPlan.image} alt="" />
              <span>
                <small>Recomendado para seguir</small>
                <strong>{recommendedPlan.title}</strong>
                <em>{recommendedPlan.duration}</em>
              </span>
              <ArrowRight size={18} />
            </Link>
          )}
        </section>
      )}
    </section>
  );
}