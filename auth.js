// =========================================================
// FRALEN CRM AUTH SYSTEM
// =========================================================
// Handles:
// - Login
// - Signup
// - Email verification
// - Password reset
// - Suspended-shop check
// - Admin redirect
// - Verification redirect
// =========================================================


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


import {
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =========================================================
// SUSPENDED ACCOUNT MESSAGE
// =========================================================

if (
  new URLSearchParams(window.location.search).get("suspended") === "1"
) {

  window.addEventListener("DOMContentLoaded", () => {

    window.showLoginError(
      "Yeh account suspend kar diya gaya hai. Support se contact karo."
    );

  });

}


// =========================================================
// AUTH ACTION GUARD
// =========================================================
//
// Prevents onAuthStateChanged from redirecting while
// signup/login is still processing.
//
// Especially important during signup because
// createUserWithEmailAndPassword() automatically signs
// the user in and triggers onAuthStateChanged().
// =========================================================

let authActionInProgress = false;


// =========================================================
// AUTH STATE LISTENER
// =========================================================
//
// If already logged in:
//
// Admin
//   -> admin.html
//
// Normal verified user
//   -> dashboard.html
//
// Normal unverified user
//   -> verify-email.html
// =========================================================

onAuthStateChanged(auth, (user) => {

  if (!user || authActionInProgress) {
    return;
  }


  // -------------------------
  // SUPER ADMIN
  // -------------------------

  if (isAdminUser(user)) {

    window.location.href = "admin.html";

    return;
  }


  // -------------------------
  // NORMAL USER
  // -------------------------

  if (!user.emailVerified) {

    window.location.href = "verify-email.html";

    return;
  }


  // -------------------------
  // VERIFIED USER
  // -------------------------

  window.location.href = "dashboard.html";

});


// =========================================================
// LOGIN
// =========================================================

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

  authActionInProgress = true;


  try {

    // -------------------------
    // FIREBASE LOGIN
    // -------------------------

    const cred =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


    // -------------------------
    // ADMIN
    // -------------------------
    //
    // Admin verification is not required here
    // so the existing super-admin account
    // continues to work normally.
    // -------------------------

    if (isAdminUser(cred.user)) {

      window.location.href = "admin.html";

      return;
    }


    // -------------------------
    // EMAIL VERIFICATION CHECK
    // -------------------------

    if (!cred.user.emailVerified) {

      window.location.href = "verify-email.html";

      return;
    }


    // -------------------------
    // SUSPENDED SHOP CHECK
    // -------------------------

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

      authActionInProgress = false;

      return;
    }


    // -------------------------
    // VERIFIED + ACTIVE USER
    // -------------------------

    window.location.href = "dashboard.html";


  } catch (err) {

    console.error("Login error:", err);


    window.showLoginError(
      friendlyAuthError(err)
    );


    btn.textContent = "Sign In";

    btn.classList.remove("loading");

    authActionInProgress = false;

  }

});


// =========================================================
// SIGN UP
// =========================================================
//
// Every signup creates a completely isolated shop account:
//
// users/{uid}
// =========================================================

const signupForm =
  document.getElementById("signupForm");


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

  authActionInProgress = true;


  try {

    // -------------------------
    // CREATE FIREBASE ACCOUNT
    // -------------------------

    const cred =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );


    // -------------------------
    // CREATE SHOP PROFILE
    // -------------------------

    try {

      await createUserProfile(
        cred.user.uid,
        {
          ownerName,
          shopName,
          email,
          phone
        }
      );

    } catch (profileErr) {

      console.error(
        "Profile creation failed, will self-heal on next page load:",
        profileErr
      );

    }


    // -------------------------
    // SEND EMAIL VERIFICATION
    // -------------------------

    await sendEmailVerification(
      cred.user
    );


    // -------------------------
    // GO TO VERIFICATION PAGE
    // -------------------------

    window.location.href =
      "verify-email.html";


  } catch (err) {

    console.error("Signup error:", err);


    window.showLoginError(
      friendlyAuthError(err)
    );


    btn.textContent = "Create Account";

    btn.classList.remove("loading");

    authActionInProgress = false;

  }

});


// =========================================================
// FORGOT PASSWORD
// =========================================================

window.handleForgotPassword = async function () {

  const email =
    document.getElementById("login-email").value.trim();


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

    console.error(
      "Password reset error:",
      err
    );


    window.showLoginError(
      friendlyAuthError(err)
    );

  }

};


// =========================================================
// FRIENDLY FIREBASE AUTH ERRORS
// =========================================================

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


    case "auth/too-many-requests":

      return "Bahut zyada attempts ho gaye hain. Thodi der baad dobara try karo.";


    case "auth/network-request-failed":

      return "Internet connection check karo aur dobara try karo.";


    default:

      return (
        err && err.message
          ? err.message
          : "Kuch galat ho gaya. Dobara try karo."
      );

  }

}
