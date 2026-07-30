// app.js — DEPRECATED.
// index.html now loads auth.js instead of this file. Real login/signup/
// forgot-password/logout logic lives there (see auth.js).
//
// This file used to also contain a "customerForm" handler that wrote to
// a global "customers" collection — that form doesn't exist in the
// current customers.html, so it's been dropped rather than converted.
//
// Safe to delete app.js from the repo once you've confirmed index.html
// is loading auth.js (check the last <script> tag in index.html).
console.warn("app.js is deprecated — index.html should load auth.js instead.");
