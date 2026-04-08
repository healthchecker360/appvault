// AppVault — main.js (v4 - Slider & Stats Update)
// Optimized for: Vertical Hero Stats, Dynamic Category Slider, and Compact Rows

// ---- Toast ----
function showToast(message, type) {
  type = type || "success";
  var container = document.querySelector(".toast-container") || document.createElement("div");
  if (!container.parentElement) {
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  var toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 3000);
}

// ---- Icon HTML (Optimized for Small Rows) ----
function getAppIconHTML(app, cls, fallbackCls) {
  var iconUrl = app.icon ? app.icon.trim() : "";
  var initial = (app.name || "").charAt(0) || "?";
  var alt = String(app.name || "").replace(/"/g, "&quot;");
  
  if (iconUrl) {
    return `<img class="${cls}" src="${iconUrl}" alt="${alt}" loading="lazy" 
      onerror="this.style.display='none';this.nextSibling.style.display='flex';">
      <div class="${fallbackCls}" style="display:none;">${initial}</div>`;
  }
  return `<div class="${fallbackCls}">${initial}</div>`;
}

// ---- Build Small App Row (For Category Slider) ----
function buildSmallRow(app) {
  var iconHTML = getAppIconHTML(app, "app-row-img", "app-row-img-fallback");
  var version = app.version || "Old";
  var size = app.size || "Varies";
  
  return `
    <a href="app.html?id=${app.id}" class="app-row-small">
      ${iconHTML}
      <div class="app-row-info">
        <span class="app-row-name">${app.name}</span>
        <span class="app-row-meta">v${version} • ${size}</span>
      </div>
      <div class="app-row-dl">&#10515;</div>
    </a>`;
}

// ---- Build Standard App Card (For Grids) ----
function buildAppCard(app) {
  var iconHTML = getAppIconHTML(app, "app-card-icon", "app-card-icon-fallback");
  var platform = (app.platform || "android").toLowerCase();
  var pBadge = platform === "windows" ? '<span class="badge badge-windows">Windows</span>' : '<span class="badge badge-android">Android</span>';
  var fBadge = (app.featured === "yes") ? '<span class="badge badge-featured">&#11088; Featured</span>' : "";
  var nBadge = (window.AppVaultDB && window.AppVaultDB.isNewApp(app, 7)) ? '<span class="badge badge-new">NEW</span>' : "";
  var rating = app.rating ? parseFloat(app.rating).toFixed(1) : "";
  var downloads = app.downloads || "";

  return `
    <div class="app-card" onclick="window.location.href='app.html?id=${app.id}'">
      <div class="app-card-header">${iconHTML}
        <div class="app-card-info">
          <div class="app-card-name">${app.name}</div>
          <div class="app-card-badges">${pBadge}${fBadge}${nBadge}</div>
        </div>
      </div>
      <div class="app-card-desc">${(app.description || "").substring(0, 80)}...</div>
      <div class="app-card-footer">
        ${rating ? '<span>&#9733; ' + rating + '</span>' : '<span></span>'}
        ${downloads ? '<span>&#8595; ' + downloads + '</span>' : '<span></span>'}
      </div>
    </div>`;
}

// ---- Update Hero Stats Sidebar ----
function updateHeroStats(all) {
  var sidebar = document.getElementById("statsSidebar");
  if (!sidebar) return;

  // HIDE Stats if database is small (< 50 apps) to maintain trust
  if (all.length < 50) {
    sidebar.style.display = "none";
    return;
  }

  sidebar.style.display = "flex";
  document.getElementById("statTotal").textContent = all.length;
  document.getElementById("statAndroid").textContent = all.filter(a => a.platform === "android").length;
  document.getElementById("statWindows").textContent = all.filter(a => a.platform === "windows").length;
}

// ---- Init Dynamic Category Slider ----
async function initCategorySlider(all) {
  var grid = document.getElementById("megaCatGrid");
  if (!grid) return;

  var categories = await window.AppVaultDB.getAllCategories();
  var iconMap = { social:"&#128172;", tools:"&#128296;", games:"&#127918;", video:"&#127916;", music:"&#127925;", education:"&#128218;" };

  grid.innerHTML = categories.map(cat => {
    var catApps = all.filter(a => a.category === cat).slice(0, 5);
    var icon = iconMap[cat] || "&#128196;";
    var title = cat.charAt(0).toUpperCase() + cat.slice(1);
    
    return `
      <div class="cat-column">
        <div class="cat-column-header">
          <span class="cat-column-title">${icon} ${title}</span>
          <a href="android.html?cat=${cat}" class="section-link">All &rarr;</a>
        </div>
        <div class="cat-list-container">
          ${catApps.map(buildSmallRow).join('')}
        </div>
      </div>`;
  }).join('');
}

// ---- Mobile & Navbar Helpers ----
function initMobileMenu() {
  var btn = document.getElementById("menuBtn"), menu = document.getElementById("mobileMenu");
  if (btn && menu) btn.onclick = () => menu.classList.toggle("open");
}

function initNavbarSearch() {
  var input = document.getElementById("navSearch");
  if (input) {
    input.onkeydown = (e) => {
      if (e.key === "Enter" && input.value.trim()) 
        window.location.href = "search.html?q=" + encodeURIComponent(input.value.trim());
    };
  }
}

// ---- Global Init ----
document.addEventListener("DOMContentLoaded", async function() {
  initMobileMenu();
  initNavbarSearch();
  
  var yearEl = document.getElementById("footerYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Load Data if on Homepage
  try {
    if (typeof window.AppVaultDB !== "undefined") {
      const all = await window.AppVaultDB.getApps();
      updateHeroStats(all);
      initCategorySlider(all);
    }
  } catch(e) { console.error("AppVault Init Error:", e); }
});
