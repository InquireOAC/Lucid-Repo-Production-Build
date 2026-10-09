#!/bin/bash
# install_ios_native.sh
#
# One-shot setup for WidgetKit + native iOS screens.
# Run from the repo root:
#   bash scripts/install_ios_native.sh
#
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}✔${NC}  $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }
step() { echo -e "\n${GREEN}▶${NC}  $1"; }

# ── 1. npm install ────────────────────────────────────────────────────────────
step "Installing npm dependencies"
npm install --legacy-peer-deps
log "npm install complete"

# ── 2. Build web assets ───────────────────────────────────────────────────────
step "Building web assets"
npm run build
log "Web build complete"

# ── 3. Sync Capacitor ─────────────────────────────────────────────────────────
step "Syncing Capacitor iOS project"
npx cap sync ios
log "Capacitor sync complete"

# ── 4. Install xcodeproj gem ──────────────────────────────────────────────────
step "Checking xcodeproj gem"
if gem list xcodeproj -i > /dev/null 2>&1; then
  log "xcodeproj already installed"
else
  warn "Installing xcodeproj gem (requires Ruby + RubyGems)"
  gem install xcodeproj
  log "xcodeproj installed"
fi

# ── 5. Run Xcode project setup script ────────────────────────────────────────
step "Adding DreamWidget target to Xcode project"
ruby scripts/setup_ios_native.rb

# ── 6. CocoaPods install ─────────────────────────────────────────────────────
step "Running pod install"
cd ios/App && pod install && cd ../..
log "CocoaPods install complete"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  All done! Open ios/App/App.xcworkspace in Xcode.${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Remaining manual step in Xcode:"
echo "  • App target    → Signing & Capabilities → Add 'App Groups'"
echo "    → add: group.app.dreamweaver.LucidRepo"
echo "  • DreamWidget target → same App Groups capability"
echo ""
echo "Then build & run.  Long-press home screen → + → 'Lucid Repo'"
echo "to add the Dream Journal widgets."
echo ""
