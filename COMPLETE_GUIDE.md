# APPVAULT — COMPLETE GUIDE + TERMINAL COMMANDS
# Read this top to bottom. Every command is copy-paste ready.
# ============================================================

## PART 1 — WHAT WAS FIXED IN THIS UPDATE

### sheets-loader.js (CRITICAL fixes)
- Semicolons (;) in features/permissions now auto-converted to pipes (|)
- Category names cleaned: "Video & Music" → "video" automatically
- "active" column: set active=no in sheet to hide any app instantly
- Blank/deleted rows rejected more strictly (needs 3+ filled fields)
- Date format fixed: strips time part from datetime values
- NEW: isNewApp() — detects apps added in last 7 days
- NEW: getRecentlyUpdated() — apps with new versions in last N days
- NEW: getVersionSizeHistory() — for future size charts
- NEW: getNewApps() — filtered list of fresh apps

### main.js (FIXED)
- NEW badge shown on cards for apps added within 7 days
- Download count (10M+) shown on every app card
- Description properly truncated (CSS already handled this)
- WhatsApp share button working correctly
- showRemovedApp() — friendly 404 when app is deleted from sheet
- injectAppSchema() — Schema.org JSON-LD for SEO on every app page

### index.html (FIXED)
- Request App button added to DESKTOP navbar (was missing)
- "View all featured" → android.html?filter=featured
- "View all new apps" → android.html?sort=newest
- "View all" Most Downloaded → android.html?sort=downloads
- "View all" Top Rated → android.html?sort=rating
- NEW section: Recently Updated (apps with new versions)
- NEW section: Top Rated
- Empty sections auto-hide if no data

### android.html (FIXED)
- Reads URL parameters: ?cat=games&sort=newest&filter=featured
- Homepage "View All" links now correctly pre-filter/sort the page
- Request App button added to navbar

### app.html (FIXED)
- Features/permissions accept both | and ; as separator
- Removed app shows friendly 404 instead of broken page
- Schema.org JSON-LD injected automatically for SEO

---

## PART 2 — TERMINAL COMMANDS (run in Codespace)

### Step 1 — Go to your project folder
```
cd /workspaces/appvault
```

### Step 2 — Check you are in the right place
```
ls
```
You should see: index.html, style.css, main.js etc.
If you see nothing, run: cd /workspaces && ls (find the right folder name)

### Step 3 — Create a backup of your current files
```
mkdir -p _backup && cp *.html *.js *.css _backup/ 2>/dev/null; echo "Backup done"
```

### Step 4 — Replace sheets-loader.js
```
cat > sheets-loader.js << 'ENDOFFILE'
PASTE THE ENTIRE CONTENTS OF sheets-loader.js HERE
ENDOFFILE
```
NOTE: Claude will give you this as a complete paste command below.

### Step 5 — Replace main.js
```
cat > main.js << 'ENDOFFILE'
PASTE THE ENTIRE CONTENTS OF main.js HERE
ENDOFFILE
```

### Step 6 — Replace index.html
```
cat > index.html << 'ENDOFFILE'
PASTE THE ENTIRE CONTENTS OF index.html HERE
ENDOFFILE
```

### Step 7 — Patch android.html (add URL param support)
This is done automatically by the build script.

### Step 8 — Patch app.html (fix separators + schema)
This is done automatically by the build script.

### Step 9 — Commit and push everything
```
git add -A && git commit -m "v3 final: fixes + new features" && git push
```
Vercel auto-deploys in 30 seconds.

### Step 10 — Verify deployment
```
git log --oneline -3
```
Shows your last 3 commits. Confirm the latest is there.

---

## PART 3 — GOOGLE SHEET FIXES (do these NOW before anything else)

### Fix 1 — Change features column separator
Open Google Sheet → Apps tab → click column K (features)
Press Ctrl+H (Find & Replace)
Find: ;
Replace with: |
Click Replace All → Done

