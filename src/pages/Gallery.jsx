import { useEffect, useState } from 'react';
import { ArrowUpRight, Clock3, Images, Play, Video } from 'lucide-react';
import { getPublishedAlbums } from '../services/siteContentService.js';
import { getPublishedVideos } from '../services/videosService.js';

function getWatchUrl(url) {
  if (!/^https?:\/\//i.test(url || '')) return '#';
  if (url.includes('youtube.com/embed/')) {
    const videoId = url.split('youtube.com/embed/')[1]?.split(/[?&]/)[0];
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;
  }
  return url;
}

function VideosGallery({ videos, loading }) {
  if (loading) return <p className="gallery-loading">Cargando videos...</p>;
  if (!videos.length) return <p className="gallery-loading">Todavía no hay videos publicados.</p>;

  return (
    <div className="gallery-videos-grid">
      {videos.map((video) => (
        <article className="gallery-video-card" key={video.id || video.slug}>
          <a className="gallery-video-media" href={getWatchUrl(video.url)}
            target="_blank" rel="noopener noreferrer" aria-label={`Reproducir ${video.title}`}>
            {video.thumbnail ? <img src={video.thumbnail} alt="" loading="lazy" /> : <span className="gallery-video-placeholder" />}
            <span className="gallery-video-overlay" />
            {video.duration && <span className="gallery-video-duration"><Clock3 size={13} /> {video.duration}</span>}
            <span className="gallery-video-play"><Play size={22} fill="currentColor" /></span>
          </a>
          <div className="gallery-video-body">
            <span>{video.category || 'Reflexión'}</span>
            <h3>{video.title}</h3>
            <a href={getWatchUrl(video.url)} target="_blank" rel="noopener noreferrer">
              Ver video <ArrowUpRight size={15} />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function Gallery() {
  const [activeTab, setActiveTab] = useState('images');
  const [albums, setAlbums] = useState([]);
  const [publicVideos, setPublicVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAlbumId, setActiveAlbumId] = useState(null);
  const activeAlbum = albums.find((album) => album.id === activeAlbumId);

  useEffect(() => {
    let active = true;
    Promise.all([getPublishedAlbums(), getPublishedVideos()])
      .then(([nextAlbums, videos]) => {
        if (active) { setAlbums(nextAlbums); setPublicVideos(videos); }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section className="section page unified-gallery-page">
      <div className="gallery-tabs" role="tablist" aria-label="Tipo de contenido">
        <button type="button" role="tab" aria-selected={activeTab === 'images'}
          className={activeTab === 'images' ? 'active' : ''}
          onClick={() => setActiveTab('images')}>
          <Images size={18} /> Imágenes
        </button>
        <button type="button" role="tab" aria-selected={activeTab === 'videos'}
          className={activeTab === 'videos' ? 'active' : ''}
          onClick={() => setActiveTab('videos')}>
          <Video size={18} /> Videos
        </button>
      </div>

      <div className="gallery-tab-content">
        {activeTab === 'images' ? (
          loading ? <p className="gallery-loading">Cargando álbumes...</p> :
          activeAlbum ? (
            <div className="managed-album-detail">
              <button type="button" className="managed-back-link" onClick={() => setActiveAlbumId(null)}>
                ← Volver a los álbumes
              </button>
              <h2>{activeAlbum.title}</h2>
              <p>{activeAlbum.description}</p>
              {activeAlbum.images.length ? (
                <div className="managed-images-grid">
                  {activeAlbum.images.map((url, index) => (
                    <a href={url} key={`${activeAlbum.id}-${index}`} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`${activeAlbum.title} — imagen ${index + 1}`} loading="lazy" />
                    </a>
                  ))}
                </div>
              ) : <p className="managed-message">Este álbum todavía no tiene imágenes.</p>}
            </div>
          ) : albums.length ? (
            <div className="card-grid three gallery-images-grid">
              {albums.map((album) => (
                <button className="content-card managed-album-card" type="button" key={album.id}
                  onClick={() => setActiveAlbumId(album.id)}>
                  {album.image && <img src={album.image} alt="" loading="lazy" />}
                  <span className="content-card-body">
                    {album.category && <span className="card-meta">{album.category}</span>}
                    <h3>{album.title}</h3>
                    <p>{album.description}</p>
                    <span className="card-action">{album.count} {album.count === 1 ? 'imagen' : 'imágenes'} · Abrir álbum</span>
                  </span>
                </button>
              ))}
            </div>
          ) : <p className="gallery-loading">Todavía no hay álbumes publicados.</p>
        ) : <VideosGallery videos={publicVideos} loading={loading} />}
      </div>
    </section>
  );
}
