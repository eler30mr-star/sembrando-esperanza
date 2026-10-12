import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, firebaseReady } from './firebase.js';

const base = 'https://raw.githubusercontent.com/eler30mr-star/sembrando-esperanza/main/public/data';

function extractYouTubeId(url = '') {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host === 'youtu.be' || host === 'www.youtu.be') return u.pathname.split('/')[1] || '';
    if (!['youtube.com','www.youtube.com','m.youtube.com'].includes(host)) return '';
    return u.searchParams.get('v') || (u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1] || '');
  } catch { return ''; }
}

function youtubeThumbnail(url) {
  const id = extractYouTubeId(url);
  return /^[\w-]{11}$/.test(id) ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '';
}

function normalizeVideo(data) {
  const url = String(data.url || '').trim();
  return {
    id: data.id, slug: data.slug || data.id,
    title: data.title || 'Video', url,
    thumbnail: data.thumbnail || youtubeThumbnail(url),
    category: data.category || 'Reflexión',
    description: data.shortDescription || data.description || '',
    duration: data.duration || '',
    status: data.status,
    updatedAtMs: Number(data.updatedAtMs || 0)
  };
}

async function firestoreVideos() {
  if (!firebaseReady || !db) return [];
  try {
    const snapshot = await getDocs(query(collection(db, 'videos'), where('status', '==', 'published')));
    return snapshot.docs.map((entry) => normalizeVideo({ ...entry.data(), id: entry.id }));
  } catch (error) {
    console.error('No se pudieron cargar videos desde Firestore.', error);
    return [];
  }
}

export async function getPublishedVideos(language = 'es') {
  let index = null;
  if (['es','en','pt','fr'].includes(language)) {
    try {
      const response = await fetch(`${base}/${language}/videos.json?v=${Date.now()}`, { cache: 'no-store' });
      if (response.ok) index = await response.json();
    } catch (error) {
      console.error('No se pudo consultar el JSON público de videos.', error);
    }
  }
  const videos = Array.isArray(index) ? index.map(normalizeVideo) : await firestoreVideos();
  return videos.filter((video) => video.status === 'published' && /^https?:\/\//i.test(video.url))
    .sort((a, b) => b.updatedAtMs - a.updatedAtMs);
}