### Fix 2 — Fix permissions column
Same as above but column P (permissions)
Find: ;  Replace with: |  → Replace All

### Fix 3 — Fix WhatsApp row (MOST IMPORTANT)
WhatsApp row has blank description, features, tags.
Fill these manually:

description:
WhatsApp Messenger is the world's most popular instant messaging app used by over 2 billion people. It allows free text messages, voice calls, video calls and file sharing over Wi-Fi or mobile data. All messages are protected with end-to-end encryption ensuring only you and the recipient can read them. The app is completely free to use with no subscription or hidden fees.

features:
Free text messages and calls|Video calling up to 32 people|End-to-end encrypted chats|Share photos videos and documents|Voice messages|Group chats up to 1024 members|Works on Wi-Fi and mobile data|Status updates and Stories

tags:
messaging, chat, whatsapp, calls, video call, voice message, free, meta

### Fix 4 — Fix category for Vidmate and Snaptube
Change "Video & Music" → video (one word, lowercase)
Change "Gaming " → games (no trailing space)

### Fix 5 — Fix Aviator version label
Aviator version row has blank label → change to: Latest

### Fix 6 — Add "active" column to Apps sheet
Add a new column header: active
Set all existing apps to: yes
When you want to REMOVE an app: change yes → no
Site hides it automatically. Never delete rows — just set active=no.

### Fix 7 — Fix Vidmate version number
Version shows as 5.3431 (Excel converted it to decimal)
Click that cell → Format as Text → retype: 5.34.3.1
Or just write the correct version string directly.

---

## PART 4 — FEATURE SUGGESTIONS (next things to build)

### Priority 1 — Build these next (high traffic, low effort)
1. App Update Checker page — user types app name, sees if newer version exists
   File to create: update-checker.html
   Uses: existing AppVaultDB.getVersionsForApp()

2. Version Release Calendar — shows which apps got updates each month
   File to create: calendar.html
   Data: already in Versions sheet (release_date column)

3. File Size History chart — bar chart per app showing size over versions
   Add to: app.html (new section below rollback guide)
   Data: AppVaultDB.getVersionSizeHistory() already built

4. Recently Updated page — dedicated page for apps with new versions
   File to create: updated.html
   Data: AppVaultDB.getRecentlyUpdated() already built

### Priority 2 — Good for SEO
5. Compare Two Apps page — side by side any two apps
   File to create: compare.html
   Gets massive search traffic: "WhatsApp vs Telegram" etc.

6. APK Package Name page — every app shows com.package.name
   Add to: app.html — new column in sheet called "package_name"
   Searchers: "com.whatsapp download" — zero competition keyword

7. App Not on Play Store section — tag apps that are off Play Store
   Add column "off_play_store" to sheet: yes/no
   Create: removed-apps.html — massive traffic spike when apps get banned

### Priority 3 — Money
8. Download counter using Supabase (free tier)
   Shows "Downloaded 12,451 times" on each app
   Massive trust builder → more ad clicks

9. Email collection before download
   Simple "Enter email to download" popup (optional, user can skip)
   Builds email list → newsletter → return traffic

### Priority 4 — User Experience
10. Dark/Light mode toggle
    One button in navbar switches between dark and light
    Broader audience appeal

11. Bookmark / Save app feature
    Uses localStorage — user saves favorite apps
    Shows "My Saved Apps" section on homepage

12. Recently Viewed (localStorage)
    Bottom of every page: "You recently viewed: WhatsApp, VLC..."
    Increases pages per session → more ad impressions

---

## PART 5 — PERFORMANCE ANALYSIS

### What is currently GOOD
- sheets-loader.js v3: auto-detects Versions tab GID — users never get stuck
- android.html: sidebar + list/grid view is Uptodown-quality
- Icon fallback system: letter circle when no icon — professional
- style.css: complete dark theme, RTL Urdu support, responsive
- vercel.json: security headers + clean URLs
- app.html: rollback guide + permissions explainer — unique content

