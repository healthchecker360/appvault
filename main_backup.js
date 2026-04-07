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

var FAVORITES_KEY = 'appvault_favorites';
var RECENT_KEY = 'appvault_recent_views';
var THEME_KEY = 'appvault_theme';
var REVIEWS_KEY = 'appvault_reviews';

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

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function isFavorite(appId) {
  return loadFavorites().indexOf(appId) !== -1;
}

function toggleFavorite(event, appId) {
  event.stopPropagation();
  var favorites = loadFavorites();
  var index = favorites.indexOf(appId);
  var removed = false;
  if (index === -1) {
    favorites.unshift(appId);
    showToast('Added to favorites', 'success');
  } else {
    favorites.splice(index, 1);
    removed = true;
    showToast('Removed from favorites', 'warning');
  }
  saveFavorites(favorites);
  var button = event.currentTarget;
  if (button) {
    button.classList.toggle('active', !removed);
    button.innerHTML = !removed ? '♥' : '♡';
  }
}

function loadRecentViews() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveRecentViews(list) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
}

function addRecentView(app) {
  if (!app || !app.id) return;
  var list = loadRecentViews().filter(function(item){ return item !== app.id; });
  list.unshift(app.id);
  if (list.length > 8) list = list.slice(0, 8);
  saveRecentViews(list);
}

function getAppReviews(appId) {
  try {
    var reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '{}');
    return reviews[appId] || [];
  } catch (e) {
    return [];
  }
}

function saveAppReview(appId, review) {
  try {
    var reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '{}');
    reviews[appId] = reviews[appId] || [];
    reviews[appId].push(review);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.warn('Could not save review', e);
  }
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
  var favoriteActive = isFavorite(app.id) ? 'active' : '';
  var favoriteIcon = isFavorite(app.id) ? '♥' : '♡';

  return '<div class="app-card" onclick="window.location.href=\'app.html?id=' + app.id + '\'">'
    + '<button class="favorite-btn ' + favoriteActive + '" onclick="toggleFavorite(event, \'' + String(app.id).replace(/'/g, "\\'") + '\')">' + favoriteIcon + '</button>'
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

function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark';
}

function setTheme(theme) {
  document.body.classList.toggle('light-theme', theme === 'light');
  localStorage.setItem(THEME_KEY, theme);
  var btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.textContent = theme === 'light' ? '🌙' : '☀️';
    btn.title = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
  }
}

function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

function initThemeToggle() {
  var nav = document.querySelector('.navbar-inner');
  if (!nav || document.getElementById('themeToggleBtn')) return;
  var button = document.createElement('button');
  button.id = 'themeToggleBtn';
  button.className = 'theme-toggle-btn';
  button.type = 'button';
  button.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleTheme();
  });
  nav.appendChild(button);
  setTheme(getTheme());
}

function parseNumber(value) {
  if (!value) return 0;
  var text = String(value).trim();
  var multiplier = 1;
  if (/m/i.test(text)) multiplier = 1000000;
  else if (/k/i.test(text)) multiplier = 1000;
  var num = parseFloat(text.replace(/[^0-9\.]/g, ''));
  return isNaN(num) ? 0 : num * multiplier;
}

function sortApps(apps, mode) {
  var sorted = apps.slice();
  if (mode === 'downloads') {
    return sorted.sort(function(a, b) {
      return parseNumber((b.downloads || '').replace(/M|K/gi, '')) - parseNumber((a.downloads || '').replace(/M|K/gi, ''));
    });
  }
  if (mode === 'rating') {
    return sorted.sort(function(a, b) {
      return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
    });
  }
  if (mode === 'newest') {
    return sorted.sort(function(a, b) {
      return new Date(b.added_date) - new Date(a.added_date);
    });
  }
  if (mode === 'name') {
    return sorted.sort(function(a, b) {
      return String(a.name || '').localeCompare(String(b.name || ''));
    });
  }
  return sorted;
}

function addSortControls(containerId, callback) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var html = '<div class="sort-controls">'
    + '<div class="sort-field"><label for="sortSelect">Sort by</label><select id="sortSelect" onchange="window.applySort && window.applySort()">'
    + '<option value="newest">Newest</option>'
    + '<option value="downloads">Most downloads</option>'
    + '<option value="rating">Top rated</option>'
    + '<option value="name">A to Z</option>'
    + '</select></div>'
    + '<div class="sort-field"><label for="ratingSelect">Min rating</label><select id="ratingSelect" onchange="window.applySort && window.applySort()">'
    + '<option value="0">Any</option>'
    + '<option value="4">4+ stars</option>'
    + '<option value="4.5">4.5+ stars</option>'
    + '<option value="5">5 stars</option>'
    + '</select></div>'
    + '</div>';
  container.insertAdjacentHTML('afterbegin', html);
}

function getCurrentSortOption() {
  var select = document.getElementById('sortSelect');
  return select ? select.value : 'newest';
}

