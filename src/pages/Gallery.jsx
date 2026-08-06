import { useState } from 'react';
import { ArrowUpRight, Clock3, Images, Play, Video } from 'lucide-react';
import ContentCard from '../components/ContentCard.jsx';
import { albums, videos } from '../data/content.js';

function getWatchUrl(url) {
  if (!url) return '#';
  if (url.includes('youtube.com/embed/')) {
    const videoId = url.split('youtube.com/embed/')[1]?.split(/[?&]/)[0];
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;
  }
  return url;
}

function VideosGallery() {
  return (
    <div className="gallery-videos-grid">
      {videos.map((video) => (
        <article className="gallery-video-card" key={video.slug || video.title}>
          <a
            className="gallery-video-media"
            href={getWatchUrl(video.url)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Reproducir ${video.title}`}
          >
            <img src={video.thumbnail} alt="" loading="lazy" />
            <span className="gallery-video-overlay" />
            <span className="gallery-video-duration"><Clock3 size={13} /> {video.duration}</span>
            <span className="gallery-video-play"><Play size={22} fill="currentColor" /></span>
          </a>
          <div className="gallery-video-body">
            <span>{video.category}</span>
            <h3>{video.title}</h3>
            <a href={getWatchUrl(video.url)} target="_blank" rel="noreferrer">
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

  return (
    <section className="section page unified-gallery-page">
      <header className="unified-gallery-header">
        <span>Contenido para compartir</span>
        <h1>Galería</h1>
      </header>

      <div className="gallery-tabs" role="tablist" aria-label="Tipo de contenido">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'images'}
          className={activeTab === 'images' ? 'active' : ''}
          onClick={() => setActiveTab('images')}
        >
          <Images size={18} />
          Imágenes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'videos'}
          className={activeTab === 'videos' ? 'active' : ''}
          onClick={() => setActiveTab('videos')}
        >
          <Video size={18} />
          Videos
        </button>
      </div>

      <div className="gallery-tab-content">
        {activeTab === 'images' ? (
          <div className="card-grid three gallery-images-grid">
            {albums.map((album) => (
              <ContentCard
                key={album.title}
                image={album.image}
                title={album.title}
                description={album.description}
                meta={`${album.count} imágenes`}
              />
            ))}
          </div>
        ) : (
          <VideosGallery />
        )}
      </div>
    </section>
  );
}
