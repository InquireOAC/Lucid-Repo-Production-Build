import WidgetKit
import SwiftUI

// ─────────────────────────────────────────────
// MARK: - Shared App Group key
// ─────────────────────────────────────────────

private let appGroupID = "group.app.dreamweaver.LucidRepo"

// ─────────────────────────────────────────────
// MARK: - Data model
// ─────────────────────────────────────────────

struct DreamWidgetEntry: TimelineEntry {
    let date: Date
    let dreamTitle: String
    let dreamPreview: String
    let dreamDate: String
    let streakDays: Int
    let totalDreams: Int
}

extension DreamWidgetEntry {
    static var placeholder: DreamWidgetEntry {
        DreamWidgetEntry(
            date: .now,
            dreamTitle: "Floating Through Stars",
            dreamPreview: "I drifted through a cosmic nebula of violet light, weightless and free…",
            dreamDate: "Today",
            streakDays: 7,
            totalDreams: 42
        )
    }
}

// ─────────────────────────────────────────────
// MARK: - Timeline provider
// ─────────────────────────────────────────────

struct DreamProvider: TimelineProvider {

    func placeholder(in context: Context) -> DreamWidgetEntry {
        .placeholder
    }

    func getSnapshot(in context: Context, completion: @escaping (DreamWidgetEntry) -> Void) {
        completion(context.isPreview ? .placeholder : loadEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<DreamWidgetEntry>) -> Void) {
        let entry = loadEntry()
        // Refresh every hour so the widget stays in sync with new dreams
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: .now) ?? .now
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    // ─────────────────────────────────────────
    private func loadEntry() -> DreamWidgetEntry {
        let defaults = UserDefaults(suiteName: appGroupID)
        return DreamWidgetEntry(
            date: .now,
            dreamTitle: defaults?.string(forKey: "latestDreamTitle")   ?? "Record your first dream",
            dreamPreview: defaults?.string(forKey: "latestDreamPreview") ?? "Open Lucid Repo to capture what the night reveals.",
            dreamDate: defaults?.string(forKey: "latestDreamDate")    ?? "",
            streakDays: defaults?.integer(forKey: "dreamStreak")     ?? 0,
            totalDreams: defaults?.integer(forKey: "totalDreams")    ?? 0
        )
    }
}

// ─────────────────────────────────────────────
// MARK: - Color helpers
// ─────────────────────────────────────────────

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default: (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(.sRGB,
                  red:   Double(r) / 255,
                  green: Double(g) / 255,
                  blue:  Double(b) / 255,
                  opacity: Double(a) / 255)
    }

    static let cosmicDark   = Color(hex: "#0a0a1a")
    static let cosmicMid    = Color(hex: "#141430")
    static let auroraBlue   = Color(hex: "#4B8EF5")
    static let cosmicPurple = Color(hex: "#7C3AED")
    static let dreamGold    = Color(hex: "#F59E0B")
}

// ─────────────────────────────────────────────
// MARK: - Tiny star layer
// ─────────────────────────────────────────────

private struct StarDot: View {
    let x: CGFloat; let y: CGFloat; let r: CGFloat; let opacity: Double
    var body: some View {
        Circle()
            .fill(Color.white.opacity(opacity))
            .frame(width: r * 2, height: r * 2)
            .position(x: x, y: y)
    }
}

private struct WidgetStars: View {
    // Fixed positions so they don't regenerate on each render
    private let dots: [(CGFloat, CGFloat, CGFloat, Double)] = [
        (12, 8, 1.2, 0.7), (45, 15, 0.8, 0.4), (80, 5, 1.0, 0.6),
        (120, 20, 1.4, 0.8), (20, 35, 0.6, 0.3), (90, 40, 1.0, 0.5),
        (135, 10, 0.7, 0.4), (60, 50, 1.2, 0.7), (155, 30, 0.9, 0.5),
        (30, 60, 0.8, 0.4), (110, 55, 1.1, 0.6), (75, 70, 0.7, 0.3),
    ]
    var body: some View {
        GeometryReader { geo in
            ForEach(dots.indices, id: \.self) { i in
                let d = dots[i]
                // Scale positions to widget size
                let sx = d.0 / 160 * geo.size.width
                let sy = d.1 / 80  * geo.size.height
                StarDot(x: sx, y: sy, r: d.2, opacity: d.3)
            }
        }
    }
}

// ─────────────────────────────────────────────
// MARK: - Small widget  (systemSmall)
// ─────────────────────────────────────────────

