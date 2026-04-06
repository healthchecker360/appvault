// AppVault — main.js — Shared helpers used on every page

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

function normalizeIconUrl(icon) {
  if (!icon || typeof icon !== "string") return "";
  var url = icon.trim();
  if (!url) return "";
  if (url.indexOf("//") === 0) {
    return window.location.protocol === "file:" ? "https:" + url : window.location.protocol + url;
  }
  return url;
}

function getAppIconHTML(app, className, fallbackClass) {
  var iconUrl = normalizeIconUrl(app.icon);
  var initial = (app.name || "").charAt(0) || "?";
  var escapedAlt = String(app.name || "").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  var escapedInitial = String(initial).replace(/</g, "&lt;").replace(/>/g, "&gt;");

  if (iconUrl) {
    return '<img class="' + className + '" src="' + iconUrl + '" alt="' + escapedAlt + '" onerror="this.style.display=\'none\';var f=document.createElement(\'div\');f.className=\'' + fallbackClass + '\';f.textContent=\'' + escapedInitial + '\';this.parentNode.insertBefore(f,this.nextSibling);">';
  }
  return '<div class="' + fallbackClass + '">' + escapedInitial + '</div>';
}

function buildAppCard(app) {
  var iconHTML = getAppIconHTML(app, 'app-card-icon', 'app-card-icon-fallback');

  var platform = (app.platform || "android").toLowerCase();
  var platformBadge = platform === "windows"
    ? '<span class="badge badge-windows">Windows</span>'
    : '<span class="badge badge-android">Android</span>';

  var featuredBadge = (app.featured && app.featured.toLowerCase() === "yes")
    ? '<span class="badge badge-featured">Featured</span>' : "";

  var rating = app.rating ? parseFloat(app.rating).toFixed(1) : "N/A";
  var downloads = app.downloads || "N/A";

  var shareText = encodeURIComponent("Download " + app.name + " APK free on AppVault! " + window.location.origin + "/app.html?id=" + app.id);
  var whatsappURL = "https://wa.me/?text=" + shareText;

  return '<div class="app-card" onclick="window.location.href=\'app.html?id=' + app.id + '\'">'
    + '<div class="app-card-header">' + iconHTML
    + '<div class="app-card-info">'
    + '<div class="app-card-name">' + app.name + '</div>'
    + '<div class="app-card-developer">' + (app.developer || "Unknown") + '</div>'
    + '<div class="app-card-badges">' + platformBadge + featuredBadge + '<span class="badge badge-free">Free</span></div>'
    + '</div></div>'
    + '<div class="app-card-desc">' + (app.description || "No description available.") + '</div>'
    + '<div class="app-card-footer">'
    + '<div class="app-card-rating">&#9733; ' + rating + '</div>'
    + '<div class="app-card-downloads">&#8595; ' + downloads + '</div>'
    + '<button class="app-card-share-btn" onclick="event.stopPropagation();window.open(\'' + whatsappURL + '\',\'_blank\')" title="Share on WhatsApp">&#128172;</button>'
    + '</div></div>';
}

function showLoading(id) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><span>Loading...</span></div>';
}

function showError(id, msg) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = '<div class="error-state"><div class="error-icon">&#9888;</div><p>' + (msg || "Could not load apps.") + '</p></div>';
}

function showEmpty(id, msg) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = '<div class="empty-state"><div class="empty-icon">&#128230;</div><h3>' + (msg || "No apps found.") + '</h3><p>Check back soon.</p></div>';
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name) || "";
}

function initMobileMenu() {
  var btn = document.getElementById("menuBtn");
  var menu = document.getElementById("mobileMenu");
  if (btn && menu) {
    btn.addEventListener("click", function() { menu.classList.toggle("open"); });
  }
}

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

function setFooterYear() {
  var el = document.getElementById("footerYear");
  if (el) el.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", function() {
  initMobileMenu();
  initNavbarSearch();
  setFooterYear();
});
