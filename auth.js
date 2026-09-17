import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  isAdminUser,
  createUserProfile,
} from "./firebase-config.js";

// ============================================================
// AUTH STATE
// ============================================================

let authActionInProgress = false;
let waitingForActivation = false;


// ============================================================
// LOGIN FORM
// ============================================================

const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (authActionInProgress) return;

    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");

    const email = emailInput?.value.trim();
    const password = passwordInput?.value;

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    authActionInProgress = true;

    try {
      await signInWithEmailAndPassword(auth, email, password);

      window.location.href = "dashboard.html";

    } catch (err) {
      console.error("Login error:", err);

      let message = "Login failed. Please try again.";

      if (err.code === "auth/invalid-credential") {
        message = "Invalid email or password.";
      } else if (err.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (err.code === "auth/wrong-password") {
        message = "Incorrect password.";
      } else if (err.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      }

      alert(message);
      authActionInProgress = false;
    }
  });
}


// ============================================================
// SIGNUP FORM
// ============================================================

const signupForm = document.getElementById("signup-form");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (authActionInProgress) return;

    const ownerNameInput = document.getElementById("signup-owner-name");
    const shopNameInput = document.getElementById("signup-shop-name");
    const emailInput = document.getElementById("signup-email");
    const phoneInput = document.getElementById("signup-phone");
    const passwordInput = document.getElementById("signup-password");

    const ownerName = ownerNameInput?.value.trim();
    const shopName = shopNameInput?.value.trim();
    const email = emailInput?.value.trim();
    const phone = phoneInput?.value.trim();
    const password = passwordInput?.value;

    if (!ownerName || !shopName || !email || !phone || !password) {
      alert("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    authActionInProgress = true;
    waitingForActivation = true;

    try {
      // --------------------------------------------------------
      // CREATE FIREBASE ACCOUNT
      // --------------------------------------------------------

      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // --------------------------------------------------------
      // CREATE USER PROFILE
      // --------------------------------------------------------

      try {
        await createUserProfile(cred.user.uid, {
          ownerName,
          shopName,
          email,
          phone,
        });
      } catch (profileErr) {
        console.error(
          "Profile creation failed, will self-heal on next page load:",
          profileErr
        );
      }

      // --------------------------------------------------------
      // SHOW PAYMENT ACTIVATION POPUP
      // --------------------------------------------------------

      if (typeof window.showPaymentActivation === "function") {
        window.showPaymentActivation();
      } else {
        console.error(
          "showPaymentActivation() function not found."
        );

        // Safety fallback
        waitingForActivation = false;
        authActionInProgress = false;
        window.location.href = "dashboard.html";
        return;
      }

      // --------------------------------------------------------
      // CONTINUE BUTTON
      // --------------------------------------------------------

      window.onActivationContinue = function () {
        waitingForActivation = false;
        authActionInProgress = false;

        window.location.href = "dashboard.html";
      };

    } catch (err) {
      console.error("Signup error:", err);

      waitingForActivation = false;
      authActionInProgress = false;

      let message = "Signup failed. Please try again.";

      if (err.code === "auth/email-already-in-use") {
        message = "This email is already registered.";
      } else if (err.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (err.code === "auth/weak-password") {
        message = "Password must be at least 6 characters.";
      }

      alert(message);
    }
  });
}


// ============================================================
// FORGOT PASSWORD
// ============================================================

const forgotPasswordForm =
  document.getElementById("forgot-password-form");

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput =
      document.getElementById("forgot-email") ||
      document.getElementById("reset-email");

    const email = emailInput?.value.trim();

    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);

      alert(
        "Password reset email sent. Please check your inbox."
      );

    } catch (err) {
      console.error("Password reset error:", err);

      let message =
        "Unable to send password reset email.";

      if (err.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (err.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      }

      alert(message);
    }
  });
}


// ============================================================
// LOGOUT
// ============================================================

const logoutButtons =
  document.querySelectorAll("[data-logout], #logout-btn");

logoutButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "index.html";
    } catch (err) {
      console.error("Logout error:", err);
      alert("Unable to logout. Please try again.");
    }
  });
});


// ============================================================
// AUTH STATE CHANGE
// ============================================================

onAuthStateChanged(auth, (user) => {

  // No logged-in user
  if (!user) {
    return;
  }

  // Do not redirect while signup/payment activation is in progress
  if (authActionInProgress || waitingForActivation) {
    return;
  }

  // Admin
  if (isAdminUser(user)) {
    window.location.href = "admin.html";
    return;
  }

  // Normal shop user
  window.location.href = "dashboard.html";
});

Is code mein main change sirf signup flow ka hai: account create hone ke baad "payment-qr.jpg" wala existing activation popup open hoga, aur Continue dabane ke baad dashboard open hoga.

Ek cheez check karna: aapke "index.html" mein QR filename "payment-qr.jpg" hi hona chahiye.
