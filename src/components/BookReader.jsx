import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Home, MessageCircle, Pause, Play, Send, Share2, X } from 'lucide-react';
import { listenToUser, loginWithGoogle } from '../services/authService.js';
import {
  addStoryComment,
  listenToComments,
  listenToStoryStats,
  listenToUserLike,
  toggleStoryLike
} from '../services/storyEngagementService.js';

const WIDTH_FACTOR = 0.94;
const PAGE_BOTTOM_SAFETY = 28;

const cleanTitle = (v) => String(v || '').replace(/\s+/g, ' ').trim();
const cleanBody = (v) => String(v || '')
  .replace(/[\u200B-\u200D\uFEFF]/g, '')
  .replace(/\u00A0/g, ' ')
  .replace(/\r\n/g, '\n')
  .replace(/\r/g, '\n')
  .replace(/[ \t]+/g, ' ')
  .replace(/\n[ \t]+/g, '\n')
  .replace(/[ \t]+\n/g, '\n')
  .replace(/\n{4,}/g, '\n\n\n')
  .trim();
const wordTokens = (v) => cleanTitle(v).match(/\S+\s*/g) || [];
const bodyTokens = (v) => cleanBody(v).match(/\n|[^\s\n]+\s*/g) || [];

function canvasCtx() {
  if (typeof document === 'undefined') return null;
  if (!canvasCtx.canvas) canvasCtx.canvas = document.createElement('canvas');
  return canvasCtx.canvas.getContext('2d');
}

function wrappedLines(ctx, text, width) {
  const ws = wordTokens(text);
  if (!ws.length) return 0;
  let n = 1;
  let line = '';

  ws.forEach((w) => {
    const next = line ? `${line}${w}` : w;
    if (ctx.measureText(next.trim()).width <= width) {
      line = next;
    } else {
      n += 1;
      line = w;
    }
  });

  return n;
}

function paginate(text, layout, chapterTitle) {
  const toks = bodyTokens(text);
  const ctx = canvasCtx();
  if (!toks.length) return [''];
  if (!ctx || !layout.width || !layout.height || !layout.bodyLineHeight) return [cleanBody(text)];

  const width = layout.width * WIDTH_FACTOR;
  const pageLimit = Math.max(layout.bodyLineHeight * 5, layout.height - PAGE_BOTTOM_SAFETY);
  const bodyLineHeight = layout.bodyLineHeight;
  const titleLineHeight = layout.titleLineHeight || bodyLineHeight;
  const titleMargin = layout.titleMarginBottom || Math.round(bodyLineHeight * 0.35);
  const pages = [];
  let page = [];
  let line = '';
  let usedHeight = 0;
  let pageIndex = 0;

  const save = () => {
    const content = page.join('').trim();
    if (content) pages.push(content);
    page = [];
    line = '';
    usedHeight = 0;
    pageIndex += 1;
  };

  const addVisualHeight = (height) => {
    if (usedHeight + height > pageLimit && page.length) save();
    usedHeight += height;
  };

  if (chapterTitle) {
    ctx.font = layout.titleFont || layout.bodyFont;
    const titleHeight = wrappedLines(ctx, chapterTitle, width) * titleLineHeight + titleMargin;
    addVisualHeight(titleHeight);
  }

  ctx.font = layout.bodyFont;

  const addWord = (tok) => {
    if (!line) {
      addVisualHeight(bodyLineHeight);
      page.push(tok);
      line = tok;
      return;
    }

    const next = `${line}${tok}`;
    if (ctx.measureText(next.trim()).width <= width) {
      page.push(tok);
      line = next;
      return;
    }

    addVisualHeight(bodyLineHeight);
    page.push(tok);
    line = tok;
  };

  toks.forEach((tok) => {
    if (tok === '\n') {
      addVisualHeight(bodyLineHeight);
      page.push(tok);
      line = '';
      return;
    }
    addWord(tok);
  });

  if (page.length) pages.push(page.join('').trim());
  return pages.length ? pages : [''];
}