struct SmallDreamWidgetView: View {
    let entry: DreamWidgetEntry

    var body: some View {
        ZStack(alignment: .topLeading) {
            // Background gradient
            LinearGradient(
                colors: [Color.cosmicMid, Color.cosmicDark],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            // Subtle radial glow
            RadialGradient(
                colors: [Color.auroraBlue.opacity(0.25), .clear],
                center: .topTrailing,
                startRadius: 0,
                endRadius: 80
            )

            WidgetStars()

            VStack(alignment: .leading, spacing: 0) {
                // Header row
                HStack(spacing: 4) {
                    Image(systemName: "moon.stars.fill")
                        .font(.caption2.bold())
                        .foregroundStyle(Color.auroraBlue)
                    Text("LUCID REPO")
                        .font(.system(size: 8, weight: .semibold))
                        .tracking(1.2)
                        .foregroundStyle(Color.auroraBlue.opacity(0.8))
                    Spacer()
                    if entry.streakDays > 0 {
                        HStack(spacing: 2) {
                            Image(systemName: "flame.fill")
                                .font(.system(size: 8))
                                .foregroundStyle(Color.dreamGold)
                            Text("\(entry.streakDays)")
                                .font(.system(size: 8, weight: .bold))
                                .foregroundStyle(Color.dreamGold)
                        }
                    }
                }

                Spacer()

                // Dream title
                Text(entry.dreamTitle)
                    .font(.system(size: 13, weight: .semibold, design: .serif))
                    .foregroundStyle(.white)
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)

                // Date badge
                if !entry.dreamDate.isEmpty {
                    Text(entry.dreamDate)
                        .font(.system(size: 9))
                        .foregroundStyle(.white.opacity(0.45))
                        .padding(.top, 2)
                }
            }
            .padding(12)
        }
    }
}

// ─────────────────────────────────────────────
// MARK: - Medium widget  (systemMedium)
// ─────────────────────────────────────────────

struct MediumDreamWidgetView: View {
    let entry: DreamWidgetEntry

    var body: some View {
        ZStack(alignment: .topLeading) {
            LinearGradient(
                colors: [Color(hex: "#1e1b4b"), Color.cosmicDark],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            RadialGradient(
                colors: [Color.auroraBlue.opacity(0.2), .clear],
                center: .leading,
                startRadius: 0,
                endRadius: 120
            )

            WidgetStars()

            HStack(alignment: .top, spacing: 14) {
                // Left column — icon + streak
                VStack(spacing: 8) {
                    ZStack {
                        Circle()
                            .fill(Color.auroraBlue.opacity(0.18))
                            .frame(width: 46, height: 46)
                        Image(systemName: "moon.stars.fill")
                            .font(.title3)
                            .foregroundStyle(
                                LinearGradient(
                                    colors: [Color.auroraBlue, Color.cosmicPurple],
                                    startPoint: .top,
                                    endPoint: .bottom
                                )
                            )
                    }
                    if entry.streakDays > 0 {
                        VStack(spacing: 1) {
                            Image(systemName: "flame.fill")
                                .font(.system(size: 11))
                                .foregroundStyle(Color.dreamGold)
                            Text("\(entry.streakDays)d")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundStyle(Color.dreamGold)
                        }
                    }
                    Spacer()
                }

                // Right column — dream content
                VStack(alignment: .leading, spacing: 4) {
                    Text("LAST DREAM")
                        .font(.system(size: 8, weight: .semibold))
                        .tracking(1.5)
                        .foregroundStyle(Color.auroraBlue.opacity(0.75))

                    Text(entry.dreamTitle)
                        .font(.system(size: 14, weight: .semibold, design: .serif))
                        .foregroundStyle(.white)
                        .lineLimit(1)

                    Text(entry.dreamPreview)
                        .font(.system(size: 11))
                        .foregroundStyle(.white.opacity(0.55))
                        .lineLimit(2)
                        .fixedSize(horizontal: false, vertical: true)

                    Spacer()

                    HStack {
                        if !entry.dreamDate.isEmpty {
                            Text(entry.dreamDate)
                                .font(.system(size: 9))
                                .foregroundStyle(.white.opacity(0.35))
                        }
                        Spacer()
                        if entry.totalDreams > 0 {
                            Text("\(entry.totalDreams) dreams")
                                .font(.system(size: 9))
                                .foregroundStyle(.white.opacity(0.35))
                        }
                    }
                }

                Spacer(minLength: 0)
            }
            .padding(14)
        }
    }
}

// ─────────────────────────────────────────────
// MARK: - Lock screen  (accessoryRectangular)
// ─────────────────────────────────────────────

struct LockScreenDreamWidgetView: View {
    let entry: DreamWidgetEntry
    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: "moon.stars.fill")
                .font(.caption.bold())
            VStack(alignment: .leading, spacing: 0) {
                Text(entry.dreamTitle.isEmpty ? "Tap to log a dream" : entry.dreamTitle)
                    .font(.system(size: 11, weight: .semibold))
                    .lineLimit(1)
                if entry.streakDays > 0 {
                    Text("\(entry.streakDays) day streak")
                        .font(.system(size: 9))
                        .opacity(0.7)
                }
            }
        }
    }
}

