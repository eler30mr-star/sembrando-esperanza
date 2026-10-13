import { GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithPopup, linkWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebase.js';

const provider = new GoogleAuthProvider();

export function listenToUser(callback) {
  if (!auth) { callback(null); return () => {}; }
  return onAuthStateChanged(auth, callback);
}

export async function ensureReactionUser() {
  if (!auth) throw new Error('Firebase Auth no está configurado.');
  if (auth.currentUser) return auth.currentUser;
  const result = await signInAnonymously(auth);
  return result.user;
}

export async function loginWithGoogle() {
  if (!auth) throw new Error('Firebase Auth no está configurado.');
  // Al vincular al visitante anónimo se conserva el UID y sus likes.
  if (auth.currentUser?.isAnonymous) {
    try {
      return (await linkWithPopup(auth.currentUser, provider)).user;
    } catch (error) {
      // Si Google ya tiene una cuenta Firebase, no se puede vincular al UID anónimo.
      // El inicio de sesión sigue disponible; los likes de ese UID no se migran.
      if (!['auth/credential-already-in-use', 'auth/email-already-in-use',
        'auth/provider-already-linked'].includes(error.code)) throw error;
    }
  }
  return (await signInWithPopup(auth, provider)).user;
}

export async function logout() {
  if (!auth) return;
  await signOut(auth);
}
