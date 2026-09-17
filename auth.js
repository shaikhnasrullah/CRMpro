// auth.jsN
// auth.js
// Login + Signup + Payment Activation + Suspended Account Check

import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  createUserProfile,
  profileDoc,
  signOut,
} from "./firebase-config.js";

import {
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// Show message if account was redirected after suspension
if (new URLSearchParams(window.location.search).get('suspended') === '1') {
  window.addEventListener('DOMContentLoaded', () => {
    window.showLoginError(
      "Yeh account suspend kar diya gaya hai. Support se contact karo."
    );
  });
}


// If someone is already logged in and lands on index.html,
// skip straight to dashboard.
// During signup we temporarily stop this redirect.
let holdForActivation = false;

onAuthStateChanged(auth, async (user) => {

  if (!user || holdForActivation) return;

  try {

    const snap = await getDoc(profileDoc(user.uid));

    if (
      snap.exists() &&
      snap.data().status === "suspended"
    ) {

      await signOut(auth);

      window.showLoginError(
        "Yeh account suspend kar diya gaya hai. Support se contact karo."
      );

      return;
    }

  } catch (e) {
    console.error("Suspend check failed:", e);
  }

  window.location.href = "dashboard.html";

});


// ======================================================
// LOGIN
// ======================================================

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async () => {

  const email =
    document.getElementById("login-email").value.trim();

  const password =
    document.getElementById("login-password").value;

  const btn =
    document.getElementById("signin-btn");

  btn.textContent = "Signing in...";
  btn.classList.add("loading");

  try {

    const cred =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    // Suspend check
    const snap =
      await getDoc(
        profileDoc(cred.user.uid)
      );

    if (
      snap.exists() &&
      snap.data().status === "suspended"
    ) {

      await signOut(auth);

      window.showLoginError(
        "Yeh account suspend kar diya gaya hai. Support se contact karo."
      );

      btn.textContent = "Sign In";
      btn.classList.remove("loading");

      return;
    }

    window.location.href = "dashboard.html";

  } catch (err) {

    window.showLoginError(
      friendlyAuthError(err)
    );

    btn.textContent = "Sign In";
    btn.classList.remove("loading");

  }

});


// ======================================================
// SIGNUP
// ======================================================

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async () => {

  const shopName =
    document.getElementById("su-shop").value.trim();

  const ownerName =
    document.getElementById("su-owner").value.trim();

  const phone =
    document.getElementById("su-phone").value.trim();

  const email =
    document.getElementById("su-email").value.trim();

  const password =
    document.getElementById("su-password").value;

  const btn =
    document.getElementById("signup-btn");

  btn.textContent = "Creating account...";
  btn.classList.add("loading");

  try {

    holdForActivation = true;

    const cred =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    await createUserProfile(
      cred.user.uid,
      {
        ownerName,
        shopName,
        email,
        phone
      }
    );

    btn.textContent = "Create Account";
    btn.classList.remove("loading");

    // Show payment popup
    window.onActivationContinue = function () {

      holdForActivation = false;

      window.location.href =
        "dashboard.html";
    };

    window.showPaymentActivation();

  } catch (err) {

    holdForActivation = false;

    window.showLoginError(
      friendlyAuthError(err)
    );

    btn.textContent = "Create Account";
    btn.classList.remove("loading");

  }

});


// ======================================================
// FORGOT PASSWORD
// ======================================================

window.handleForgotPassword = async function () {

  const email =
    document.getElementById("login-email")
    .value
    .trim();

  if (!email) {

    window.showLoginError(
      "Pehle apna email address likho, phir 'Forgot password?' dabao."
    );

    return;
  }

  try {

    await sendPasswordResetEmail(
      auth,
      email
    );

    window.showLoginSuccess(
      "Password reset link bhej diya gaya hai " +
      email +
      " par."
    );

  } catch (err) {

    window.showLoginError(
      friendlyAuthError(err)
    );

  }

};


// ======================================================
// FRIENDLY ERRORS
// ======================================================

function friendlyAuthError(err) {

  const code =
    err && err.code
      ? err.code
      : "";

  switch (code) {

    case "auth/invalid-email":
      return "Email address sahi format mein nahi hai.";

    case "auth/user-not-found":
      return "Is email se koi account nahi mila.";

    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email ya password galat hai.";

    case "auth/email-already-in-use":
      return "Is email se ek account pehle se hai. Login karo.";

    case "auth/weak-password":
      return "Password kam se kam 6 characters ka hona chahiye.";

    default:
      return (err && err.message)
        ? err.message
        : "Kuch galat ho gaya. Dobara try karo.";
  }

}
