// ============================================================
// firebase.js – SkillMatch Firebase initialization
// All values come from .env (VITE_FIREBASE_*)
// ============================================================
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// Validate config at startup (dev-friendly error message)
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
  console.error(
    '⚠️  Firebase is not configured.\n' +
    'Copy frontend/.env.example → frontend/.env and fill in your Firebase project values.\n' +
    'See FIREBASE_SETUP.md for step-by-step instructions.'
  )
}

const app    = initializeApp(firebaseConfig)
export const auth    = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Force account picker every time (allows switching Google accounts)
googleProvider.setCustomParameters({ prompt: 'select_account' })

// Persist login across browser sessions
setPersistence(auth, browserLocalPersistence).catch(() => {})

// Named exports for convenience
export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
}

export default app
