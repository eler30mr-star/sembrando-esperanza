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
      <img src={video.thumbnail} alt={video.title} loading={featured ? 'eager' : 'lazy'} />
      <span className="video-showcase-shade" />
      {video.duration && <span className="video-duration"><Clock3 size={14} /> {video.duration}</span>}
      <span className="video-play-button" aria-hidden="true"><Play size={featured ? 28 : 22} fill="currentColor" /></span>
    </a>
  );
}

export default function Videos() {
  const [featuredVideo, ...moreVideos] = videos;

  return (
    <section className="section page videos-page">
      <header className="videos-hero">
        <span className="videos-kicker"><Sparkles size={14} /> Galería audiovisual</span>
        <h1>Videos</h1>
        <p>Frases y reflexiones para fortalecer tu fe.</p>
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
            <a
              className="video-primary-action"
              href={getWatchUrl(featuredVideo.url)}
              target="_blank"
              rel="noreferrer"
            >
              <Play size={16} fill="currentColor" />
              Ver video
            </a>
          </div>
        </article>
      )}

      {moreVideos.length > 0 && (
        <div className="videos-library">
          <div className="videos-library-heading">
            <span>Más videos</span>
            <h2>Frases y reflexiones</h2>
          </div>

          <div className="video-showcase-grid">
            {moreVideos.map((video) => (
              <article className="video-showcase-card" key={video.slug || video.title}>
                <VideoThumbnail video={video} />
                <div className="video-showcase-body">
                  <span className="video-category">{video.category}</span>
                  <h3>{video.title}</h3>
                  <a
                    className="video-text-action"
                    href={getWatchUrl(video.url)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver video <ArrowUpRight size={15} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
