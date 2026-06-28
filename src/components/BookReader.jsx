import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Home, MessageCircle, Pause, Play, Send, Share2, X } from 'lucide-react';
import { listenToUser, loginWithGoogle } from '../services/authService.js';
import { addStoryComment, listenToComments, listenToStoryStats, listenToUserLike, toggleStoryLike } from '../services/storyEngagementService.js';

const LIMIT = 740;

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function split(text) {
  const out = [];
  let rest = clean(text);
  while (rest.length > LIMIT) {
    let cut = rest.lastIndexOf(' ', LIMIT);
    if (cut < 540) cut = LIMIT;
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) out.push(rest);
  return out.length ? out : [''];
}

const actionStyle = { border: 0, background: 'transparent', color: '#6f4b16', fontWeight: 800, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer' };

export default function BookReader({ title, chapters = [], pages = [], storyId, storySlug }) {
  const [page, setPage] = useState(0);
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

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

  useEffect(() => listenToUser(setUser), []);
  useEffect(() => listenToStoryStats(storyId, (stats) => { setLikeCount(stats.likeCount); setCommentCount(stats.commentCount); }), [storyId]);
  useEffect(() => listenToUserLike(storyId, setLiked), [storyId]);
  useEffect(() => (showComments ? listenToComments(storyId, setComments) : undefined), [storyId, showComments]);
  useEffect(() => { if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); setSpeaking(false); } }, [page]);
  useEffect(() => () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);

  async function submitComment(event) {
    event.preventDefault();
    if (!user) { await loginWithGoogle(); return; }
    const text = commentText.trim();
    if (!text) return;
    await addStoryComment(storyId, user, text);
    setCommentText('');
  }

  async function shareStory() {
    const url = `${window.location.origin}/historias/${storySlug || ''}`;
    if (navigator.share) await navigator.share({ title, text: title, url });
    else { await navigator.clipboard.writeText(url); alert('Enlace copiado'); }
  }

  function toggleAudio() {
    if (!('speechSynthesis' in window)) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const audioText = [page === 0 ? title : '', current.first ? `Capítulo ${current.chapterNumber}. ${current.chapterTitle}` : '', current.content].filter(Boolean).join('. ');
    const utterance = new SpeechSynthesisUtterance(audioText);
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
      <div className="reader-top immersive-reader-top" style={{ justifyContent: 'center', textAlign: 'center' }}><div style={{ width: '100%', textAlign: 'center' }}><h1>{title}</h1></div></div>
      <div className="book-stage immersive-book-stage"><article className="book-page immersive-book-page"><div className="paper-grain" /><div className="reader-page-content" style={{ position: 'relative', height: '100%', overflow: 'hidden', paddingBottom: 104, boxSizing: 'border-box' }}><div style={{ height: '100%', overflow: 'hidden' }}>{current.first && <div style={{ textAlign: 'center', marginBottom: 16 }}><span style={{ display: 'block', marginBottom: 6, color: 'var(--gold-dark)', fontWeight: 800, letterSpacing: '0.12em' }}>CAPÍTULO {current.chapterNumber}</span><h2 className="reader-chapter-title">{current.chapterTitle}</h2></div>}<p style={{ margin: 0, fontSize: '1.04rem', lineHeight: 1.58, textAlign: 'justify' }}>{current.content}</p></div><div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', gap: 18 }}><button type="button" style={actionStyle} onClick={() => toggleStoryLike(storyId)} aria-label="Me gusta"><Heart size={22} fill={liked ? 'currentColor' : 'none'} /><span>{likeCount}</span></button><button type="button" style={actionStyle} onClick={() => setShowComments(true)} aria-label="Comentar"><MessageCircle size={22} /><span>{commentCount}</span></button><button type="button" style={actionStyle} onClick={shareStory} aria-label="Compartir"><Share2 size={22} /><span>Compartir</span></button></div></div></article></div>
      {showComments && <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(25,18,10,.48)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 16 }}><div style={{ width: 'min(560px,100%)', maxHeight: '78svh', overflow: 'hidden', borderRadius: 24, background: '#fff8ea', border: '1px solid rgba(120,79,23,.18)', boxShadow: '0 24px 70px rgba(0,0,0,.28)', padding: 16 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}><div><strong>Comentarios</strong><p style={{ margin: '2px 0 0', fontSize: '.86rem' }}>{title}</p></div><button type="button" className="reader-triangle" onClick={() => setShowComments(false)}><X size={16} /></button></div>{user ? <form onSubmit={submitComment} style={{ display: 'flex', gap: 8, marginBottom: 12 }}><input value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Escribe un comentario..." style={{ flex: 1, borderRadius: 999, border: '1px solid rgba(120,79,23,.25)', padding: '10px 12px' }} /><button type="submit" className="reader-triangle"><Send size={16} /></button></form> : <button type="button" className="reader-audio-button" onClick={loginWithGoogle} style={{ marginBottom: 12 }}>Iniciar con Google para comentar</button>}<div style={{ display: 'grid', gap: 10, maxHeight: '46svh', overflow: 'auto', paddingRight: 4 }}>{comments.length === 0 && <small>Aún no hay comentarios.</small>}{comments.map((comment) => <div key={comment.id} style={{ fontSize: '.9rem', borderTop: '1px solid rgba(120,79,23,.12)', paddingTop: 8 }}><strong>{comment.displayName || 'Usuario'}</strong><p style={{ margin: '3px 0 0' }}>{comment.text}</p></div>)}</div></div></div>}
      <div className="reader-controls immersive-reader-controls"><Link className="reader-home-button" to="/historias"><Home size={18} /> Inicio</Link><button className="reader-triangle" onClick={() => setPage((value) => Math.max(value - 1, 0))} disabled={page === 0}>◀</button><button className="reader-audio-button" type="button" onClick={toggleAudio}>{speaking ? <Pause size={18} /> : <Play size={18} />} Audio</button><button className="reader-triangle" onClick={() => setPage((value) => Math.min(value + 1, readerPages.length - 1))} disabled={page === readerPages.length - 1}>▶</button></div>
    </section>
  );
}
