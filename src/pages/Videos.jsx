import { ArrowUpRight, Clock3, Play, Sparkles } from 'lucide-react';
import { videos } from '../data/content.js';

function getWatchUrl(url) {
  if (!url) return '#';
  if (url.includes('youtube.com/embed/')) {
    const videoId = url.split('youtube.com/embed/')[1]?.split(/[?&]/)[0];
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;
  }
  return url;
}

function VideoThumbnail({ video, featured = false }) {
  return (
    <a
      className={`video-showcase-media${featured ? ' is-featured' : ''}`}
      href={getWatchUrl(video.url)}
      target="_blank"
      rel="noreferrer"
      aria-label={`Reproducir ${video.title}`}
    >
      <img src={video.thumbnail} alt="" loading={featured ? 'eager' : 'lazy'} />
      <span className="video-showcase-shade" />
      <span className="video-duration"><Clock3 size={14} /> {video.duration}</span>
      <span className="video-play-button" aria-hidden="true"><Play size={featured ? 32 : 24} fill="currentColor" /></span>
      <span className="video-play-label">Ver ahora</span>
    </a>
  );
}

export default function Videos() {
  const [featuredVideo, ...moreVideos] = videos;

  return (
    <section className="section page videos-page">
      <header className="videos-hero">
        <div className="videos-hero-copy">
          <span className="videos-kicker"><Sparkles size={15} /> Galería audiovisual</span>
          <h1>Mensajes que alimentan <em>tu fe</em></h1>
          <p>
            Predicaciones, música, testimonios y contenidos para acompañarte,
            inspirarte y acercarte a Dios en cualquier momento.
          </p>
        </div>
        <div className="videos-hero-note" aria-label={`${videos.length} videos disponibles`}>
          <strong>{String(videos.length).padStart(2, '0')}</strong>
          <span>videos para<br />ver y compartir</span>
        </div>
      </header>

      {featuredVideo && (
        <article className="video-featured">
          <VideoThumbnail video={featuredVideo} featured />
          <div className="video-featured-content">
            <div className="video-card-topline">
              <span className="video-category">{featuredVideo.category}</span>
              <span className="video-featured-tag">Destacado</span>
            </div>
            <h2>{featuredVideo.title}</h2>
            <p>{featuredVideo.description}</p>
            <a
              className="video-primary-action"
              href={getWatchUrl(featuredVideo.url)}
              target="_blank"
              rel="noreferrer"
            >
              <span className="video-action-icon"><Play size={18} fill="currentColor" /></span>
              Reproducir video
              <ArrowUpRight size={18} />
            </a>
          </div>
        </article>
      )}

      {moreVideos.length > 0 && (
        <div className="videos-library">
          <div className="videos-library-heading">
            <div>
              <span>Explora la colección</span>
              <h2>Más para ti</h2>
            </div>
            <p>Elige un video y continúa creciendo en fe.</p>
          </div>

          <div className="video-showcase-grid">
            {moreVideos.map((video) => (
              <article className="video-showcase-card" key={video.slug || video.title}>
                <VideoThumbnail video={video} />
                <div className="video-showcase-body">
                  <span className="video-category">{video.category}</span>
                  <h3>{video.title}</h3>
                  <p>{video.description}</p>
                  <a
                    className="video-text-action"
                    href={getWatchUrl(video.url)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver video <ArrowUpRight size={16} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <footer className="videos-disclaimer">
        <span aria-hidden="true">✦</span>
        Los videos se reproducen en plataformas externas y pertenecen a sus respectivos propietarios.
      </footer>
    </section>
  );
}
