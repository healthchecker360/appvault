// ============================================================
// AppVault — sheets-loader.js
// Your Google Sheet is already connected below.
// You do NOT need to change anything in this file.
// ============================================================

// Your published Google Sheet ID (already set for you)
var PUBLISHED_ID = "2PACX-1vRkjvF_IDe4Tsx4d-9EOCojAYqd7H2NYz1tRJ6EQ74rqbz1Lsc5wkEVkeSEpYyWk3Es7lHWA6sFi7Zv";

// These build the URLs for each tab
// When you published your sheet, Google assigned tab IDs.
// Tab 1 (Apps) = gid 0, Tab 2 (Versions) = gid 1 by default.
// If your Versions tab does not load, come back here and I will fix it.
function getTabURL(gid) {
  return "https://docs.google.com/spreadsheets/d/e/" + PUBLISHED_ID + "/pub?gid=" + gid + "&single=true&output=csv";
}

// Cache so we only fetch once per page load
var appsCache = null;
var versionsCache = null;

// Converts raw CSV text into usable objects
function parseCSV(csvText) {
  var lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  var headers = lines[0].split(",").map(function(h) {
    return h.replace(/^"|"$/g, "").trim();
  });

  return lines.slice(1).map(function(line) {
    var values = [];
    var current = "";
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    values.push(current.trim());

    var obj = {};
    headers.forEach(function(header, i) {
      obj[header] = (values[i] || "").replace(/^"|"$/g, "").trim();
    });
    return obj;
  }).filter(function(row) {
    return row.id || row.app_id; // skip blank rows
  });
}

// Fetch Apps tab (gid=0 = first tab)
async function getApps() {
  if (appsCache) return appsCache;
  try {
    var res = await fetch(getTabURL(0));
    var text = await res.text();
    appsCache = parseCSV(text);
    return appsCache;
  } catch (e) {
    console.error("AppVault: Failed to load Apps tab.", e);
    return [];
  }
}

// Fetch Versions tab (gid=1 = second tab)
async function getVersions() {
  if (versionsCache) return versionsCache;
  try {
    var res = await fetch(getTabURL(1));
    var text = await res.text();
    versionsCache = parseCSV(text);
    return versionsCache;
  } catch (e) {
    console.error("AppVault: Failed to load Versions tab.", e);
    return [];
  }
}

async function getAppById(id) {
  var apps = await getApps();
  return apps.find(function(a) { return a.id === id; }) || null;
}

async function getVersionsForApp(appId) {
  var versions = await getVersions();
  return versions.filter(function(v) { return v.app_id === appId; });
}

async function getFeaturedApps() {
  var apps = await getApps();
  return apps.filter(function(a) { return a.featured && a.featured.toLowerCase() === "yes"; });
}

async function getAppsByCategory(category) {
  var apps = await getApps();
  return apps.filter(function(a) { return (a.category || "").toLowerCase() === category.toLowerCase(); });
}

async function getAppsByPlatform(platform) {
  var apps = await getApps();
  return apps.filter(function(a) { return (a.platform || "").toLowerCase() === platform.toLowerCase(); });
}

async function searchApps(query) {
  if (!query || !query.trim()) return [];
  var apps = await getApps();
  var q = query.toLowerCase();
  return apps.filter(function(a) {
    return (a.name && a.name.toLowerCase().includes(q)) ||
           (a.tags && a.tags.toLowerCase().includes(q)) ||
           (a.description && a.description.toLowerCase().includes(q)) ||
           (a.developer && a.developer.toLowerCase().includes(q));
  });
}

async function getAllCategories() {
  var apps = await getApps();
  var cats = apps.map(function(a) { return a.category; }).filter(Boolean);
  return [...new Set(cats)];
}

async function getRecentApps(limit) {
  limit = limit || 8;
  var apps = await getApps();
  return apps.slice().sort(function(a, b) {
    return new Date(b.added_date) - new Date(a.added_date);
  }).slice(0, limit);
}

async function getTopDownloadedApps(limit) {
  limit = limit || 10;
  var apps = await getApps();
  return apps.slice().sort(function(a, b) {
    var da = parseInt((a.downloads || "0").replace(/[^0-9]/g, "")) || 0;
    var db = parseInt((b.downloads || "0").replace(/[^0-9]/g, "")) || 0;
    return db - da;
  }).slice(0, limit);
}

async function getSimilarApps(currentId, limit) {
  limit = limit || 6;
  var current = await getAppById(currentId);
  if (!current) return [];
  var apps = await getApps();
  return apps.filter(function(a) {
    return a.id !== currentId && a.category === current.category;
  }).slice(0, limit);
}

function clearCache() {
  appsCache = null;
  versionsCache = null;
}

// Make everything available to all pages
window.AppVaultDB = {
  getApps: getApps,
  getVersions: getVersions,
  getAppById: getAppById,
  getVersionsForApp: getVersionsForApp,
  getFeaturedApps: getFeaturedApps,
  getAppsByCategory: getAppsByCategory,
  getAppsByPlatform: getAppsByPlatform,
  searchApps: searchApps,
  getAllCategories: getAllCategories,
  getRecentApps: getRecentApps,
  getTopDownloadedApps: getTopDownloadedApps,
  getSimilarApps: getSimilarApps,
  clearCache: clearCache
};
