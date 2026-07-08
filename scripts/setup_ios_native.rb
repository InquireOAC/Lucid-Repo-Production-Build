#!/usr/bin/env ruby
# frozen_string_literal: true
#
# setup_ios_native.rb
#
# Adds the DreamWidget WidgetKit extension target to the Xcode project and
# wires up App Groups entitlements for both the main App target and the widget.
#
# Usage (from repo root):
#   gem install xcodeproj          # one-time install
#   ruby scripts/setup_ios_native.rb
#
# Safe to re-run — it skips steps that are already done.
#
require 'xcodeproj'
require 'fileutils'

# ─────────────────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────────────────

PROJECT_PATH      = File.expand_path('../ios/App/App.xcodeproj', __dir__)
WIDGET_DIR        = File.expand_path('../ios/App/DreamWidget',   __dir__)
APP_BUNDLE_ID     = 'app.dreamweaver.LucidRepo'
WIDGET_BUNDLE_ID  = "#{APP_BUNDLE_ID}.DreamWidget"
WIDGET_TARGET     = 'DreamWidget'
APP_GROUP_ID      = 'group.app.dreamweaver.LucidRepo'
WIDGET_DEPLOY     = '16.0'   # accessoryCircular / accessoryRectangular need 16+
APP_DEPLOY        = '14.0'

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def log(msg)  = puts("\e[32m✔\e[0m  #{msg}")
def warn(msg) = puts("\e[33m⚠\e[0m  #{msg}")
def step(msg) = puts("\n\e[34m▶\e[0m  #{msg}")

# ─────────────────────────────────────────────────────────────────────────────
# Open project
# ─────────────────────────────────────────────────────────────────────────────

step "Opening #{PROJECT_PATH}"
project = Xcodeproj::Project.open(PROJECT_PATH)
log "Opened project"

# ─────────────────────────────────────────────────────────────────────────────
# Step 1 — Add App Groups entitlement to the main App target
# ─────────────────────────────────────────────────────────────────────────────

step "Configuring main App target"

app_target = project.targets.find { |t| t.name == 'App' }
raise "Could not find 'App' target in #{PROJECT_PATH}" unless app_target

app_target.build_configurations.each do |config|
  config.build_settings['CODE_SIGN_ENTITLEMENTS'] ||= 'App/App.entitlements'
  config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = APP_DEPLOY
end
log "Set entitlements path + deployment target on App target"

# ─────────────────────────────────────────────────────────────────────────────
# Step 2 — Create or update the DreamWidget target
# ─────────────────────────────────────────────────────────────────────────────

step "Checking for existing #{WIDGET_TARGET} target"

existing = project.targets.find { |t| t.name == WIDGET_TARGET }

if existing
  warn "#{WIDGET_TARGET} target already exists — skipping target creation"
  widget_target = existing
else
  step "Creating #{WIDGET_TARGET} app-extension target"

  widget_target = project.new_target(
    :app_extension,
    WIDGET_TARGET,
    :ios,
    WIDGET_DEPLOY
  )

  log "Created target '#{WIDGET_TARGET}'"
end

# ─────────────────────────────────────────────────────────────────────────────
# Step 3 — Configure widget target build settings
# ─────────────────────────────────────────────────────────────────────────────

step "Configuring #{WIDGET_TARGET} build settings"

widget_target.build_configurations.each do |config|
  s = config.build_settings
  s['PRODUCT_BUNDLE_IDENTIFIER']   = WIDGET_BUNDLE_ID
  s['INFOPLIST_FILE']              = 'DreamWidget/Info.plist'
  s['CODE_SIGN_ENTITLEMENTS']      = 'DreamWidget/DreamWidget.entitlements'
  s['IPHONEOS_DEPLOYMENT_TARGET']  = WIDGET_DEPLOY
  s['SWIFT_VERSION']               = '5.0'
  s['TARGETED_DEVICE_FAMILY']      = '1,2'
  s['SKIP_INSTALL']                = 'YES'
  # WidgetKit extension point
  s['LD_RUNPATH_SEARCH_PATHS']     = ['$(inherited)', '@executable_path/Frameworks', '@executable_path/../../Frameworks']
  s['APPLICATION_EXTENSION_API_ONLY'] = 'YES'
  # Important: extension must be embedded in the app
  s['EMBED_ASSET_PACKS_IN_PRODUCT_BUNDLE'] = 'YES'
