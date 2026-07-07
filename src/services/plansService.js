import { collection, getDocs, query, where } from 'firebase/firestore';
import { plans as localPlans } from '../data/content.js';
import { db, firebaseReady } from './firebase.js';

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

function normalizePlan(snapshot) {
  const data = snapshot.data();
  const days = normalizeDays(data.days);

  return {
    id: snapshot.id,
    slug: data.slug || snapshot.id,
    title: data.title || 'Plan bíblico',
    category: data.category || 'Fe',
    duration: data.duration || `${days.length || 1} días`,
    time: data.time || '5 min al día',
    image: data.coverImage || data.image || defaultPlanImage,
    description: data.shortDescription || data.description || '',
    learning: cleanStringList(data.learning),
    gains: cleanStringList(data.gains),
    days,
    status: data.status || 'draft',
    updatedAtMs: Number(data.updatedAtMs || 0)
  };
}

function sortByUpdatedAt(items) {
  return [...items].sort((a, b) => Number(b.updatedAtMs || 0) - Number(a.updatedAtMs || 0));
}

export async function getPublishedPlans() {
  if (!firebaseReady || !db) return localPlans;

  try {
    const publishedQuery = query(collection(db, 'plans'), where('status', '==', 'published'));
    const snapshot = await getDocs(publishedQuery);
    const firebasePlans = snapshot.docs.map(normalizePlan).filter((plan) => plan.days.length > 0);
    return sortByUpdatedAt(firebasePlans);
  } catch {
    return localPlans;
  }
}

export async function getPublishedPlanBySlug(slug) {
  const publishedPlans = await getPublishedPlans();
  return publishedPlans.find((plan) => plan.slug === slug) || null;
}