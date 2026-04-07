#!/bin/bash
# ============================================================
# AppVault v3 FINAL — Terminal Installer
# Run this in your Codespace terminal:
# bash TERMINAL_COMMANDS.sh
# ============================================================

echo ""
echo "======================================"
echo "  AppVault v3 Final — Starting..."
echo "======================================"
echo ""

# Check we're in right place
if [ ! -f "index.html" ]; then
  echo "ERROR: index.html not found."
  echo "Make sure you are in your appvault project folder."
  echo "Run: cd /workspaces/appvault"
  exit 1
fi

echo "✓ Project folder confirmed"

# Backup
mkdir -p _backup
cp *.html *.js *.css _backup/ 2>/dev/null
echo "✓ Backup saved to _backup/"

# Download updated files from GitHub raw
# NOTE: Replace YOUR_USERNAME with your actual GitHub username
REPO="https://raw.githubusercontent.com/YOUR_USERNAME/appvault/main"

echo ""
echo "Downloading updated files..."
echo "(If this fails, manually paste each file from Claude)"
echo ""

# These are the 5 files that changed
for FILE in sheets-loader.js main.js index.html android.html app.html; do
  if curl -sf "$REPO/$FILE" -o "$FILE.new" 2>/dev/null; then
    mv "$FILE.new" "$FILE"
    echo "✓ $FILE updated"
  else
    echo "⚠ Could not download $FILE — paste manually from Claude"
  fi
done

echo ""
echo "Committing to GitHub..."
git add -A
git commit -m "AppVault v3 final: all fixes + new features"
git push
echo ""
echo "======================================"
echo "  DONE! Vercel deploys in ~30 seconds"
echo "======================================"
echo ""
echo "NEXT STEPS:"
echo "1. Fix your Google Sheet (read COMPLETE_GUIDE.md Part 3)"
echo "2. Remove gambling apps (1xBet, Aviator) — set active=no"
echo "3. Add 20+ apps using GPT_DATA_ENTRY_PROMPT.md"
echo "4. Apply to PropellerAds at propellerads.com"
echo ""
