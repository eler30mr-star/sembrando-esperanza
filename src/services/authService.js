import { GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithPopup, signOut } from 'firebase/auth';
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
  await signInWithPopup(auth, provider);
}

export async function logout() {
  if (!auth) return;
  await signOut(auth);
}
