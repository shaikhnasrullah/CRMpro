/* FRALEN CRM cookie consent. Load from index.html and privacy/privacy-policy.html only. */
(function () {
  var SRC = (document.currentScript && document.currentScript.src) || location.href;
  var POLICY = new URL("../privacy/privacy-policy.html", SRC).href;
  var HOME = new URL("../index.html", SRC).href;
  var KEY = "fralen_cookie_consent";
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}

  // Other scripts can check: window.fralenConsent.analytics === true
  window.fralenConsent = saved || { essential: true, analytics: false };
  if (saved) return;

  var css = document.createElement("style");
  css.textContent =
    "#fcc{position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#fff;color:#1d2433;font:16px/1.5 system-ui,sans-serif;padding:1.25rem 1.25rem 1.5rem;box-shadow:0 -4px 24px rgba(15,31,61,.25);border-top:4px solid #f5a623}" +
    "#fcc .in{max-width:720px;margin:0 auto}" +
    "#fcc h2{margin:0 0 .5rem;font-size:1.3rem;color:#0f1f3d}" +
    "#fcc p{margin:0 0 1rem;font-size:.95rem}" +
    "#fcc a{color:#1b3157}" +
    "#fcc .btns{display:flex;flex-direction:column;gap:.6rem}" +
    "#fcc button{font:600 1rem system-ui,sans-serif;padding:.8rem 1rem;border-radius:6px;cursor:pointer;border:2px solid #0f1f3d}" +
    "#fcc .pri{background:#0f1f3d;color:#fff}" +
    "#fcc .sec{background:#fff;color:#0f1f3d}" +
    "#fcc button:focus-visible{outline:3px solid #f5a623;outline-offset:2px}" +
    "#fcc .opts{display:none;margin:0 0 1rem;border:1px solid #e1e5ee;border-radius:6px}" +
    "#fcc .opts label{display:flex;gap:.7rem;align-items:flex-start;padding:.75rem;font-size:.92rem}" +
    "#fcc .opts label+label{border-top:1px solid #e1e5ee}" +
    "#fcc input{margin-top:.3rem;width:1.1rem;height:1.1rem;accent-color:#0f1f3d}" +
    "@media(min-width:640px){#fcc .btns{flex-direction:row}#fcc button{flex:1}}";
  document.head.appendChild(css);

  var box = document.createElement("div");
  box.id = "fcc";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", "Cookie consent");
  box.innerHTML =
    '<div class="in">' +
    "<h2>We value your privacy</h2>" +
    "<p>We use essential cookies to keep you logged in, and optional analytics cookies to understand how FRALEN CRM is used. " +
    'Read our <a href="' + POLICY + '">Privacy Policy</a>.</p>' +
    '<div class="opts" id="fccOpts">' +
    '<label><input type="checkbox" checked disabled><span><strong>Essential</strong><br>Login and security. Always on.</span></label>' +
    '<label><input type="checkbox" id="fccAn"><span><strong>Analytics</strong><br>Anonymous usage data to improve the product.</span></label>' +
    "</div>" +
    '<div class="btns">' +
    '<button class="pri" id="fccAll">Accept All</button>' +
    '<button class="sec" id="fccCus">Customise</button>' +
    '<button class="sec" id="fccRej">Reject All</button>' +
    "</div></div>";
  document.body.appendChild(box);

  function save(analytics) {
    var c = { essential: true, analytics: analytics, date: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    window.fralenConsent = c;
    box.remove();
  }

  var customising = false;
  document.getElementById("fccAll").onclick = function () {
    save(true);
    // On the privacy policy page, go back to the landing page after accepting
    if (/privacy-policy/i.test(location.pathname)) location.href = HOME;
  };
  document.getElementById("fccRej").onclick = function () { save(false); };
  document.getElementById("fccCus").onclick = function () {
    if (!customising) {
      customising = true;
      document.getElementById("fccOpts").style.display = "block";
      this.textContent = "Save choices";
    } else {
      save(document.getElementById("fccAn").checked);
    }
  };
})();
