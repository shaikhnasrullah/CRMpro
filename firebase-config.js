// firebase-config.js
// Single shared Firebase setup for the whole FRALEN CRM.
// Every page imports ONLY from this file — never re-initializes Firebase itself.
// This is what makes the app multi-tenant: every read/write goes through
// tenantCollection()/tenantDoc(), which forces the path under users/{uid}/...

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHSFdvPAI1kz91whHbTj0rgUefVhPthLc",
  authDomain: "loginpage1-16430.firebaseapp.com",
  projectId: "loginpage1-16430",
  storageBucket: "loginpage1-16430.firebasestorage.app",
  messagingSenderId: "438297643443",
  appId: "1:438297643443:web:a2a75a2873d2746613e3c6",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Every logged-in shop's data lives under users/{uid}/<collectionName>.
 * Use this instead of collection(db, "orders") etc.
 *   tenantCollection(uid, "orders")  ->  users/{uid}/orders
 */
function tenantCollection(uid, collectionName) {
  if (!uid) throw new Error("tenantCollection() called without a uid");
  return collection(db, "users", uid, collectionName);
}

/**
 * users/{uid}/<collectionName>/<docId>
 */
function tenantDoc(uid, collectionName, docId) {
  if (!uid) throw new Error("tenantDoc() called without a uid");
  return doc(db, "users", uid, collectionName, docId);
}

/**
 * The profile document itself: users/{uid}
 */
function profileDoc(uid) {
  return doc(db, "users", uid);
}

/**
 * Guard for every "inside app" page (dashboard, customers, create-order, etc).
 * Call this at the top of the page's script. It:
 *  - redirects to index.html if nobody is logged in
 *  - otherwise calls onReady(user) with the Firebase user object
 */
function requireAuth(onReady) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }
    onReady(user);
  });
}

/** Create the users/{uid} profile document right after signup. */
async function createUserProfile(uid, { ownerName, shopName, email, phone }) {
  await setDoc(profileDoc(uid), {
    ownerName: ownerName || "",
    shopName: shopName || "",
    email: email || "",
    phone: phone || "",
    createdAt: serverTimestamp(),
  });
}

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
};