function getCurrentRatingFilter() {
  var select = document.getElementById('ratingSelect');
  return select ? parseFloat(select.value) : 0;
}

function filterAndSortApps(apps) {
  var minRating = getCurrentRatingFilter();
  if (minRating > 0) {
    apps = apps.filter(function(app) {
      return parseFloat(app.rating) >= minRating;
    });
  }
  return sortApps(apps, getCurrentSortOption());
}

function showRecentAppsSection(containerId) {
  var ids = loadRecentViews();
  if (!ids.length) return;
  window.AppVaultDB.getApps().then(function(allApps) {
    var recentApps = ids.map(function(id) { return allApps.find(function(app) { return app.id === id; }); }).filter(Boolean);
    if (!recentApps.length) return;
    var html = '<section class="container recent-section"><div class="section-header"><h2 class="section-title">Recently Viewed</h2><a href="android.html" class="section-link">Browse more &rarr;</a></div><div class="app-grid">' + recentApps.map(buildAppCard).join('') + '</div></section>';
    var container = document.getElementById(containerId);
    if (container) container.insertAdjacentHTML('afterend', html);
  });
}

function buildReviewSection(app) {
  var reviews = getAppReviews(app.id);
  var html = '<div class="info-card" id="reviewCard">'
    + '<div class="info-card-title"><div class="icon">&#11088;</div>Rate & Review ' + app.name + '</div>'
    + '<div class="review-form">'
    + '<label>Star rating</label><select id="reviewRating">'
    + '<option value="5">5 stars</option>'
    + '<option value="4">4 stars</option>'
    + '<option value="3">3 stars</option>'
    + '<option value="2">2 stars</option>'
    + '<option value="1">1 star</option>'
    + '</select>'
    + '<label>Your review</label><textarea id="reviewText" rows="4" placeholder="Share what you liked or what changed."></textarea>'
    + '<button class="btn btn-primary" id="reviewSubmit">Submit Review</button>'
    + '</div>';
  if (reviews.length) {
    html += '<div class="review-list"><h3>' + reviews.length + ' Review' + (reviews.length === 1 ? '' : 's') + '</h3>' + reviews.map(function(review){
      return '<div class="review-item"><div class="review-meta"><strong>' + review.rating + ' stars</strong><span>' + review.date + '</span></div><p>' + review.message + '</p></div>';
    }).join('') + '</div>';
  } else {
    html += '<div class="review-empty"><p>No reviews yet. Be the first to rate this app.</p></div>';
  }
  html += '</div>';
  return html;
}

function initReviewSection(app) {
  var reviewContainer = document.getElementById('reviewSection');
  if (!reviewContainer) return;
  reviewContainer.innerHTML = buildReviewSection(app);
  var submitBtn = document.getElementById('reviewSubmit');
  if (!submitBtn) return;
  submitBtn.addEventListener('click', function() {
    var rating = document.getElementById('reviewRating').value;
    var message = document.getElementById('reviewText').value.trim();
    if (!message) {
      showToast('Please write a short review before submitting.', 'warning');
      return;
    }
    saveAppReview(app.id, { rating: rating, message: message, date: new Date().toLocaleDateString() });
    showToast('Thanks for your review!', 'success');
    initReviewSection(app);
  });
}

function addAppPageRecommendation(app, containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;
  window.AppVaultDB.getSimilarApps(app.id, 4).then(function(similar) {
    if (!similar.length) return;
    container.innerHTML = '<div class="section-header"><h2 class="section-title">Recommended for You</h2><a href="android.html" class="section-link">Explore more &rarr;</a></div><div class="app-grid">' + similar.map(buildAppCard).join('') + '</div>';
  });
}

function showFavoriteApps(containerId) {
  var favorites = loadFavorites();
  if (!favorites.length) return;
  window.AppVaultDB.getApps().then(function(allApps) {
    var apps = favorites.map(function(id){ return allApps.find(function(app){ return app.id === id; }); }).filter(Boolean);
    if (!apps.length) return;
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '<section class="container recent-section"><div class="section-header"><h2 class="section-title">Saved Favorites</h2><a href="android.html" class="section-link">Manage favorites &rarr;</a></div><div class="app-grid">' + apps.map(buildAppCard).join('') + '</div></section>';
  });
}

function showLoading(id) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><span>Loading...</span></div>';
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name) || "";
}

function showError(id, msg) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = '<div class="error-state"><div class="error-icon">&#9888;</div><p>' + (msg || "Could not load apps.") + '</p></div>';
}

function showEmpty(id, msg) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = '<div class="empty-state"><div class="empty-icon">&#128230;</div><h3>' + (msg || "No apps found.") + '</h3><p>Check back soon.</p></div>';
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

window.applySort = function() {
  if (typeof window.renderGrid === 'function' && Array.isArray(window.currentApps)) {
    window.renderGrid(filterAndSortApps(window.currentApps));
  }
};

document.addEventListener("DOMContentLoaded", function() {
  initMobileMenu();
  initNavbarSearch();
  initThemeToggle();
  setFooterYear();
});
