import { addDoc, collection, deleteDoc, doc, getDoc, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import { ensureReactionUser } from './authService.js';

function refs(storyId, uid = '') {
  const likes = collection(db, 'storyReactions', storyId, 'likes');
  const comments = collection(db, 'storyReactions', storyId, 'comments');
  const like = uid ? doc(likes, uid) : null;
  return { likes, comments, like };
}

export function listenToStoryStats(storyId, callback) {
  if (!db || !storyId) {
    callback({ likeCount: 0, commentCount: 0 });
    return () => {};
  }
  // Datos derivados de documentos reales; ningún visitante escribe contadores manipulables.
  const counts = { likeCount: 0, commentCount: 0 };
  const publish = () => callback({ ...counts });
  const { likes, comments } = refs(storyId);
  const stopLikes = onSnapshot(likes, (snapshot) => {
    counts.likeCount = snapshot.size;
    publish();
  }, (error) => console.error('No se pudieron consultar los likes:', error));
  const stopComments = onSnapshot(comments, (snapshot) => {
    counts.commentCount = snapshot.size;
    publish();
  }, (error) => console.error('No se pudieron consultar los comentarios:', error));
  return () => { stopLikes(); stopComments(); };
}

export function listenToUserLike(storyId, callback) {
  if (!db || !storyId) { callback(false); return () => {}; }
  let stopLike = () => {};
  let disposed = false;
  ensureReactionUser().then((user) => {
    if (disposed) return;
    stopLike = onSnapshot(refs(storyId, user.uid).like, (snapshot) => callback(snapshot.exists()),
      (error) => console.error('No se pudo consultar el like:', error));
  }).catch((error) => console.error('No se pudo iniciar sesión anónima para reacciones:', error));
  return () => { disposed = true; stopLike(); };
}

export function listenToComments(storyId, callback) {
  if (!db || !storyId) { callback([]); return () => {}; }
  return onSnapshot(query(refs(storyId).comments, orderBy('createdAtMs', 'desc'), limit(30)),
    (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    (error) => console.error('No se pudieron consultar los comentarios:', error));
}

export async function toggleStoryLike(storyId) {
  if (!db || !storyId) throw new Error('No se pudo registrar el me gusta.');
  const user = await ensureReactionUser();
  const like = refs(storyId, user.uid).like;
  const existing = await getDoc(like);
  if (existing.exists()) await deleteDoc(like);
  else await setDoc(like, { uid: user.uid, createdAt: serverTimestamp() });
}

export async function addStoryComment(storyId, user, text) {
  const cleanText = String(text || '').trim();
  if (!db || !storyId || !user?.uid || user.isAnonymous) throw new Error('Debes iniciar sesión con Google para comentar.');
  if (!cleanText) return;
  if (cleanText.length > 1500) throw new Error('El comentario supera los 1500 caracteres.');
  await addDoc(refs(storyId).comments, {
    text: cleanText,
    uid: user.uid,
    displayName: String(user.displayName || 'Usuario').slice(0, 100),
    photoURL: String(user.photoURL || '').slice(0, 2048),
    createdAt: serverTimestamp(),
    createdAtMs: Date.now()
  });
}

export async function removeStoryComment(storyId, commentId, user) {
  if (!db || !storyId || !commentId || !user?.uid) return;
  const commentRef = doc(db, 'storyReactions', storyId, 'comments', commentId);
  const snapshot = await getDoc(commentRef);
  if (snapshot.data()?.uid === user.uid) await deleteDoc(commentRef);
}
