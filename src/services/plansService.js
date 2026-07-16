const defaultPlanImage = 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85';
const defaultLanguage = 'es';

async function fetchJson(path, fallback) {
  try {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) return fallback;
    return await response.json();
  } catch (error) {
    console.error('No se pudo cargar JSON público:', path, error);
    return fallback;
  }
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function safeString(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function cleanStringList(value) {
  return Array.isArray(value)
    ? value.map((item) => String(item || '').trim()).filter(Boolean)
    : [];
}

function withImageVersion(url, updatedAtMs) {
  const cleanUrl = safeString(url, defaultPlanImage);
  if (!cleanUrl) return defaultPlanImage;

  const version = safeNumber(updatedAtMs, 0);
  if (!version || cleanUrl.includes('images.unsplash.com')) return cleanUrl;

  return `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}v=${version}`;
}

function normalizeReferences(dayValue) {
  const day = asObject(dayValue);
  if (Array.isArray(day.references) && day.references.length) return cleanStringList(day.references);
  if (Array.isArray(day.verses) && day.verses.length) return cleanStringList(day.verses);
  const verse = safeString(day.verse);
  return verse ? [verse] : [];
}

function normalizeDays(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((dayValue, index) => {
      const day = asObject(dayValue);
      const references = normalizeReferences(day);

      return {
        dayNumber: safeNumber(day.dayNumber, index + 1),
        title: safeString(day.title, 'Día del plan'),
        subtitle: safeString(day.subtitle),
        verse: references[0] || '',
        verses: references,
        references,
        text: safeString(day.text),
        interioriza: safeString(day.interioriza || day.internalize || day.interiorizar || day.question || day.meditation),
        prayer: safeString(day.prayer),
        action: safeString(day.action)
      };
    })
    .filter((day) => day.title || day.verse || day.text || day.interioriza || day.prayer || day.action);
}

function formatDuration(dataValue, days) {
  const data = asObject(dataValue);
  const value = safeString(data.duration);
  if (value) return /día|dias|días/i.test(value) ? value : `${value} días`;

  const totalDays = safeNumber(data.dayCount, days.length || 1);
  return `${Math.max(totalDays, 1)} días`;
}

function formatTime(dataValue) {
  const data = asObject(dataValue);
  const value = safeString(data.time);
  if (value) return /min|hora|día|dias|días/i.test(value) ? value : `${value} min al día`;
  return '5 min al día';
}

function normalizePlan(dataValue, index = 0) {
  const data = asObject(dataValue);
  const days = normalizeDays(data.days);
  const dayCount = Math.max(safeNumber(data.dayCount, days.length), days.length, 0);
  const slug = safeString(data.slug || data.id, `plan-${index + 1}`);
  const updatedAtMs = safeNumber(data.updatedAtMs, 0);
  const coverImage = data.coverImage || data.image || defaultPlanImage;

  return {
    id: safeString(data.id, `plan-${index + 1}`),
    slug,
    title: safeString(data.title, 'Plan bíblico'),
    category: safeString(data.category, 'Fe'),
    dayCount,
    duration: formatDuration(data, days),
    time: formatTime(data),
    image: withImageVersion(coverImage, updatedAtMs),
    description: safeString(data.shortDescription || data.description),
    learning: cleanStringList(data.learning),
    gains: cleanStringList(data.gains),
    days,
    status: safeString(data.status, 'published'),
    language: safeString(data.language, defaultLanguage),
    detailPath: safeString(data.detailPath, `/data/${defaultLanguage}/plans/${slug}.json`),
    updatedAtMs
  };
}

function sortByUpdatedAt(items) {
  return [...items].sort((a, b) => safeNumber(b.updatedAtMs) - safeNumber(a.updatedAtMs));
}

export async function getPublishedPlans(language = defaultLanguage) {
  try {
    const plans = await fetchJson(`/data/${language}/plans.json`, []);
    const publishedPlans = Array.isArray(plans)
      ? plans.map((plan, index) => normalizePlan(plan, index)).filter((plan) => plan.status === 'published')
      : [];

    return sortByUpdatedAt(publishedPlans);
  } catch (error) {
    console.error('Error preparando planes públicos:', error);
    return [];
  }
}

export async function getPublishedPlanBySlug(slug, language = defaultLanguage) {
  try {
    const cleanSlug = safeString(slug);
    const publishedPlans = await getPublishedPlans(language);
    const planSummary = publishedPlans.find((plan) => plan.slug === cleanSlug);

    if (!planSummary) return null;

    const detailPath = planSummary.detailPath || `/data/${language}/plans/${cleanSlug}.json`;
    const detail = await fetchJson(detailPath, null);

    if (!detail) return planSummary;
    return normalizePlan({ ...planSummary, ...asObject(detail) });
  } catch (error) {
    console.error('Error preparando detalle de plan público:', error);
    return null;
  }
}