export default function BookReader({ title, chapters = [], pages = [], storyId, storySlug }) {
  const textBoxRef = useRef(null);
  const utteranceRef = useRef(null);
  const [layout, setLayout] = useState({ width: 0, height: 0, bodyFont: '16px serif', bodyLineHeight: 24, titleFont: '16px serif', titleLineHeight: 24, titleMarginBottom: 8 });
  const [page, setPage] = useState(0);
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [audioPaused, setAudioPaused] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  const readerPages = useMemo(() => {
    const source = chapters.length ? chapters : [{ title: 'Capítulo 1', content: pages.join('\n\n') }];
    return source.flatMap((ch, ci) => {
      const chapterTitle = cleanTitle(ch.title || `Capítulo ${ci + 1}`);
      const chapterNumber = ci + 1;
      return paginate(ch.content, layout, chapterTitle).map((content, i) => ({
        content,
        chapterTitle,
        chapterNumber,
        first: i === 0
      }));
    });
  }, [chapters, pages, layout]);

  const current = readerPages[page] || { content: '', chapterTitle: '', chapterNumber: 1, first: true };

  useLayoutEffect(() => {
    const calc = () => {
      const box = textBoxRef.current;
      if (!box) return;
      const p = box.querySelector('p') || box;
      const titleEl = box.querySelector('.reader-chapter-title');
      const bodyStyle = window.getComputedStyle(p);
      const titleStyle = titleEl ? window.getComputedStyle(titleEl) : bodyStyle;
      const bodyFontSize = parseFloat(bodyStyle.fontSize) || 16;
      const titleFontSize = parseFloat(titleStyle.fontSize) || bodyFontSize;
      const bodyLineHeight = parseFloat(bodyStyle.lineHeight) || bodyFontSize * 1.58;
      const titleLineHeight = parseFloat(titleStyle.lineHeight) || titleFontSize * 1.2;
      const titleMarginBottom = parseFloat(titleStyle.marginBottom) || Math.round(bodyLineHeight * 0.35);
      const bodyFont = bodyStyle.font || `${bodyStyle.fontWeight} ${bodyStyle.fontSize} ${bodyStyle.fontFamily}`;
      const titleFont = titleStyle.font || `${titleStyle.fontWeight} ${titleStyle.fontSize} ${titleStyle.fontFamily}`;
      const next = {
        width: box.clientWidth,
        height: box.clientHeight,
        bodyFont,
        bodyLineHeight,
        titleFont,
        titleLineHeight,
        titleMarginBottom
      };
      setLayout((prev) => (
        prev.width === next.width &&
        prev.height === next.height &&
        prev.bodyFont === next.bodyFont &&
        prev.bodyLineHeight === next.bodyLineHeight &&
        prev.titleFont === next.titleFont &&
        prev.titleLineHeight === next.titleLineHeight &&
        prev.titleMarginBottom === next.titleMarginBottom ? prev : next
      ));
    };

    calc();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(calc) : null;
    if (textBoxRef.current) observer?.observe(textBoxRef.current);
    window.addEventListener('resize', calc);
    document.fonts?.ready?.then(calc).catch(() => {});

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', calc);
    };
  }, []);

  useEffect(() => listenToUser(setUser), []);
  useEffect(() => listenToStoryStats(storyId, (s) => { setLikeCount(s.likeCount); setCommentCount(s.commentCount); }), [storyId]);
  useEffect(() => listenToUserLike(storyId, setLiked), [storyId]);
  useEffect(() => (showComments ? listenToComments(storyId, setComments) : undefined), [storyId, showComments]);
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
      setSpeaking(false);
      setAudioPaused(false);
    }
  }, [page]);
  useEffect(() => () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);
  useEffect(() => setPage(0), [chapters, pages, layout.width, layout.height]);

  async function submitComment(e) {
    e.preventDefault();
    if (!user) {
      await loginWithGoogle();
      return;
    }
    const t = commentText.trim();
    if (!t) return;
    await addStoryComment(storyId, user, t);
    setCommentText('');
  }

  async function shareStory() {
    const url = `${window.location.origin}/historias/${storySlug || ''}`;
    if (navigator.share) await navigator.share({ title, text: title, url });
    else {
      await navigator.clipboard.writeText(url);
      alert('Enlace copiado');
    }
  }

  function toggleAudio() {
    if (!('speechSynthesis' in window)) return;

    if (speaking) {
      window.speechSynthesis.pause();
      setSpeaking(false);
      setAudioPaused(true);
      return;
    }

    if (audioPaused && utteranceRef.current) {
      window.speechSynthesis.resume();
      setSpeaking(true);
      setAudioPaused(false);
      return;
    }

    const txt = [
      current.first ? `Capítulo ${current.chapterNumber}. ${current.chapterTitle}` : `Capítulo ${current.chapterNumber}`,
      current.content
    ].filter(Boolean).join('. ');
    const u = new SpeechSynthesisUtterance(txt);
    utteranceRef.current = u;
    u.lang = 'es-ES';
    u.rate = 0.92;
    u.pitch = 1;
    u.onend = () => {
      utteranceRef.current = null;
      setSpeaking(false);
      setAudioPaused(false);
    };
    u.onerror = () => {
      utteranceRef.current = null;
      setSpeaking(false);
      setAudioPaused(false);
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setSpeaking(true);
    setAudioPaused(false);
  }

  return (
    <section className="reader-shell immersive-reader">
      <div className="reader-top immersive-reader-top">
        <Link className="reader-icon-button reader-top-button" to="/historias" aria-label="Inicio">
          <Home size={20} />
        </Link>
        <div className="reader-current-chapter">
          <span>Capítulo {current.chapterNumber}</span>
          <small>Página {Math.min(page + 1, readerPages.length)} de {readerPages.length || 1}</small>
        </div>
        <button className="reader-icon-button reader-top-button" type="button" onClick={toggleAudio} aria-label={speaking ? 'Pausar audio' : 'Reproducir audio'}>
          {speaking ? <Pause size={22} /> : <Play size={22} />}
        </button>
      </div>

      <div className="book-stage immersive-book-stage">
        <article className="book-page immersive-book-page">
          <div className="paper-grain" />
          <div className="reader-page-content">
            <div ref={textBoxRef} className="reader-text-box">
              {current.first && (
                <div className="reader-chapter-header">
                  <h2 className="reader-chapter-title">{current.chapterTitle}</h2>
                </div>
              )}
              <p>{current.content}</p>
            </div>
          </div>
        </article>
      </div>

      {showComments && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(25,18,10,.48)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: 'min(560px,100%)', maxHeight: '78svh', overflow: 'hidden', borderRadius: 24, background: '#fff8ea', border: '1px solid rgba(120,79,23,.18)', boxShadow: '0 24px 70px rgba(0,0,0,.28)', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div>
                <strong>Comentarios</strong>
                <p style={{ margin: '2px 0 0', fontSize: '.86rem' }}>{title}</p>
              </div>
              <button type="button" className="reader-triangle" onClick={() => setShowComments(false)}><X size={16} /></button>
            </div>
            {user ? (
              <form onSubmit={submitComment} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Escribe un comentario..." style={{ flex: 1, borderRadius: 999, border: '1px solid rgba(120,79,23,.25)', padding: '10px 12px' }} />
                <button type="submit" className="reader-triangle"><Send size={16} /></button>
              </form>
            ) : (
              <button type="button" className="reader-audio-button" onClick={loginWithGoogle} style={{ marginBottom: 12 }}>Iniciar con Google para comentar</button>
            )}
            <div style={{ display: 'grid', gap: 10, maxHeight: '46svh', overflow: 'auto', paddingRight: 4 }}>
              {comments.length === 0 && <small>Aún no hay comentarios.</small>}
              {comments.map((c) => (
                <div key={c.id} style={{ fontSize: '.9rem', borderTop: '1px solid rgba(120,79,23,.12)', paddingTop: 8 }}>
                  <strong>{c.displayName || 'Usuario'}</strong>
                  <p style={{ margin: '3px 0 0' }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="reader-controls immersive-reader-controls" aria-label="Controles del lector">
        <button className="reader-icon-button" onClick={() => setPage((v) => Math.max(v - 1, 0))} disabled={page === 0} aria-label="Página anterior">
          <ChevronLeft size={24} />
        </button>
        <button className="reader-icon-button reader-reaction-button" type="button" onClick={() => toggleStoryLike(storyId)} aria-label="Me gusta">
          <Heart size={22} fill={liked ? 'currentColor' : 'none'} />
          <span>{likeCount}</span>
        </button>
        <button className="reader-icon-button reader-reaction-button" type="button" onClick={() => setShowComments(true)} aria-label="Comentar">
          <MessageCircle size={22} />
          <span>{commentCount}</span>
        </button>
        <button className="reader-icon-button" type="button" onClick={shareStory} aria-label="Compartir">
          <Share2 size={22} />
        </button>
        <button className="reader-icon-button" onClick={() => setPage((v) => Math.min(v + 1, readerPages.length - 1))} disabled={page === readerPages.length - 1} aria-label="Página siguiente">
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
}
