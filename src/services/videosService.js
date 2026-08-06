import { collection, getDocs, query, where } from 'firebase/firestore';
import { videos as localVideos } from '../data/content.js';
import { db, firebaseReady } from './firebase.js';

function extractYouTubeId(url = '') {
  const value = String(url).trim();
  const patterns = [
    /youtube\.com\/watch\?v=([^&?/]+)/i,
    /youtu\.be\/([^&?/]+)/i,
    /youtube\.com\/embed\/([^&?/]+)/i,
    /youtube\.com\/shorts\/([^&?/]+)/i
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  return '';
}

function youtubeThumbnail(url) {
  const id = extractYouTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '';
}

function normalizeVideo(snapshot) {
  const data = snapshot.data();
  const url = data.url || '';

  return {
    id: snapshot.id,
    slug: data.slug || snapshot.id,
    title: data.title || 'Video',
    url,
    thumbnail: data.thumbnail || youtubeThumbnail(url),
    category: data.category || 'Reflexión',
    description: data.shortDescription || data.description || '',
    duration: data.duration || '',
    status: data.status || 'published',
    updatedAtMs: Number(data.updatedAtMs || 0)
  };
}

function sortByUpdatedAt(items) {
  return [...items].sort((a, b) => Number(b.updatedAtMs || 0) - Number(a.updatedAtMs || 0));
}

export async function getPublishedVideos() {
  if (!firebaseReady || !db) return localVideos;

  try {
    const publishedQuery = query(collection(db, 'videos'), where('status', '==', 'published'));
    const snapshot = await getDocs(publishedQuery);
    const firebaseVideos = snapshot.docs.map(normalizeVideo);
    return firebaseVideos.length ? sortByUpdatedAt(firebaseVideos) : localVideos;
  } catch (error) {
    console.error('No se pudieron cargar videos desde Firebase.', error);
    return localVideos;
  }
}
