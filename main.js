// AppVault — main.js  (ENHANCED v4)
// New: Bookmarks/Wishlist, Recently Viewed, Live Search Autocomplete,
//      Version badge on cards, Copy download link, compact cards

// ========== STORAGE HELPERS ==========
var AV = {
  get: function(key) {
    try { return JSON.parse(localStorage.getItem("av_" + key) || "null"); } catch(e) { return null; }
  },
  set: function(key, val) {
    try { localStorage.setItem("av_" + key, JSON.stringify(val)); } catch(e) {}
  }
};

// ========== BOOKMARKS ==========
var Bookmarks = {
  getAll: function() { return AV.get("bookmarks") || []; },
  toggle: function(appId) {
    var list = this.getAll();
    var idx  = list.indexOf(appId);
    if (idx > -1) { list.splice(idx, 1); }
    else { list.unshift(appId); if (list.length > 100) list.pop(); }
    AV.set("bookmarks", list);
    return idx === -1;
  },
  has: function(appId) { return this.getAll().indexOf(appId) > -1; },
  count: function() { return this.getAll().length; }
};

// ========== RECENTLY VIEWED ==========
var RecentlyViewed = {
  getAll: function() { return AV.get("recent") || []; },
  add: function(appId) {
    var list = this.getAll().filter(function(id) { return id !== appId; });
    list.unshift(appId);
    if (list.length > 20) list.pop();
    AV.set("recent", list);
  },
  getIds: function(limit) { return this.getAll().slice(0, limit || 8); }
};

// ========== TOAST ==========
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
  setTimeout(function() {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(120%)";
    setTimeout(function() { toast.remove(); }, 300);
  }, 2700);
}

// ========== ICON HTML ==========
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

// ========== BUILD APP CARD (compact v4 with version + bookmark) ==========
function buildAppCard(app) {
  var iconHTML  = getAppIconHTML(app, "app-card-icon", "app-card-icon-fallback");
  var platform  = (app.platform || "android").toLowerCase();
  var platformBadge = platform === "windows"
    ? '<span class="badge badge-windows">Win</span>'
    : '<span class="badge badge-android">APK</span>';

  var featuredBadge = (app.featured === "yes")
    ? '<span class="badge badge-featured">&#11088;</span>' : "";

  var newBadge = "";
  if (window.AppVaultDB && window.AppVaultDB.isNewApp && window.AppVaultDB.isNewApp(app, 7)) {
    newBadge = '<span class="badge badge-new">NEW</span>';
  }

  var versionBadge = app.latest_version
    ? '<span class="app-card-version">v' + app.latest_version + '</span>' : "";

  var rating    = app.rating ? parseFloat(app.rating).toFixed(1) : "";
  var downloads = app.downloads || "";
  var isBookmarked = Bookmarks.has(app.id);
  var safeId = app.id ? app.id.replace(/'/g, "") : "";
  var safeName = (app.name || "").replace(/'/g, "").replace(/"/g, "");

  var shareText = encodeURIComponent("Download " + app.name + " APK free on AppVault! " + window.location.origin + "/app.html?id=" + safeId);
  var waURL     = "https://wa.me/?text=" + shareText;
  var desc      = (app.description || "No description available.").replace(/\n/g, " ").trim();

  return '<div class="app-card" onclick="window.location.href=\'app.html?id=' + safeId + '\'">'
    + '<div class="app-card-header">' + iconHTML
    + '<div class="app-card-info">'
    + '<div class="app-card-name">' + (app.name || "") + '</div>'
    + '<div class="app-card-developer">' + (app.developer || "Unknown") + '</div>'
    + '<div class="app-card-badges">' + platformBadge + featuredBadge + newBadge + versionBadge + '</div>'
    + '</div>'
    + '<button class="app-card-bookmark' + (isBookmarked ? ' bookmarked' : '') + '" '
    + 'title="' + (isBookmarked ? 'Remove from wishlist' : 'Save to wishlist') + '" '
    + 'onclick="event.stopPropagation();toggleBookmark(this,\'' + safeId + '\',\'' + safeName + '\')">'
    + (isBookmarked ? '&#10084;&#65039;' : '&#9825;') + '</button>'
    + '</div>'
    + '<div class="app-card-desc">' + desc + '</div>'
    + '<div class="app-card-footer">'
    + (rating    ? '<div class="app-card-rating">&#9733; ' + rating + '</div>' : '<div></div>')
    + (downloads ? '<div class="app-card-downloads">&#8595; ' + downloads + '</div>' : '<div></div>')
    + '<button class="app-card-share-btn" title="Share on WhatsApp" '
    + 'onclick="event.stopPropagation();window.open(\'' + waURL + '\',\'_blank\')">&#128172;</button>'
    + '</div></div>';
}

// ========== BOOKMARK TOGGLE ==========
function toggleBookmark(btn, appId, appName) {
  var added = Bookmarks.toggle(appId);
  btn.innerHTML  = added ? "&#10084;&#65039;" : "&#9825;";
  btn.title      = added ? "Remove from wishlist" : "Save to wishlist";
  btn.classList.toggle("bookmarked", added);
  showToast(added ? (appName || "App") + " saved to Wishlist ❤" : "Removed from Wishlist", added ? "success" : "info");
  var badge = document.getElementById("bookmarkCount");
  if (badge) {
    var c = Bookmarks.count();
    badge.textContent = c > 0 ? c : "";
    badge.style.display = c > 0 ? "" : "none";
  }
}

// ========== LOADING / ERROR / EMPTY ==========
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

// ========== URL PARAM ==========
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name) || "";
}

