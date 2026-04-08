 // AppVault — main.js  (FINAL v3)

// Fixes: NEW badge, download count on cards, truncated descriptions,

//        Request App in navbar, schema helper, separator fix display



// ---- Toast ----

function showToast(message, type) {

  type = type || "success";

  var container = document.querySelector(".toast-container");

  if (!container) {

    container = document.createElement("div");

    container.className = "toast-container";

    document.body.appendChild(container);

  }

  var toast = document.createElement("div");

  toast.className = "toast " + type;

  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(function() { toast.remove(); }, 3000);

}



// ---- Icon HTML ----

function normalizeIconUrl(icon) {

  if (!icon || typeof icon !== "string") return "";

  var url = icon.trim();

  if (!url) return "";

  if (url.indexOf("//") === 0) return window.location.protocol + url;

  return url;

}



function getAppIconHTML(app, cls, fallbackCls) {

  var iconUrl = normalizeIconUrl(app.icon);

  var initial = (app.name || "").charAt(0) || "?";

  var alt     = String(app.name || "").replace(/"/g, "&quot;");

  if (iconUrl) {

    return '<img class="' + cls + '" src="' + iconUrl + '" alt="' + alt + '" loading="lazy" '

      + 'onerror="this.style.display=\'none\';var f=document.createElement(\'div\');'

      + 'f.className=\'' + fallbackCls + '\';f.textContent=\'' + initial + '\';'

      + 'this.parentNode.insertBefore(f,this.nextSibling);">';

  }

  return '<div class="' + fallbackCls + '">' + initial + '</div>';

}



// ---- Build app card (FIXED: NEW badge, downloads, truncated desc) ----

function buildAppCard(app) {

  var iconHTML = getAppIconHTML(app, "app-card-icon", "app-card-icon-fallback");

  var platform = (app.platform || "android").toLowerCase();

  var platformBadge = platform === "windows"

    ? '<span class="badge badge-windows">Windows</span>'

    : '<span class="badge badge-android">Android</span>';



  var featuredBadge = (app.featured === "yes")

    ? '<span class="badge badge-featured">&#11088; Featured</span>' : "";



  // NEW badge — added within last 7 days

  var newBadge = "";

  if (window.AppVaultDB && window.AppVaultDB.isNewApp(app, 7)) {

    newBadge = '<span class="badge badge-new">NEW</span>';

  }



  var rating    = app.rating ? parseFloat(app.rating).toFixed(1) : "";

  var downloads = app.downloads || "";



  var shareText  = encodeURIComponent("Download " + app.name + " APK free on AppVault! " + window.location.origin + "/app.html?id=" + app.id);

  var waURL      = "https://wa.me/?text=" + shareText;



  // description: already clamped by CSS but also trim server-side newlines

  var desc = (app.description || "No description available.").replace(/\n/g, " ").trim();



  return '<div class="app-card" onclick="window.location.href=\'app.html?id=' + app.id + '\'">'

    + '<div class="app-card-header">' + iconHTML

    + '<div class="app-card-info">'

    + '<div class="app-card-name">' + (app.name || "") + '</div>'

    + '<div class="app-card-developer">' + (app.developer || "Unknown") + '</div>'

    + '<div class="app-card-badges">' + platformBadge + featuredBadge + newBadge + '</div>'

    + '</div></div>'

    + '<div class="app-card-desc">' + desc + '</div>'

    + '<div class="app-card-footer">'

    + (rating    ? '<div class="app-card-rating">&#9733; ' + rating + '</div>' : '<div></div>')

    + (downloads ? '<div class="app-card-downloads">&#8595; ' + downloads + '</div>' : '<div></div>')

    + '<button class="app-card-share-btn" title="Share on WhatsApp" '

    + 'onclick="event.stopPropagation();window.open(\'' + waURL + '\',\'_blank\')">&#128172;</button>'

    + '</div></div>';

}



// ---- Loading / error / empty states ----

function showLoading(id) {

  var el = document.getElementById(id);

  if (el) el.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><span>Loading...</span></div>';

}

function showError(id, msg) {

  var el = document.getElementById(id);

  if (el) el.innerHTML = '<div class="error-state"><div class="error-icon">&#9888;</div><p>' + (msg || "Could not load apps. Please refresh.") + '</p></div>';

}

function showEmpty(id, msg) {

  var el = document.getElementById(id);

  if (el) el.innerHTML = '<div class="empty-state"><div class="empty-icon">&#128230;</div><h3>' + (msg || "No apps found.") + '</h3><p>Check back soon — we add new apps daily.</p></div>';

}



// ---- URL param helper ----

function getParam(name) {

  return new URLSearchParams(window.location.search).get(name) || "";

}



// ---- Mobile menu ----

function initMobileMenu() {

  var btn  = document.getElementById("menuBtn");

  var menu = document.getElementById("mobileMenu");

  if (btn && menu) {

    btn.addEventListener("click", function() { menu.classList.toggle("open"); });

    document.addEventListener("click", function(e) {

      if (!btn.contains(e.target) && !menu.contains(e.target)) {

        menu.classList.remove("open");

      }

    });

  }

}



// ---- Navbar search ----

function initNavbarSearch() {

  var input = document.getElementById("navSearch");

  if (input) {

    input.addEventListener("keydown", function(e) {

      if (e.key === "Enter" && input.value.trim()) {

        window.location.href = "search.html?q=" + encodeURIComponent(input.value.trim());

      }

    });

  }

}



// ---- Footer year ----

function setFooterYear() {

  var el = document.getElementById("footerYear");

  if (el) el.textContent = new Date().getFullYear();

}



// ---- Schema.org JSON-LD for app pages (SEO) ----

function injectAppSchema(app, versions) {

  var latest = versions && versions[0] ? versions[0] : {};

  var schema = {

    "@context": "https://schema.org",

    "@type": "SoftwareApplication",

    "name": app.name,

    "description": app.description || "",

    "applicationCategory": app.category || "Application",

    "operatingSystem": app.platform === "windows" ? "Windows" : "Android",

    "offers": {

      "@type": "Offer",

      "price": "0",

      "priceCurrency": "USD"

    },

    "aggregateRating": app.rating ? {

      "@type": "AggregateRating",

      "ratingValue": app.rating,

      "ratingCount": "1000",

      "bestRating": "5",

      "worstRating": "1"

    } : undefined,

    "softwareVersion": latest.version || "",

    "fileSize": latest.file_size || "",

    "datePublished": latest.release_date || app.added_date || ""

  };

  // remove undefined keys

  Object.keys(schema).forEach(function(k) { if (schema[k] === undefined) delete schema[k]; });

  var s = document.createElement("script");

  s.type = "application/ld+json";

  s.textContent = JSON.stringify(schema);

  document.head.appendChild(s);

}



// ---- Removed app 404 handler ----

function showRemovedApp(id) {

  document.title = "App Not Found | AppVault";

  var container = document.getElementById("appHeader");

  if (!container) return;

  container.innerHTML = '<div style="text-align:center;padding:60px 20px;">'

    + '<div style="font-size:48px;margin-bottom:16px;">&#128230;</div>'

    + '<h2 style="font-size:24px;margin-bottom:8px;">App Not Available</h2>'

    + '<p style="color:var(--text2);margin-bottom:24px;">This app (' + (id||"") + ') was removed or is no longer available.<br>'

    + 'It may have been taken down due to a DMCA request or policy change.</p>'

    + '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">'

    + '<a href="android.html" class="btn btn-primary">&#128241; Browse Android Apps</a>'

    + '<a href="search.html" class="btn btn-secondary">&#128269; Search Apps</a>'

    + '<a href="request.html" class="btn btn-secondary">&#128232; Request This App</a>'

    + '</div></div>';

}



// ---- Init ----

document.addEventListener("DOMContentLoaded", function() {

  initMobileMenu();

  initNavbarSearch();

  setFooterYear();

});
