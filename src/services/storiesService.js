import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, firebaseReady } from './firebase.js';

const base = 'https://raw.githubusercontent.com/eler30mr-star/sembrando-esperanza/main/public/data';

async function fetchPublishedJson(path) {
  try {
    const relative = String(path || '').replace(/^\/data\//, '');
    if (!/^(es|en|pt|fr)\/(stories\.json|stories\/[a-z0-9-]+\.json)$/.test(relative)) return null;
    const response = await fetch(`${base}/${relative}?v=${Date.now()}`, { cache: 'no-store' });
    return response.ok ? await response.json() : null;
  } catch (error) {
    console.error('No se pudo leer el JSON público de historias.', error);
    return null;
  }
}

function normalizeStory(data) {
  return {
    ...data,
    id: data.id,
    title: data.title || 'Historia sin título',
    slug: data.slug || data.id,
    category: data.category || 'Reflexión',
    readingTime: data.readingTime || 'Lectura',
    image: data.coverImage || data.image || '',
    description: data.shortDescription || data.description || '',
    chapters: Array.isArray(data.chapters) ? data.chapters : [],
    pages: Array.isArray(data.pages) ? data.pages : [],
    status: data.status,
    updatedAtMs: Number(data.updatedAtMs || 0)
  };
}

async function firestoreStories() {
  if (!firebaseReady || !db) return [];
  try {
    const snapshot = await getDocs(query(collection(db, 'stories'), where('status', '==', 'published')));
    return snapshot.docs.map((entry) => normalizeStory({ ...entry.data(), id: entry.id }));
  } catch (error) {
    console.error('Falló la consulta de historias a Firestore.', error);
    return [];
  }
}

export async function getPublishedStories(language = 'es') {
  const json = await fetchPublishedJson(`/data/${language}/stories.json`);
  const stories = Array.isArray(json) ? json.map(normalizeStory) : await firestoreStories();
  return stories.filter((story) => story.status === 'published')
    .sort((a, b) => b.updatedAtMs - a.updatedAtMs);
}

export async function getPublishedStoryBySlug(slug, language = 'es') {
  const stories = await getPublishedStories(language);
  const summary = stories.find((story) => story.slug === slug);
  if (!summary) return null;
  if (summary.chapters.length || summary.pages.length) return summary;
  const detail = await fetchPublishedJson(summary.detailPath || `/data/${language}/stories/${slug}.json`);
  return detail?.status === 'published' ? normalizeStory({ ...summary, ...detail }) : summary;
}
