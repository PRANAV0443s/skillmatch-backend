// ============================================================
// firebase.js – SkillMatch Firebase initialization
// All values come from .env (VITE_FIREBASE_*)
// ============================================================
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC-HqpzEfJ3WLOH1CUQ4rSd5Itbzxp_54A",
  authDomain: "skillmatch-1343d.firebaseapp.com",
  projectId: "skillmatch-1343d",
  storageBucket: "skillmatch-1343d.firebasestorage.app",
  messagingSenderId: "209035377906",
  appId: "1:209035377906:web:d2e532b5e1f2446dcf246b"
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
setPersistence(auth, browserLocalPersistence).catch(() => {});

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
};

export default app;