import Foundation
import Capacitor
import WidgetKit

// ─────────────────────────────────────────────────────────────────────────────
// DreamDataPlugin
//
// Writes dream data from the React/JS layer into the shared App Group
// UserDefaults container so the WidgetKit extension can read it without
// needing a network call.
//
// JS usage:
//   import { DreamDataPlugin } from '@/plugins/DreamDataPlugin';
//   await DreamDataPlugin.saveLatestDream({ title, preview, date });
//   await DreamDataPlugin.updateStreak({ days, totalDreams });
//   await DreamDataPlugin.reloadWidgets();
// ─────────────────────────────────────────────────────────────────────────────

private let appGroupID = "group.app.dreamweaver.LucidRepo"

@objc(DreamDataPlugin)
public class DreamDataPlugin: CAPPlugin {

    // MARK: - Save latest dream

    @objc func saveLatestDream(_ call: CAPPluginCall) {
        guard let title = call.getString("title") else {
            call.reject("title is required")
            return
        }
        let preview = call.getString("preview") ?? ""
        let date    = call.getString("date")    ?? ""

        guard let defaults = UserDefaults(suiteName: appGroupID) else {
            call.reject("App Group '\(appGroupID)' is not configured. Check entitlements.")
            return
        }

        defaults.set(title,   forKey: "latestDreamTitle")
        defaults.set(preview, forKey: "latestDreamPreview")
        defaults.set(date,    forKey: "latestDreamDate")
        defaults.synchronize()

        reloadAllTimelines()
        call.resolve()
    }

    // MARK: - Update streak + total count

    @objc func updateStreak(_ call: CAPPluginCall) {
        let days        = call.getInt("days")        ?? 0
        let totalDreams = call.getInt("totalDreams") ?? 0

        guard let defaults = UserDefaults(suiteName: appGroupID) else {
            call.reject("App Group '\(appGroupID)' is not configured. Check entitlements.")
            return
        }

        defaults.set(days,        forKey: "dreamStreak")
        defaults.set(totalDreams, forKey: "totalDreams")
        defaults.synchronize()

        reloadAllTimelines()
        call.resolve()
    }

    // MARK: - Explicit widget reload (call after bulk updates)

    @objc func reloadWidgets(_ call: CAPPluginCall) {
        reloadAllTimelines()
        call.resolve()
    }

    // MARK: - Helpers

    private func reloadAllTimelines() {
        WidgetCenter.shared.reloadAllTimelines()
    }
}