// ─────────────────────────────────────────────
// MARK: - Lock screen circular  (accessoryCircular)
// ─────────────────────────────────────────────

struct CircularStreakWidgetView: View {
    let entry: DreamWidgetEntry
    var body: some View {
        ZStack {
            AccessoryWidgetBackground()
            VStack(spacing: 1) {
                Image(systemName: "flame.fill")
                    .font(.system(size: 10, weight: .bold))
                Text("\(entry.streakDays)")
                    .font(.system(size: 14, weight: .bold))
            }
        }
    }
}

// ─────────────────────────────────────────────
// MARK: - Entry view dispatcher
// ─────────────────────────────────────────────

struct DreamWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: DreamWidgetEntry

    var body: some View {
        switch family {
        case .systemSmall:
            SmallDreamWidgetView(entry: entry)
        case .systemMedium:
            MediumDreamWidgetView(entry: entry)
        case .accessoryRectangular:
            LockScreenDreamWidgetView(entry: entry)
        default:
            SmallDreamWidgetView(entry: entry)
        }
    }
}

struct StreakWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: DreamWidgetEntry

    var body: some View {
        switch family {
        case .systemSmall:
            ZStack {
                LinearGradient(
                    colors: [Color(hex: "#1c1917"), Color.cosmicDark],
                    startPoint: .top, endPoint: .bottom
                )
                VStack(spacing: 6) {
                    Image(systemName: "flame.fill")
                        .font(.title2.bold())
                        .foregroundStyle(Color.dreamGold)
                    Text("\(entry.streakDays)")
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                    Text("Day Streak")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(.white.opacity(0.55))
                }
            }
        case .accessoryCircular:
            CircularStreakWidgetView(entry: entry)
        case .accessoryRectangular:
            HStack(spacing: 5) {
                Image(systemName: "flame.fill")
                    .foregroundStyle(Color.dreamGold)
                Text("\(entry.streakDays) day streak")
            }
            .font(.system(size: 11, weight: .semibold))
        default:
            CircularStreakWidgetView(entry: entry)
        }
    }
}

// ─────────────────────────────────────────────
// MARK: - Widget definitions
// ─────────────────────────────────────────────

struct DreamWidget: Widget {
    let kind = "DreamWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: DreamProvider()) { entry in
            DreamWidgetEntryView(entry: entry)
                .containerBackground(for: .widget) { Color.cosmicDark }
        }
        .configurationDisplayName("Last Dream")
        .description("See your most recent dream at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular])
    }
}

struct StreakWidget: Widget {
    let kind = "StreakWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: DreamProvider()) { entry in
            StreakWidgetEntryView(entry: entry)
                .containerBackground(for: .widget) { Color.cosmicDark }
        }
        .configurationDisplayName("Dream Streak")
        .description("Track your consecutive days of dream journaling.")
        .supportedFamilies([.systemSmall, .accessoryCircular, .accessoryRectangular])
    }
}

// ─────────────────────────────────────────────
// MARK: - Previews
// ─────────────────────────────────────────────

#Preview("Small", as: .systemSmall) {
    DreamWidget()
} timeline: { DreamWidgetEntry.placeholder }

#Preview("Medium", as: .systemMedium) {
    DreamWidget()
} timeline: { DreamWidgetEntry.placeholder }

#Preview("Lock Screen", as: .accessoryRectangular) {
    DreamWidget()
} timeline: { DreamWidgetEntry.placeholder }

#Preview("Streak Small", as: .systemSmall) {
    StreakWidget()
} timeline: { DreamWidgetEntry.placeholder }
