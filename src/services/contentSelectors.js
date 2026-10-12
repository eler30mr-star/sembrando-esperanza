// Pure helpers shared by the public pages and unit tests.
export function sortPublished(items) {
  return (Array.isArray(items) ? items : [])
    .filter((item) => item && item.status === 'published')
    .sort((a, b) => Number(b.updatedAtMs || 0) - Number(a.updatedAtMs || 0));
}

export function selectFeatured(items, preference, keys = ['id', 'slug', 'title']) {
  const all = Array.isArray(items) ? items : [];
  const query = String(preference || '').trim().toLocaleLowerCase();
  return (query
    ? all.find((item) => keys.some((key) => String(item?.[key] || '').trim().toLocaleLowerCase() === query))
    : null) || all[0] || null;
}

export function safePublicImage(value) {
  const image = typeof value === 'string' ? value.trim() : '';
  return /^https?:\/\/[^\s]+$/i.test(image) || image.startsWith('/images/') ? image : '';
}

export function normalizeAlbum(item) {
  const raw = Array.isArray(item.images) ? item.images : [];
  const images = raw
    .map((entry) => safePublicImage(typeof entry === 'string' ? entry : entry?.url))
    .filter(Boolean);
  const cover = safePublicImage(item.coverImage) || images[0] || '';
  return {
    id: item.id,
    title: item.title || 'Álbum',
    category: item.category || '',
    description: item.shortDescription || '',
    image: cover,
    images: images.length ? images : (cover ? [cover] : []),
    count: images.length || (cover ? 1 : 0)
  };
}
