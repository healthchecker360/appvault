// AppVault — main.js (PREMIUM FINAL)

// ---- Toast ----
function showToast(message, type="success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ---- Icon ----
function normalizeIconUrl(icon) {
  if (!icon) return "";
  let url = icon.trim();
  if (url.startsWith("//")) return window.location.protocol + url;
  return url;
}

function getAppIconHTML(app, cls, fallbackCls) {
  const iconUrl = normalizeIconUrl(app.icon);
  const initial = (app.name || "?")[0];

  if (iconUrl) {
    return `<img class="${cls}" src="${iconUrl}" loading="lazy"
      onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<div class=${fallbackCls}>${initial}</div>')">`;
  }
  return `<div class="${fallbackCls}">${initial}</div>`;
}

// ---- PREMIUM CARD ----
function buildAppCard(app) {

  const iconHTML = getAppIconHTML(app, "app-card-icon", "app-card-icon-fallback");

  const rating = app.rating ? parseFloat(app.rating).toFixed(1) : "4.5";
  const downloads = formatDownloads(app.downloads);

  const newBadge = (window.AppVaultDB && window.AppVaultDB.isNewApp(app, 7))
    ? `<span class="badge badge-new">NEW</span>` : "";

  return `
  <div class="app-card" onclick="location.href='app.html?id=${app.id}'">
    
    ${iconHTML}

    <div class="app-card-name">${app.name || "Unknown App"}</div>

    <div class="app-card-meta">
      ⭐ ${rating} &nbsp; • &nbsp; ⬇ ${downloads}
    </div>

    ${newBadge}

  </div>`;
}

// ---- FORMAT DOWNLOADS ----
function formatDownloads(num) {
  if (!num) return "100K+";
  num = parseInt(num);

  if (num >= 1000000) return (num/1000000).toFixed(1) + "M+";
  if (num >= 1000) return (num/1000).toFixed(0) + "K+";
  return num;
}

// ---- STATES ----
function showLoading(id) {
  let el = document.getElementById(id);
  if (el) el.innerHTML = `<div class="loading-spinner">Loading...</div>`;
}

function showError(id, msg="Error loading apps") {
  let el = document.getElementById(id);
  if (el) el.innerHTML = `<div class="error-state">${msg}</div>`;
}

function showEmpty(id, msg="No apps found") {
  let el = document.getElementById(id);
  if (el) el.innerHTML = `<div class="empty-state">${msg}</div>`;
}

// ---- PARAM ----
function getParam(name) {
  return new URLSearchParams(location.search).get(name) || "";
}

// ---- NAV SEARCH ----
function initNavbarSearch() {
  const input = document.getElementById("navSearch");
  if (!input) return;

  input.addEventListener("keydown", function(e){
    if (e.key === "Enter" && input.value.trim()) {
      location.href = "search.html?q=" + encodeURIComponent(input.value.trim());
    }
  });
}

// ---- MOBILE MENU ----
function initMobileMenu() {
  const btn = document.getElementById("menuBtn");
  const menu = document.getElementById("mobileMenu");

  if (!btn || !menu) return;

  btn.onclick = () => menu.classList.toggle("open");

  document.addEventListener("click", (e)=>{
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove("open");
    }
  });
}

// ---- FOOTER YEAR ----
function setFooterYear() {
  let el = document.getElementById("footerYear");
  if (el) el.textContent = new Date().getFullYear();
}

// ---- SCHEMA ----
function injectAppSchema(app, versions=[]) {
  const latest = versions[0] || {};

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": app.name,
    "applicationCategory": app.category,
    "operatingSystem": app.platform === "windows" ? "Windows" : "Android",
    "aggregateRating": app.rating ? {
      "@type": "AggregateRating",
      "ratingValue": app.rating,
      "ratingCount": "1000"
    } : undefined,
    "softwareVersion": latest.version || ""
  };

  Object.keys(schema).forEach(k => schema[k] === undefined && delete schema[k]);

  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.textContent = JSON.stringify(schema);

  document.head.appendChild(s);
}

// ---- INIT ----
document.addEventListener("DOMContentLoaded", function(){
  initMobileMenu();
  initNavbarSearch();
  setFooterYear();
});
