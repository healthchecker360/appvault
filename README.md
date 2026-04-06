# AppVault — Deployment Guide

## Your Files
All 17 files are ready. Upload them ALL to GitHub, Vercel deploys automatically.

## Files List
- index.html       → Homepage
- android.html     → Android APK listing
- windows.html     → Windows software listing
- app.html         → Individual app page (used for ALL apps)
- search.html      → Search page
- categories.html  → Browse by category
- trending.html    → Trending this week
- apps-like.html   → Similar apps / alternatives
- request.html     → App request page (connect your Google Form)
- about.html       → About page
- privacy.html     → Privacy policy
- contact.html     → Contact page (add your email in contact.html)
- dmca.html        → DMCA page
- style.css        → All styling
- main.js          → Shared JS helpers
- sheets-loader.js → Google Sheets connection (ALREADY CONFIGURED)
- vercel.json      → Vercel settings
- sitemap.xml      → For Google (change yourdomain.com to your real domain)
- robots.txt       → For Google (change yourdomain.com to your real domain)

## Your Google Sheet — IMPORTANT
Your sheet is already connected. But you must check the tab GIDs.

When you published your sheet, Google assigned numbers to each tab:
- Apps tab = gid 0 (first tab, should work automatically)
- Versions tab = gid 1 (second tab)

If your Versions tab does NOT load, it means the gid is different.
To find your real gids:
1. Open your Google Sheet
2. Click the "Apps" tab — look at the URL, it says #gid=XXXXXX — note that number
3. Click the "Versions" tab — note that gid too
4. Open sheets-loader.js, find getTabURL(0) and getTabURL(1)
5. Replace 0 with your Apps gid and 1 with your Versions gid

## Two Things You Must Change Before Going Live
1. In contact.html — search for YOUR_EMAIL@gmail.com and replace with your real email
2. In sitemap.xml and robots.txt — replace yourdomain.com with your real Vercel domain

## How to Add Your First App (After Deployment)
1. Upload APK to TeraBox, copy the share link
2. Open Google Sheet → Apps tab → add a new row:
   - id: whatsapp (no spaces, no capitals, use dashes)
   - name: WhatsApp
   - developer: Meta
   - icon: (paste image URL or leave blank)
   - category: social
   - platform: android
   - license: Free
   - rating: 4.5
   - downloads: 10M+
   - description: (4 original sentences about the app)
   - features: Feature 1|Feature 2|Feature 3
   - tags: messaging, chat, calls
   - added_date: 2025-01-15
   - featured: yes (or no)
   - rollback_guide: Step 1|Step 2|Step 3 (or leave blank for default)
   - permissions: INTERNET|CAMERA|RECORD_AUDIO (separate with |)
3. In Versions tab → add a row:
   - app_id: whatsapp (must match the id above exactly)
   - version: 2.24.1.75
   - label: Latest
   - release_date: 2025-01-10
   - file_size: 75 MB
   - min_android: 5.0
   - changelog: Bug fixes and improvements
   - download_url: (your TeraBox link)
   - mirror_url: (your Mega link, or leave blank)
4. Save sheet. Site updates in under 10 minutes.

## Monetisation
- PropellerAds: Apply at propellerads.com as soon as site is live
- AdSense: Apply at adsense.google.com after 30 apps are live
- When approved, paste ad codes into the .ad-slot divs in each HTML file
