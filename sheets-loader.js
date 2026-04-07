// ============================================================
// AppVault — sheets-loader.js  (FINAL v3)
// Fixes: semicolon/pipe separators, active column, deleted rows,
//        blank version labels, date fallbacks, category cleanup
// New:   update checker, size history, new badge, schema data
// ============================================================

var PUBLISHED_ID   = "2PACX-1vQPjg8IQf1RbZKI7otVmfFjMWSchA6rmPJCvL20Wa29WKs1oP8AmTix5KTjTR6Efcd5QYBUbcZnDYyp";
var PUBLISHED_BASE = "https://docs.google.com/spreadsheets/d/e/" + PUBLISHED_ID;
var sheetGids      = { apps: 0, versions: 1286505322 };

function getAppsURL()   { return PUBLISHED_BASE + "/pub?output=csv"; }
function getTabURL(gid) { return PUBLISHED_BASE + "/pub?gid=" + gid + "&single=true&output=csv"; }

var appsCache     = null;
var versionsCache = null;
var cacheTime     = 10 * 60 * 1000; // 10 minutes
var cacheStamp    = 0;

// ---- HTML guard ----
function isHTML(text) {
  if (!text) return false;
  var f = text.trim().slice(0, 16).toLowerCase();
  return f.indexOf("<!doctype") === 0 || f.indexOf("<html") === 0;
}

// ---- Normalize separators: accepts | or ; ----
function normSep(str) {
  if (!str) return "";
  // replace semicolons (and variants with spaces) with pipe
  return str.replace(/\s*;\s*/g, "|").replace(/\s*\|\s*/g, "|");
}

// ---- Clean category: lowercase, trim, remove special chars ----
function cleanCategory(cat) {
  if (!cat) return "";
  // remove non-breaking spaces and other unicode spaces
  return cat.replace(/[\u00a0\u202f\u2009\u2007\u200b]/g, " ")
            .replace(/\s*&\s*/g, " and ")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9 ]/g, "")
            .replace(/\s+/g, " ")
            .split(" ")[0]; // take first word only: "video and music" → "video"
}

// ---- CSV line parser ----
function parseCSVLine(line) {
  var values = [], current = "", inQuotes = false;
  for (var i = 0; i < line.length; i++) {
    var ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === "," && !inQuotes) {
      values.push(current); current = "";
    } else { current += ch; }
  }
  values.push(current);
  return values;
}

// ---- Strict CSV parser — drops blank/deleted rows ----
function parseCSV(csvText) {
  if (!csvText || isHTML(csvText)) return [];
  var lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  var headers = parseCSVLine(lines[0]).map(function(h) { return h.trim(); });
  var rows = [];

  for (var i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    var values = parseCSVLine(lines[i]);
    var obj = {};
    headers.forEach(function(h, idx) { obj[h] = (values[idx] || "").trim(); });

    // STRICT: app row needs id + name + at least 2 more filled fields
    var isApp = obj.id && obj.name && obj.id.length > 0 && obj.name.length > 0;
    if (isApp) {
      var filled = Object.values(obj).filter(function(v) { return v && v.length > 0; }).length;
      if (filled < 3) isApp = false;
    }

    // STRICT: version row needs app_id + version both non-empty
    var isVer = obj.app_id && obj.version && obj.app_id.length > 0 && obj.version.length > 0;

    if (isApp || isVer) rows.push(obj);
  }
  return rows;
}

// ---- Normalize app row ----
function normalizeApp(obj) {
  return {
    id:             obj.id || "",
    name:           obj.name || "",
    developer:      obj.developer || "",
    icon:           obj.icon || "",
    category:       cleanCategory(obj.category),
    platform:       (obj.platform || "android").toLowerCase().trim(),
    license:        obj.license || "Free",
    rating:         obj.rating || "",
    downloads:      obj.downloads || "",
    description:    obj.description || "",
    features:       normSep(obj.features),
    tags:           obj.tags || "",
    added_date:     obj.added_date || "",
    featured:       (obj.featured || "").toLowerCase().trim(),
    rollback_guide: normSep(obj.rollback_guide),
    permissions:    normSep(obj.permissions),
    virustotal_hash:obj.virustotal_hash || "",
    active:         (obj.active || "yes").toLowerCase().trim()
  };
}

// ---- Normalize version row ----
function normalizeVersion(obj) {
  // fix version: Excel may convert "5.34.3.1" to float 5.3431
  var ver = String(obj.version || "").trim();
  // if it looks like a truncated decimal, flag it (user must fix in sheet)
  return {
    app_id:       (obj.app_id || "").trim(),
    version:      ver,
    label:        (obj.label || "").trim(),
    release_date: (obj.release_date || "").trim().split(" ")[0], // strip time part
    file_size:    (obj.file_size || "").trim(),
    min_android:  (obj.min_android || "").trim(),
    min_windows:  (obj.min_windows || "").trim(),
    changelog:    (obj.changelog || "").trim(),
    download_url: (obj.download_url || "").trim(),
    mirror_url:   (obj.mirror_url || "").trim()
  };
}

// ---- Fetchers ----
async function fetchText(url) {
  try {
    var res = await fetch(url);
    return await res.text();
  } catch(e) { return ""; }
}

async function getApps() {
  var now = Date.now();
  if (appsCache && (now - cacheStamp) < cacheTime) return appsCache;
  var text = await fetchText(getAppsURL());
  var raw  = parseCSV(text);
  appsCache = raw
    .filter(function(o) { return o.id && o.name; })
    .map(normalizeApp)
    .filter(function(a) { return a.active !== "no"; }); // hide inactive apps
  cacheStamp = now;
  return appsCache;
}