// ========== MOBILE MENU ==========
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

// ========== LIVE SEARCH AUTOCOMPLETE ==========
function initNavbarSearch() {
  var input = document.getElementById("navSearch");
  if (!input) return;

  var wrap = input.parentElement;
  wrap.style.position = "relative";

  var dropdown = document.createElement("div");
  dropdown.className = "search-autocomplete";
  dropdown.id = "searchAutocomplete";
  wrap.appendChild(dropdown);

  var debounceTimer;
  var activeIndex = -1;

  input.addEventListener("input", function() {
    clearTimeout(debounceTimer);
    var q = input.value.trim();
    if (q.length < 2) { dropdown.classList.remove("open"); activeIndex = -1; return; }
    debounceTimer = setTimeout(function() { fetchAutocomplete(q); }, 180);
  });

  input.addEventListener("keydown", function(e) {
    var items = dropdown.querySelectorAll(".ac-item");
    if (e.key === "ArrowDown") {
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      updateActive(items); e.preventDefault();
    } else if (e.key === "ArrowUp") {
      activeIndex = Math.max(activeIndex - 1, -1);
      updateActive(items); e.preventDefault();
    } else if (e.key === "Enter") {
      if (activeIndex > -1 && items[activeIndex]) {
        items[activeIndex].click();
      } else if (input.value.trim()) {
        window.location.href = "search.html?q=" + encodeURIComponent(input.value.trim());
      }
    } else if (e.key === "Escape") {
      dropdown.classList.remove("open"); activeIndex = -1;
    }
  });

  document.addEventListener("click", function(e) {
    if (!wrap.contains(e.target)) { dropdown.classList.remove("open"); }
  });

  function updateActive(items) {
    items.forEach(function(it, i) { it.classList.toggle("active", i === activeIndex); });
  }

  function fetchAutocomplete(q) {
    if (!window.AppVaultDB) return;
    window.AppVaultDB.getApps().then(function(apps) {
      var lower = q.toLowerCase();
      var matches = apps.filter(function(a) {
        return (a.name || "").toLowerCase().indexOf(lower) > -1 ||
               (a.developer || "").toLowerCase().indexOf(lower) > -1 ||
               (a.category || "").toLowerCase().indexOf(lower) > -1;
      }).slice(0, 7);

      if (matches.length === 0) { dropdown.classList.remove("open"); return; }
      activeIndex = -1;

      dropdown.innerHTML = matches.map(function(app) {
        var iconUrl = normalizeIconUrl(app.icon);
        var iconStr = iconUrl
          ? '<img class="ac-icon" src="' + iconUrl + '" loading="lazy" onerror="this.style.display=\'none\'">'
          : '<div class="ac-icon ac-icon-fb">' + (app.name || "?").charAt(0) + '</div>';
        var platform = (app.platform || "android").toLowerCase();
        var pLabel = platform === "windows" ? "Win" : "APK";
        var safeId = (app.id || "").replace(/'/g, "");
        return '<div class="ac-item" onclick="window.location.href=\'app.html?id=' + safeId + '\'">'
          + iconStr
          + '<div class="ac-info">'
          + '<div class="ac-name">' + (app.name || "") + '</div>'
          + '<div class="ac-meta">' + (app.developer || "") + ' &bull; <span class="ac-platform">' + pLabel + '</span></div>'
          + '</div>'
          + (app.latest_version ? '<div class="ac-ver">v' + app.latest_version + '</div>' : '')
          + '</div>';
      }).join("")
      + '<div class="ac-footer" onclick="window.location.href=\'search.html?q=' + encodeURIComponent(q) + '\'">See all results for &ldquo;<strong>' + q + '</strong>&rdquo; &rarr;</div>';

      dropdown.classList.add("open");
    }).catch(function() {});
  }
}

// ========== FOOTER YEAR ==========
function setFooterYear() {
  var el = document.getElementById("footerYear");
  if (el) el.textContent = new Date().getFullYear();
}

// ========== SCHEMA.ORG ==========
function injectAppSchema(app, versions) {
  var latest = versions && versions[0] ? versions[0] : {};
  var schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": app.name,
    "description": app.description || "",
    "applicationCategory": app.category || "Application",
    "operatingSystem": app.platform === "windows" ? "Windows" : "Android",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
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
  Object.keys(schema).forEach(function(k) { if (schema[k] === undefined) delete schema[k]; });
  var s = document.createElement("script");
  s.type = "application/ld+json";
  s.textContent = JSON.stringify(schema);
  document.head.appendChild(s);
}

// ========== REMOVED APP ==========
function showRemovedApp(id) {
  document.title = "App Not Found | AppVault";
  var container = document.getElementById("appHeader");
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;padding:60px 20px;">'
    + '<div style="font-size:48px;margin-bottom:16px;">&#128230;</div>'
    + '<h2 style="font-size:24px;margin-bottom:8px;">App Not Available</h2>'
    + '<p style="color:var(--text2);margin-bottom:24px;">This app (' + (id||"") + ') was removed or is no longer available.</p>'
    + '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">'
    + '<a href="android.html" class="btn btn-primary">&#128241; Browse Android Apps</a>'
    + '<a href="search.html" class="btn btn-secondary">&#128269; Search Apps</a>'
    + '<a href="request.html" class="btn btn-secondary">&#128232; Request This App</a>'
    + '</div></div>';
}

// ========== RECENTLY VIEWED RENDERER ==========
async function renderRecentlyViewed(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var ids = RecentlyViewed.getIds(8);
  if (ids.length === 0) { container.style.display = "none"; return; }
  container.style.display = "";
  if (!window.AppVaultDB) return;
  try {
    var apps = await Promise.all(ids.map(function(id) { return window.AppVaultDB.getAppById(id); }));
    apps = apps.filter(Boolean);
    if (apps.length === 0) { container.style.display = "none"; return; }
    container.innerHTML =
      '<div class="section-header" style="margin-bottom:16px;">'
      + '<h2 class="section-title">&#128336; Recently <span>Viewed</span></h2>'
      + '<button class="btn btn-secondary btn-sm" onclick="clearRecentlyViewed(\'' + containerId + '\')">&#10005; Clear</button>'
      + '</div>'
      + '<div class="app-grid">' + apps.map(buildAppCard).join("") + '</div>';
  } catch(e) { container.style.display = "none"; }
}

function clearRecentlyViewed(containerId) {
  AV.set("recent", []);
  var el = document.getElementById(containerId);
  if (el) el.style.display = "none";
}

// ========== BOOKMARKS PAGE RENDERER ==========
async function renderBookmarksPage(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var ids = Bookmarks.getAll();
  if (ids.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">&#128148;</div>'
      + '<h3>No saved apps yet</h3>'
      + '<p>Tap &#9825; on any app card to save it to your Wishlist.</p></div>';
    return;
  }
  showLoading(containerId);
  try {
    var apps = await Promise.all(ids.map(function(id) { return window.AppVaultDB.getAppById(id); }));
    apps = apps.filter(Boolean);
    if (apps.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">&#128148;</div><h3>No saved apps</h3></div>';
      return;
    }
    container.innerHTML = '<div class="app-grid">' + apps.map(buildAppCard).join("") + '</div>';
  } catch(e) {
    showError(containerId, "Could not load saved apps.");
  }
}

// ========== COPY TO CLIPBOARD ==========
function copyToClipboard(text, successMsg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      showToast(successMsg || "Copied to clipboard!");
    }).catch(function() { _fallbackCopy(text, successMsg); });
  } else {
    _fallbackCopy(text, successMsg);
  }
}
function _fallbackCopy(text, successMsg) {
  var ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); showToast(successMsg || "Copied!"); } catch(e) {}
  document.body.removeChild(ta);
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", function() {
  initMobileMenu();
  initNavbarSearch();
  setFooterYear();

  var badge = document.getElementById("bookmarkCount");
  if (badge) {
    var c = Bookmarks.count();
    badge.textContent = c > 0 ? c : "";
    badge.style.display = c > 0 ? "" : "none";
  }
});
