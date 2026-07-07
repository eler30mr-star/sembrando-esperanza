const defaultPlanImage = 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85';

async function fetchJson(path, fallback) {
  try {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) return fallback;
    return await response.json();
  } catch {
    return fallback;
  }
}

function cleanStringList(value) {
  return Array.isArray(value)
    ? value.map((item) => String(item || '').trim()).filter(Boolean)
    : [];
}

function normalizeDays(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((day, index) => ({
      dayNumber: Number(day?.dayNumber || index + 1),
      title: day?.title || 'Día del plan',
      subtitle: day?.subtitle || '',
      verse: day?.verse || '',
      text: day?.text || '',
      prayer: day?.prayer || '',
      action: day?.action || ''
    }))
    .filter((day) => day.title || day.verse || day.text || day.prayer || day.action);
}

function formatDuration(data, days) {
  const value = String(data.duration || '').trim();
  if (value) return /día|dias|días/i.test(value) ? value : `${value} días`;
  return `${data.dayCount || days.length || 1} días`;
}

function formatTime(data) {
  const value = String(data.time || '').trim();
  if (value) return /min|hora|día|dias|días/i.test(value) ? value : `${value} min al día`;
  return '5 min al día';
}

function normalizePlan(data, index = 0) {
  const days = normalizeDays(data.days);
  const dayCount = Number(data.dayCount || days.length || 0);

  return {
    id: data.id || `plan-${index + 1}`,
    slug: data.slug || data.id || `plan-${index + 1}`,
    title: data.title || 'Plan bíblico',
    category: data.category || 'Fe',
    dayCount,
    duration: formatDuration(data, days),
    time: formatTime(data),
    image: data.coverImage || data.image || defaultPlanImage,
    description: data.shortDescription || data.description || '',
    learning: cleanStringList(data.learning),
    gains: cleanStringList(data.gains),
    days,
    status: data.status || 'published',
    detailPath: data.detailPath || `/data/plans/${data.slug}.json`,
    updatedAtMs: Number(data.updatedAtMs || 0)
  };
}

function sortByUpdatedAt(items) {
  return [...items].sort((a, b) => Number(b.updatedAtMs || 0) - Number(a.updatedAtMs || 0));
}

export async function getPublishedPlans() {
  const plans = await fetchJson('/data/plans.json', []);
  const publishedPlans = Array.isArray(plans)
    ? plans.map(normalizePlan).filter((plan) => plan.status === 'published')
    : [];

  return sortByUpdatedAt(publishedPlans);
}

export async function getPublishedPlanBySlug(slug) {
  const publishedPlans = await getPublishedPlans();
  const planSummary = publishedPlans.find((plan) => plan.slug === slug);

  if (!planSummary) return null;

  const detailPath = planSummary.detailPath || `/data/plans/${slug}.json`;
  const detail = await fetchJson(detailPath, null);

  if (!detail) return planSummary;
  return normalizePlan({ ...planSummary, ...detail });
}
