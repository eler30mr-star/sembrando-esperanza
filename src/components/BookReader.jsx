import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Pause, Play } from 'lucide-react';

function chunkText(text, maxChars) {
  const paragraphs = String(text || '')
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);

  const chunks = [];
  let currentChunk = '';

  paragraphs.forEach((paragraph) => {
    const candidate = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;

    if (candidate.length <= maxChars) {
      currentChunk = candidate;
      return;
    }

    if (currentChunk) chunks.push(currentChunk);

    if (paragraph.length <= maxChars) {
      currentChunk = paragraph;
      return;
    }

    const sentences = paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [paragraph];
    let sentenceChunk = '';

    sentences.forEach((sentence) => {
      const cleanSentence = sentence.trim();
      const sentenceCandidate = sentenceChunk ? `${sentenceChunk} ${cleanSentence}` : cleanSentence;
      if (sentenceCandidate.length <= maxChars) {
        sentenceChunk = sentenceCandidate;
      } else {
        if (sentenceChunk) chunks.push(sentenceChunk);
        sentenceChunk = cleanSentence;
      }
    });

    currentChunk = sentenceChunk;
  });

  if (currentChunk) chunks.push(currentChunk);
  return chunks.length ? chunks : [''];
}

function getMaxChars() {
  if (typeof window === 'undefined') return 720;
  if (window.innerWidth <= 420) return 760;
  if (window.innerWidth <= 620) return 860;
  if (window.innerWidth <= 900) return 1050;
  return 1350;
}

export default function BookReader({ title, subtitle, pages = [], footerLabel = 'Página' }) {
  const [page, setPage] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [maxChars, setMaxChars] = useState(getMaxChars);

  useEffect(() => {
    const handleResize = () => setMaxChars(getMaxChars());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const readerPages = useMemo(() => {
    const fullText = pages.join('\n\n');
    return chunkText(fullText, maxChars);
  }, [pages, maxChars]);

  const current = useMemo(() => readerPages[page] || '', [readerPages, page]);

  useEffect(() => {
    setPage(0);
  }, [readerPages.length]);

  const next = () => setPage((value) => Math.min(value + 1, readerPages.length - 1));
  const previous = () => setPage((value) => Math.max(value - 1, 0));

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [page]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  function toggleAudio() {
    if (!('speechSynthesis' in window)) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const text = `${title}. ${subtitle || ''}. ${current}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  return (
    <section className="reader-shell immersive-reader">
      <div className="reader-top immersive-reader-top">
        <div>
          <span className="page-count">{footerLabel} {page + 1} de {readerPages.length}</span>
          <h1>{title}</h1>
        </div>
      </div>

      <div className="book-stage immersive-book-stage">
        <article className="book-page immersive-book-page" key={page}>
          <div className="paper-grain" />
          <p>{current}</p>
          <span className="page-number">{page + 1}</span>
        </article>
      </div>

      <div className="reader-controls immersive-reader-controls" aria-label="Controles de lectura">
        <Link className="reader-home-button" to="/historias" aria-label="Ir a historias">
          <Home size={18} /> Inicio
        </Link>

        <button className="reader-triangle" type="button" onClick={previous} disabled={page === 0} aria-label="Página anterior">
          ◀
        </button>

        <button className="reader-audio-button" type="button" onClick={toggleAudio} aria-label={speaking ? 'Detener audio' : 'Reproducir audio'}>
          {speaking ? <Pause size={18} /> : <Play size={18} />} Audio
        </button>

        <button className="reader-triangle" type="button" onClick={next} disabled={page === readerPages.length - 1} aria-label="Página siguiente">
          ▶
        </button>
      </div>
    </section>
  );
}
