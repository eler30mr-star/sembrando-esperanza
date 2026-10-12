import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, firebaseReady } from './firebase.js';
import { normalizeAlbum, sortPublished } from './contentSelectors.js';

export async function getManagedContent(section) {
  if (!firebaseReady || !db) {
    console.warn('Sembrando Esperanza: configura Firebase en la web pública para consultar', section);
    return [];
  }
  try {
    const snapshot = await getDocs(query(collection(db, section), where('status', '==', 'published')));
    return sortPublished(snapshot.docs.map((entry) => ({ ...entry.data(), id: entry.id })));
  } catch (error) {
    console.error(`No se pudo consultar el contenido publicado de ${section}:`, error);
    return [];
  }
}

export async function getPublishedAlbums() {
  const items = await getManagedContent('albums');
  return items.map(normalizeAlbum);
}

export async function getPublishedVerses() {
  const items = await getManagedContent('verses');
  return items.filter((item) => item.reference && item.text)
    .map((item) => ({
      id: item.id, theme: item.theme || 'Fe', reference: item.reference, text: item.text
    }));
}

export async function getPublishedPrayers() {
  const items = await getManagedContent('prayers');
  return items.filter((item) => item.title && item.text)
    .map((item) => ({
      id: item.id, title: item.title, moment: item.moment || 'Oración', text: item.text
    }));
}

export async function getPublishedHomeSettings() {
  const settings = await getManagedContent('homeSections');
  return settings[0] || null;
}