end

log "Build settings configured"

# ─────────────────────────────────────────────────────────────────────────────
# Step 4 — Add Swift source files to widget target
# ─────────────────────────────────────────────────────────────────────────────

step "Adding Swift source files to #{WIDGET_TARGET} target"

widget_sources = Dir.glob(File.join(WIDGET_DIR, '*.swift'))

# Find or create a group for DreamWidget
widget_group = project.main_group['DreamWidget'] ||
               project.main_group.new_group('DreamWidget', 'DreamWidget')

widget_sources.each do |src_path|
  filename = File.basename(src_path)
  already_in_group = widget_group.files.any? { |f| f.path == filename }
  if already_in_group
    warn "  #{filename} already in group — skipping"
    next
  end
  file_ref = widget_group.new_file(src_path)
  widget_target.add_file_references([file_ref])
  log "  Added #{filename}"
end

# Add Assets.xcassets
assets_path = File.join(WIDGET_DIR, 'Assets.xcassets')
if File.exist?(assets_path)
  unless widget_group.files.any? { |f| f.path&.include?('Assets.xcassets') }
    asset_ref = widget_group.new_file(assets_path)
    # Assets go in the resources build phase
    widget_target.resources_build_phase.add_file_reference(asset_ref)
    log "  Added Assets.xcassets"
  end
end

# ─────────────────────────────────────────────────────────────────────────────
# Step 5 — Add NSExtension info to widget's Info.plist if missing
# ─────────────────────────────────────────────────────────────────────────────

step "Verifying DreamWidget/Info.plist has NSExtensionPointIdentifier"

info_plist_path = File.join(WIDGET_DIR, 'Info.plist')
if File.exist?(info_plist_path)
  content = File.read(info_plist_path)
  unless content.include?('com.apple.widgetkit-extension')
    warn "Info.plist missing widgetkit-extension key — please verify manually"
  else
    log "Info.plist looks correct"
  end
end

# ─────────────────────────────────────────────────────────────────────────────
# Step 6 — Embed the widget extension in the App target
# ─────────────────────────────────────────────────────────────────────────────

step "Embedding #{WIDGET_TARGET} in App target"

embed_phase = app_target.copy_files_build_phases.find { |p| p.name == 'Embed App Extensions' }

unless embed_phase
  embed_phase = app_target.new_copy_files_build_phase('Embed App Extensions')
  embed_phase.dst_subfolder_spec = '13' # PlugIns / App Extensions
  log "Created 'Embed App Extensions' build phase"
end

widget_product = widget_target.product_reference
already_embedded = embed_phase.files_references.any? { |f| f == widget_product }

unless already_embedded
  build_file = embed_phase.add_file_reference(widget_product)
  build_file.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }
  log "Embedded #{WIDGET_TARGET} product in App"
else
  warn "#{WIDGET_TARGET} already embedded"
end

# ─────────────────────────────────────────────────────────────────────────────
# Step 7 — Save project
# ─────────────────────────────────────────────────────────────────────────────

step "Saving project"
project.save
log "Project saved to #{PROJECT_PATH}"

# ─────────────────────────────────────────────────────────────────────────────
# Done
# ─────────────────────────────────────────────────────────────────────────────

puts ""
puts "\e[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\e[0m"
puts "\e[32m  iOS native extensions wired up successfully!\e[0m"
puts "\e[32m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\e[0m"
puts ""
puts "Next steps:"
puts "  1. cd ios/App && pod install"
puts "  2. Open App.xcworkspace in Xcode"
puts "  3. Select the App target → Signing & Capabilities → +"
puts "     Add 'App Groups' capability → add group.app.dreamweaver.LucidRepo"
puts "  4. Do the same for the DreamWidget target"
puts "  5. Build & run on a simulator or device"
puts ""
puts "To test the widget: long-press home screen → + → search 'Lucid Repo'"
puts ""
