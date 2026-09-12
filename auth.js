// auth.js
// This replaces the old app.js. It only runs on index.html (the login/signup page).
// It never touches Firestore data collections directly — all of that
// happens through firebase-config.js on the other pages.

import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  createUserProfile,
  isAdminUser,
  profileDoc,
  signOut,
} from "./firebase-config.js";
import { getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Show a message if we just bounced a suspended shop back here.
if (new URLSearchParams(window.location.search).get('suspended') === '1') {
  window.addEventListener('DOMContentLoaded', () => {
    window.showLoginError("Yeh account suspend kar diya gaya hai. Support se contact karo.");
  });
}

// If someone is already logged in and lands on index.html, skip straight to
// the dashboard — or to the admin panel, if this is the admin account.
onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = isAdminUser(user) ? "admin.html" : "dashboard.html";
});

// ---------- LOGIN ----------
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const btn = document.getElementById("signin-btn");

  btn.textContent = "Signing in...";
  btn.classList.add("loading");

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (!isAdminUser(cred.user)) {
      const snap = await getDoc(profileDoc(cred.user.uid));
      if (snap.exists() && snap.data().status === "suspended") {
        await signOut(auth);
        window.showLoginError("Yeh account suspend kar diya gaya hai. Support se contact karo.");
        btn.textContent = "Sign In";
        btn.classList.remove("loading");
        return;
      }
    }
    window.location.href = isAdminUser(cred.user) ? "admin.html" : "dashboard.html";
  } catch (err) {
    window.showLoginError(friendlyAuthError(err));
    btn.textContent = "Sign In";
    btn.classList.remove("loading");
  }
});

// ---------- SIGN UP ----------
// Every signup = a brand new, fully isolated shop account (users/{uid}).
const signupForm = document.getElementById("signupForm");
signupForm.addEventListener("submit", async () => {
  const shopName = document.getElementById("su-shop").value.trim();
  const ownerName = document.getElementById("su-owner").value.trim();
  const phone = document.getElementById("su-phone").value.trim();
  const email = document.getElementById("su-email").value.trim();
  const password = document.getElementById("su-password").value;
  const btn = document.getElementById("signup-btn");

  btn.textContent = "Creating account...";
  btn.classList.add("loading");

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Create the users/{uid} profile document right away, so every
    // subsequent page has a shop profile to read (owner name, shop name, etc).
    // If this specific write fails for any reason, don't strand the person
    // on an error screen with an orphaned auth account — requireAuth() on
    // dashboard.html self-heals a missing profile doc automatically.
    try {
      await createUserProfile(cred.user.uid, { ownerName, shopName, email, phone });
    } catch (profileErr) {
      console.error("Profile creation failed, will self-heal on next page load:", profileErr);
    }
    window.location.href = "dashboard.html";
  } catch (err) {
    window.showLoginError(friendlyAuthError(err));
    btn.textContent = "Create Account";
    btn.classList.remove("loading");
  }
});

// ---------- FORGOT PASSWORD ----------
window.handleForgotPassword = async function () {
  const email = document.getElementById("login-email").value.trim();
  if (!email) {
    window.showLoginError("Pehle apna email address likho, phir 'Forgot password?' dabao.");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    window.showLoginSuccess("Password reset link bhej diya gaya hai " + email + " par.");
  } catch (err) {
    window.showLoginError(friendlyAuthError(err));
  }
};

function friendlyAuthError(err) {
  const code = err && err.code ? err.code : "";
  switch (code) {
    case "auth/invalid-email": return "Email address sahi format mein nahi hai.";
    case "auth/user-not-found": return "Is email se koi account nahi mila.";
    case "auth/wrong-password":
    case "auth/invalid-credential": return "Email ya password galat hai.";
    case "auth/email-already-in-use": return "Is email se ek account pehle se hai. Login karo.";
    case "auth/weak-password": return "Password kam se kam 6 characters ka hona chahiye.";
    default: return (err && err.message) ? err.message : "Kuch galat ho gaya. Dobara try karo.";
  }
}

