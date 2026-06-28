import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Home, MessageCircle, Play, Share2 } from 'lucide-react';

const LIMIT = 901;

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function split(text) {
  const pages = [];
  let rest = clean(text);
  while (rest.length > LIMIT) {
    let cut = rest.lastIndexOf(' ', LIMIT);
    if (cut < 650) cut = LIMIT;
    pages.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) pages.push(rest);
  return pages.length ? pages : [''];
}

export default function BookReader({ title, chapters = [], pages = [] }) {
  const [page, setPage] = useState(0);
  const readerPages = useMemo(() => {
    const source = chapters.length ? chapters : [{ title: 'Capítulo 1', content: pages.join(' ') }];
    return source.flatMap((chapter, chapterIndex) => split(chapter.content).map((content, index) => ({
      content,
      chapterTitle: clean(chapter.title || `Capítulo ${chapterIndex + 1}`),
      chapterNumber: chapterIndex + 1,
      first: index === 0
    })));
  }, [chapters, pages]);

  const current = readerPages[page] || { content: '', chapterTitle: '', chapterNumber: 1, first: true };
  const back = () => setPage((v) => Math.max(v - 1, 0));
  const next = () => setPage((v) => Math.min(v + 1, readerPages.length - 1));
  const actionStyle = { border: 0, background: 'transparent', color: '#6f4b16', fontWeight: 800, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer' };

  return (
    <section className="reader-shell immersive-reader">
      <div className="reader-top immersive-reader-top" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ width: '100%', textAlign: 'center' }}><h1>{title}</h1></div>
      </div>
      <div className="book-stage immersive-book-stage">
        <article className="book-page immersive-book-page">
          <div className="paper-grain" />
          <div className="reader-page-content" style={{ position: 'relative', height: '100%', overflow: 'hidden', paddingBottom: 58, boxSizing: 'border-box' }}>
            <div style={{ height: '100%', overflow: 'hidden' }}>
              {current.first && <div style={{ textAlign: 'center', marginBottom: 16 }}><span style={{ display: 'block', marginBottom: 6, color: 'var(--gold-dark)', fontWeight: 800, letterSpacing: '0.12em' }}>CAPÍTULO {current.chapterNumber}</span><h2 className="reader-chapter-title">{current.chapterTitle}</h2></div>}
              <p style={{ margin: 0, fontSize: '1.04rem', lineHeight: 1.58, textAlign: 'justify' }}>{current.content}</p>
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', gap: 18 }}>
              <button type="button" style={actionStyle} aria-label="Me gusta"><Heart size={22} /><span>0</span></button>
              <button type="button" style={actionStyle} aria-label="Comentar"><MessageCircle size={22} /><span>0</span></button>
              <button type="button" style={actionStyle} aria-label="Compartir"><Share2 size={22} /><span>Compartir</span></button>
            </div>
          </div>
        </article>
      </div>
      <div className="reader-controls immersive-reader-controls">
        <Link className="reader-home-button" to="/historias"><Home size={18} /> Inicio</Link>
        <button className="reader-triangle" onClick={back} disabled={page === 0}>◀</button>
        <button className="reader-audio-button" type="button"><Play size={18} /> Audio</button>
        <button className="reader-triangle" onClick={next} disabled={page === readerPages.length - 1}>▶</button>
      </div>
    </section>
  );
}