### What needs attention
- Sheet has only 6 apps — site looks empty to Google
  ACTION: Add 20 apps minimum before sharing the URL anywhere
  Use GPT prompt file to generate data for each app quickly

- No images in meta tags (og:image)
  ACTION: Add og:image tag pointing to a logo PNG in your repo
  Creates nice preview when shared on WhatsApp/Facebook

- sitemap.xml lists no app pages (only main pages)
  ACTION: When you have 20+ apps, ask Claude to generate dynamic sitemap

- 1xBet and Aviator are gambling apps
  ACTION: Remove before applying to AdSense (automatic rejection)
  Set active=no for both rows in sheet immediately

### Load performance
- Site loads from Google Sheets CSV on every visit (cached 10 min)
- First load: ~800ms-1.5s (Google Sheets fetch)
- Repeat visits: instant (cached in sessionStorage)
- Images: lazy loaded — no performance impact
- Recommendation: Add more apps. More content = better Google ranking.

### SEO performance right now
- Titles: correct format ✓
- Meta descriptions: correct ✓
- Schema.org: NOW ADDED with this update ✓
- Canonical URLs: present ✓
- Sitemap: present but static ✓
- Missing: og:image, more app pages, inbound links

---

## PART 6 — ADENSE CHECKLIST

Before applying to Google AdSense:
[ ] Remove gambling apps (1xBet, Aviator) — set active=no
[ ] Add minimum 20 apps with real content
[ ] Add about.html with real information about your site
[ ] Add privacy.html (already exists — verify email is real)
[ ] Add contact.html with real email
[ ] Site must be live on Vercel for at least 2-4 weeks
[ ] No broken links (check all footer and navbar links)
[ ] Site must be in English primarily (Urdu toggle is fine as secondary)
[ ] Apply at: adsense.google.com → Add Site → enter your Vercel URL

While waiting for AdSense:
- Apply to PropellerAds immediately: propellerads.com
- Apply to Adsterra: adsterra.com
- Both approve within 24-48 hours
- Replace ad-slot divs with their code

---

## PART 7 — ADDING NEW APPS (your weekly workflow)

### Using GPT (fastest method)
1. Open ChatGPT
2. Paste the entire GPT_DATA_ENTRY_PROMPT.md file
3. Say: "Add [App Name]"
4. GPT returns formatted data
5. Copy data into Google Sheet rows
6. Upload APK to TeraBox → copy link → paste in download_url column
7. Done — site updates in 10 minutes

### Using Claude (for quality check)
Send this: "I added [App Name] to my AppVault Google Sheet.
Here is the data: [paste your row]. Check if it is correct and
fix any issues with categories, separators, or missing fields."

### Manual upload flow
TeraBox → Upload APK → Right click → Share → Copy link
Google Sheet → Versions tab → Find app row → Paste in download_url
Wait 10 minutes → Check your live site

---

## PART 8 — QUICK REFERENCE

### Sheet column separators
Features:       use | (pipe)     example: Call|Chat|Video
Permissions:    use | (pipe)     example: INTERNET|CAMERA
Rollback guide: use | (pipe)     example: Step 1|Step 2|Step 3
Tags:           use , (comma)    example: chat, messaging, free
Categories:     ONE WORD ONLY    example: video (not "Video & Music")

### Category valid values
social, video, games, tools, productivity, security,
communication, entertainment, education, finance, health,
shopping, travel, sports, utilities, photography, music, news

### Platform valid values
android, windows

### Featured valid values
yes, no

### Active valid values
yes, no  (blank = treated as yes)

### Version label valid values
Latest  (for newest version)
(blank) (for all older versions)

### Date format
YYYY-MM-DD  example: 2025-06-15

### Codespace keyboard shortcuts
Ctrl+S     = Save file
Ctrl+H     = Find & Replace in current file
Ctrl+`     = Open terminal
Ctrl+Z     = Undo
Ctrl+Shift+P = Command palette (search for any action)
