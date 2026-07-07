import plansJson from '../data/plans.json';

const defaultPlanImage = 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85';

function cleanStringList(value) {
  return Array.isArray(value)
    ? value.map((item) => String(item || '').trim()).filter(Boolean)
    : [];
}

function normalizeDays(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((day) => ({
      title: day?.title || 'Día del plan',
      subtitle: day?.subtitle || '',
      verse: day?.verse || '',
      verseText: day?.verseText || '',
      text: day?.text || '',
      prayer: day?.prayer || '',
      action: day?.action || ''
    }))
    .filter((day) => day.title || day.verse || day.text || day.prayer || day.action);
}

function normalizePlan(data, index) {
  const days = normalizeDays(data.days);

  return {
    id: data.id || `plan-${index + 1}`,
    slug: data.slug || data.id || `plan-${index + 1}`,
    title: data.title || 'Plan bíblico',
    category: data.category || 'Fe',
    duration: data.duration || `${days.length || 1} días`,
    time: data.time || '5 min al día',
    image: data.coverImage || data.image || defaultPlanImage,
    description: data.shortDescription || data.description || '',
    learning: cleanStringList(data.learning),
    gains: cleanStringList(data.gains),
    days,
    status: data.status || 'published',
    updatedAtMs: Number(data.updatedAtMs || 0)
  };
}

function sortByUpdatedAt(items) {
  return [...items].sort((a, b) => Number(b.updatedAtMs || 0) - Number(a.updatedAtMs || 0));
}

export async function getPublishedPlans() {
  const plans = Array.isArray(plansJson) ? plansJson : [];
  const publishedPlans = plans
    .map(normalizePlan)
    .filter((plan) => plan.status === 'published' && plan.days.length > 0);

  return sortByUpdatedAt(publishedPlans);
}

export async function getPublishedPlanBySlug(slug) {
  const publishedPlans = await getPublishedPlans();
  return publishedPlans.find((plan) => plan.slug === slug) || null;
}