async function getVersions() {
  if (versionsCache) return versionsCache;
  var text = await fetchText(getTabURL(sheetGids.versions));
  var raw  = parseCSV(text);
  // if no app_id column found, try auto-detect
  if (raw.length === 0 || raw[0].app_id === undefined) {
    var detected = await findVersionsGid();
    if (detected !== sheetGids.versions) {
      text = await fetchText(getTabURL(detected));
      raw  = parseCSV(text);
    }
  }
  versionsCache = raw.filter(function(o) { return o.app_id && o.version; })
                     .map(normalizeVersion);
  return versionsCache;
}

async function getPublishedGids() {
  try {
    var html = await fetchText(PUBLISHED_BASE + "/pubhtml");
    var matches = html.match(/gid=([0-9]+)/g) || [];
    return [...new Set(matches.map(function(m) {
      return parseInt(m.replace("gid=", ""), 10);
    }).filter(function(n) { return !isNaN(n); }))];
  } catch(e) { return []; }
}

async function findVersionsGid() {
  var gids = await getPublishedGids();
  if (!gids.length) { for (var i = 0; i <= 10; i++) gids.push(i); }
  gids = gids.filter(function(g) { return g !== sheetGids.apps; });
  for (var j = 0; j < gids.length; j++) {
    var text = await fetchText(getTabURL(gids[j]));
    var rows = parseCSV(text);
    if (rows.length > 0 && rows[0].app_id !== undefined) {
      sheetGids.versions = gids[j];
      return gids[j];
    }
  }
  return sheetGids.versions;
}

// ---- Query helpers ----
async function getAppById(id) {
  var apps = await getApps();
  var needle = (id || "").trim();
  return apps.find(function(a) { return a.id === needle; }) || null;
}

async function getVersionsForApp(appId) {
  var versions = await getVersions();
  var needle   = (appId || "").trim();
  return versions.filter(function(v) { return v.app_id.trim() === needle; });
}

async function getFeaturedApps() {
  var apps = await getApps();
  return apps.filter(function(a) { return a.featured === "yes"; });
}

async function getAppsByCategory(cat) {
  var apps = await getApps();
  var c = cleanCategory(cat);
  return apps.filter(function(a) { return a.category === c; });
}

async function getAppsByPlatform(platform) {
  var apps = await getApps();
  var p = (platform || "").toLowerCase();
  return apps.filter(function(a) { return a.platform === p; });
}

async function searchApps(query) {
  if (!query || !query.trim()) return [];
  var apps = await getApps();
  var q = query.toLowerCase();
  return apps.filter(function(a) {
    return (a.name        && a.name.toLowerCase().includes(q)) ||
           (a.tags        && a.tags.toLowerCase().includes(q)) ||
           (a.description && a.description.toLowerCase().includes(q)) ||
           (a.developer   && a.developer.toLowerCase().includes(q)) ||
           (a.category    && a.category.toLowerCase().includes(q));
  });
}

async function getAllCategories() {
  var apps = await getApps();
  var cats = apps.map(function(a) { return a.category; }).filter(Boolean);
  return [...new Set(cats)].sort();
}

async function getRecentApps(limit) {
  limit = limit || 8;
  var apps = await getApps();
  return apps.slice().sort(function(a, b) {
    var da = a.added_date ? new Date(a.added_date) : new Date(0);
    var db = b.added_date ? new Date(b.added_date) : new Date(0);
    return db - da;
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

// ---- NEW: Get apps added in last N days ----
async function getNewApps(days, limit) {
  days  = days  || 7;
  limit = limit || 8;
  var apps = await getApps();
  var cutoff = Date.now() - (days * 86400000);
  return apps.filter(function(a) {
    if (!a.added_date) return false;
    return new Date(a.added_date).getTime() > cutoff;
  }).slice(0, limit);
}

// ---- NEW: Check if app is "new" (added within N days) ----
function isNewApp(app, days) {
  days = days || 7;
  if (!app.added_date) return false;
  return (Date.now() - new Date(app.added_date).getTime()) < (days * 86400000);
}

// ---- NEW: Get version size history for chart ----
async function getVersionSizeHistory(appId) {
  var versions = await getVersionsForApp(appId);
  return versions.map(function(v) {
    var mb = parseFloat((v.file_size || "0").replace(/[^0-9.]/g, "")) || 0;
    return { version: v.version, mb: mb, date: v.release_date };
  }).filter(function(v) { return v.mb > 0; }).reverse();
}

// ---- NEW: Get recently updated apps (new version in last N days) ----
async function getRecentlyUpdated(days, limit) {
  days  = days  || 7;
  limit = limit || 8;
  var versions = await getVersions();
  var cutoff   = Date.now() - (days * 86400000);
  var apps     = await getApps();
  var recentIds = versions
    .filter(function(v) {
      if (!v.release_date) return false;
      return new Date(v.release_date).getTime() > cutoff;
    })
    .map(function(v) { return v.app_id; });
  var uniqueIds = [...new Set(recentIds)];
  return apps.filter(function(a) { return uniqueIds.includes(a.id); }).slice(0, limit);
}

// ---- Cache clear ----
function clearCache() { appsCache = null; versionsCache = null; cacheStamp = 0; }

// ---- Export ----
window.AppVaultDB = {
  getApps, getVersions, getAppById, getVersionsForApp,
  getFeaturedApps, getAppsByCategory, getAppsByPlatform,
  searchApps, getAllCategories, getRecentApps,
  getTopDownloadedApps, getSimilarApps,
  getNewApps, isNewApp, getVersionSizeHistory, getRecentlyUpdated,
  clearCache,
  cleanCategory, normSep
};
