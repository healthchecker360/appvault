// ============================================================
// AppVault — sheets-loader.js
// Your Google Sheet is already connected below.
// You do NOT need to change anything in this file.
// ============================================================

// Your published Google Sheet ID (already set for you)
var PUBLISHED_ID = "2PACX-1vQPjg8IQf1RbZKI7otVmfFjMWSchA6rmPJCvL20Wa29WKs1oP8AmTix5KTjTR6Efcd5QYBUbcZnDYyp";
var PUBLISHED_BASE = "https://docs.google.com/spreadsheets/d/e/" + PUBLISHED_ID;

// These build the URLs for each tab
// The published Apps sheet uses the new base CSV link.
// Versions are still fetched by their published tab gid.
var sheetGids = {
  apps: 0,
  versions: 1286505322
};

function getAppsURL() {
  return PUBLISHED_BASE + "/pub?output=csv";
}

function getTabURL(gid) {
  return PUBLISHED_BASE + "/pub?gid=" + gid + "&single=true&output=csv";
}

var appsCache = null;
var versionsCache = null;

function isHTML(text) {
  if (!text) return false;
  var first = text.trim().slice(0, 16).toLowerCase();
  return first.indexOf("<!doctype") === 0 || first.indexOf("<html") === 0;
}

function parseCSV(csvText) {
  if (!csvText || isHTML(csvText)) return [];
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

// Fetch Apps tab
async function getApps() {
  if (appsCache) return appsCache;
  try {
    var res = await fetch(getAppsURL());
    var text = await res.text();
    appsCache = parseCSV(text);
    return appsCache;
  } catch (e) {
    console.error("AppVault: Failed to load Apps sheet.", e);
    return [];
  }
}

async function fetchTabText(gid) {
  try {
    var res = await fetch(getTabURL(gid));
    return await res.text();
  } catch (e) {
    return "";
  }
}

async function getPublishedGids() {
  try {
    var res = await fetch(PUBLISHED_BASE + "/pubhtml");
    var html = await res.text();
    var matches = html.match(/gid=([0-9]+)/g) || [];
    return [...new Set(matches.map(function(m) {
      return parseInt(m.replace("gid=", ""), 10);
    }).filter(function(n) {
      return !isNaN(n);
    }))];
  } catch (e) {
    return [];
  }
}

async function findVersionsGid() {
  var candidateGids = await getPublishedGids();
  if (candidateGids.length === 0) {
    for (var i = 0; i <= 20; i++) candidateGids.push(i);
  }
  candidateGids = candidateGids.filter(function(gid) { return gid !== sheetGids.apps; });

  for (var j = 0; j < candidateGids.length; j++) {
    var gid = candidateGids[j];
    var text = await fetchTabText(gid);
    var rows = parseCSV(text);
    if (rows.length > 0 && rows[0].app_id !== undefined) {
      console.info("AppVault: detected Versions tab gid=" + gid);
      sheetGids.versions = gid;
      return gid;
    }
  }

  return sheetGids.versions;
}

// Fetch Versions tab
async function getVersions() {
  if (versionsCache) return versionsCache;
  try {
    var text = await fetchTabText(sheetGids.versions);
    var versions = parseCSV(text);
    if (versions.length === 0 || versions[0].app_id === undefined) {
      var detected = await findVersionsGid();
      if (detected !== sheetGids.versions) {
        text = await fetchTabText(detected);
        versions = parseCSV(text);
      }
    }
    versionsCache = versions;
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
