// firebase.js
// Kept for backward compatibility with pages that still do
// `import { auth, db } from "./firebase.js"`.
// The real setup + multi-tenant helpers now live in firebase-config.js —
// this file just re-exports them so you don't have to touch every <script>
// tag's import path.
export {
  app,
  auth,
  db,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  tenantCollection,
  tenantDoc,
  profileDoc,
  requireAuth,
  createUserProfile,
} from "./firebase-config.js";
