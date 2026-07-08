const defaultPlanImage = 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85';
const defaultLanguage = 'es';

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

function withImageVersion(url, updatedAtMs) {
  const cleanUrl = String(url || '').trim();
  if (!cleanUrl) return defaultPlanImage;

  const version = Number(updatedAtMs || 0);
  if (!version || cleanUrl.includes('images.unsplash.com')) return cleanUrl;

  return `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}v=${version}`;
}

function normalizeReferences(day) {
  if (Array.isArray(day?.references) && day.references.length) return cleanStringList(day.references);
  if (Array.isArray(day?.verses) && day.verses.length) return cleanStringList(day.verses);
  const verse = String(day?.verse || '').trim();
  return verse ? [verse] : [];
}

function normalizeDays(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((day, index) => {
      const references = normalizeReferences(day);
      return {
        dayNumber: Number(day?.dayNumber || index + 1),
        title: day?.title || 'Día del plan',
        subtitle: day?.subtitle || '',
        verse: references[0] || '',
        verses: references,
        references,
        text: day?.text || '',
        internalize: day?.internalize || day?.question || day?.meditation || '',
        prayer: day?.prayer || '',
        action: day?.action || ''
      };
    })
    .filter((day) => day.title || day.verse || day.text || day.internalize || day.prayer || day.action);
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
  const slug = data.slug || data.id || `plan-${index + 1}`;
  const updatedAtMs = Number(data.updatedAtMs || 0);
  const coverImage = data.coverImage || data.image || defaultPlanImage;

  return {
    id: data.id || `plan-${index + 1}`,
    slug,
    title: data.title || 'Plan bíblico',
    category: data.category || 'Fe',
    dayCount,
    duration: formatDuration(data, days),
    time: formatTime(data),
    image: withImageVersion(coverImage, updatedAtMs),
    description: data.shortDescription || data.description || '',
    learning: cleanStringList(data.learning),
    gains: cleanStringList(data.gains),
    days,
    status: data.status || 'published',
    language: data.language || defaultLanguage,
    detailPath: data.detailPath || `/data/${defaultLanguage}/plans/${slug}.json`,
    updatedAtMs
  };
}

function sortByUpdatedAt(items) {
  return [...items].sort((a, b) => Number(b.updatedAtMs || 0) - Number(a.updatedAtMs || 0));
}

export async function getPublishedPlans(language = defaultLanguage) {
  const plans = await fetchJson(`/data/${language}/plans.json`, []);
  const publishedPlans = Array.isArray(plans)
    ? plans.map(normalizePlan).filter((plan) => plan.status === 'published')
    : [];

  return sortByUpdatedAt(publishedPlans);
}

export async function getPublishedPlanBySlug(slug, language = defaultLanguage) {
  const publishedPlans = await getPublishedPlans(language);
  const planSummary = publishedPlans.find((plan) => plan.slug === slug);

  if (!planSummary) return null;

  const detailPath = planSummary.detailPath || `/data/${language}/plans/${slug}.json`;
  const detail = await fetchJson(detailPath, null);

  if (!detail) return planSummary;
  return normalizePlan({ ...planSummary, ...detail });
}
