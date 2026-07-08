import Foundation
import Capacitor
import RevenueCat
import SwiftUI

// ─────────────────────────────────────────────────────────────────────────────
// NativePaywallPlugin
//
// Presents a fully native SwiftUI paywall that uses RevenueCat's SDK for
// fetching offerings and handling purchases.  Falls back gracefully if
// RevenueCat isn't configured yet (JS hasn't called initialize yet).
//
// JS usage:
//   import { NativePaywallPlugin } from '@/plugins/NativePaywallPlugin';
//   const { result } = await NativePaywallPlugin.presentPaywall({ feature: 'analysis' });
//   // result: 'purchased' | 'dismissed' | 'error' | 'unsupported'
// ─────────────────────────────────────────────────────────────────────────────

@objc(NativePaywallPlugin)
public class NativePaywallPlugin: CAPPlugin {

    @objc func presentPaywall(_ call: CAPPluginCall) {
        let feature = call.getString("feature") ?? "analysis"

        DispatchQueue.main.async { [weak self] in
            guard let topVC = self?.topViewController() else {
                call.resolve(["result": "error", "message": "No view controller available"])
                return
            }

            // Fetch RevenueCat offerings then present the native paywall
            Purchases.shared.getOfferings { offerings, error in
                DispatchQueue.main.async {
                    if let error = error {
                        // RevenueCat not ready — resolve so JS shows its own paywall
                        call.resolve(["result": "unsupported", "message": error.localizedDescription])
                        return
                    }
                    let packages = offerings?.current?.availablePackages ?? []
                    let view = NativePaywallView(
                        feature: feature,
                        packages: packages,
                        onPurchased: {
                            topVC.dismiss(animated: true)
                            call.resolve(["result": "purchased"])
                        },
                        onDismissed: {
                            topVC.dismiss(animated: true)
                            call.resolve(["result": "dismissed"])
                        }
                    )
                    let hostingVC = UIHostingController(rootView: view)
                    hostingVC.modalPresentationStyle = .pageSheet
                    if let sheet = hostingVC.sheetPresentationController {
                        sheet.detents = [.large()]
                        sheet.prefersGrabberVisible = true
                        sheet.preferredCornerRadius = 24
                    }
                    topVC.present(hostingVC, animated: true)
                }
            }
        }
    }

    // MARK: - Helpers

    private func topViewController() -> UIViewController? {
        let scenes = UIApplication.shared.connectedScenes
        let windowScene = scenes.first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene
        let window = windowScene?.windows.first(where: { $0.isKeyWindow })
            ?? UIApplication.shared.windows.first
        var vc = window?.rootViewController
        while let presented = vc?.presentedViewController {
            vc = presented
        }
        return vc
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MARK: - NativePaywallView  (full SwiftUI paywall)
// ─────────────────────────────────────────────────────────────────────────────

private struct FeatureInfo {
    let systemIcon: String
    let title: String
    let description: String
}

private let featureMap: [String: FeatureInfo] = [
    "analysis": FeatureInfo(
        systemIcon: "brain.head.profile",
        title: "Dream Analysis",
        description: "AI-powered interpretation unlocking the symbols, emotions, and hidden meanings within your dreams."
    ),
    "image": FeatureInfo(
        systemIcon: "sparkles",
        title: "Dream Art",
        description: "Transform your subconscious visions into stunning AI-generated artwork."
    ),
    "chat": FeatureInfo(
        systemIcon: "bubble.left.and.bubble.right.fill",
        title: "AI Dream Chat",
        description: "Have deep conversations with AI dream experts who can decode what the night reveals."
    ),
]

private let mysticFeatures = [
    ("Unlimited Dream Analysis",        "brain.head.profile"),
    ("Unlimited Dream Art Generation",  "sparkles"),
    ("Unlimited AI Dream Chat",         "bubble.left.and.bubble.right"),
    ("Dream Video Generation",          "film.fill"),
    ("Voice-to-Text Journaling",        "mic.fill"),
    ("Priority Support",                "crown.fill"),
]

private let dreamerFeatures = [
    ("Unlimited Dream Analysis",        "brain.head.profile"),
    ("10 Dream Art Generations",        "sparkles"),
    ("AI Dream Chat (5 msgs/day)",      "bubble.left.and.bubble.right"),
    ("Voice-to-Text Journaling",        "mic.fill"),
]

struct NativePaywallView: View {
    let feature: String
    let packages: [Package]
    let onPurchased: () -> Void
    let onDismissed: () -> Void

    @State private var selectedPackage: Package?
    @State private var isPurchasing = false
    @State private var errorMessage: String?

    private var featureInfo: FeatureInfo {
        featureMap[feature] ?? featureMap["analysis"]!
    }

    // Premium package = highest price
    private var premiumPackage: Package? {
        packages.max(by: { ($0.storeProduct.price as Decimal) < ($1.storeProduct.price as Decimal) })
    }
    private var basicPackage: Package? {
        packages.min(by: { ($0.storeProduct.price as Decimal) < ($1.storeProduct.price as Decimal) })
    }

    private var selectedIsPremium: Bool {
        guard let sel = selectedPackage, let prem = premiumPackage else { return true }
        return sel.identifier == prem.identifier
    }

    var body: some View {
        ZStack {
            // ── Background ──────────────────────────────────────────────
            LinearGradient(
                colors: [Color(hex: "#1a1a3e"), Color(hex: "#0d0d1f"), Color(hex: "#080812")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            RadialGradient(
                colors: [Color(hex: "#4B8EF5").opacity(0.18), .clear],
                center: .top,
                startRadius: 0,
                endRadius: 300
            )
            .ignoresSafeArea()

            PaywallStars()

            // ── Content ──────────────────────────────────────────────
            VStack(spacing: 0) {
                // Drag indicator
                RoundedRectangle(cornerRadius: 2.5)
                    .fill(Color.white.opacity(0.25))
                    .frame(width: 36, height: 5)
                    .padding(.top, 10)

                // Dismiss button
                HStack {
                    Spacer()
                    Button(action: onDismissed) {
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(.white.opacity(0.5))
                            .padding(8)
                            .background(Circle().fill(Color.white.opacity(0.08)))
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 8)

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 24) {

                        // ── Hero ──────────────────────────────────────
                        VStack(spacing: 14) {
                            ZStack {
                                // Outer glow ring
                                Circle()
                                    .fill(Color(hex: "#4B8EF5").opacity(0.15))
                                    .frame(width: 120, height: 120)
                                // Moon orb
                                Circle()
                                    .fill(
                                        RadialGradient(
                                            colors: [Color(hex: "#93C5FD"), Color(hex: "#4B8EF5"), Color(hex: "#1e1b4b")],
                                            center: UnitPoint(x: 0.35, y: 0.3),
                                            startRadius: 0,
                                            endRadius: 45
                                        )
                                    )
                                    .frame(width: 80, height: 80)
                                    .shadow(color: Color(hex: "#4B8EF5").opacity(0.5), radius: 20)
                                // Feature icon
                                Image(systemName: featureInfo.systemIcon)
                                    .font(.system(size: 28, weight: .medium))
                                    .foregroundStyle(.white)
                                    .shadow(color: Color(hex: "#93C5FD").opacity(0.8), radius: 8)
                            }

                            Text("Unlock \(featureInfo.title)")
                                .font(.system(size: 22, weight: .semibold, design: .serif))
                                .foregroundStyle(.white)
                                .multilineTextAlignment(.center)

                            Text(featureInfo.description)
                                .font(.system(size: 14, weight: .regular, design: .serif))
                                .italic()
                                .foregroundStyle(.white.opacity(0.6))
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 20)
                        }
                        .padding(.top, 8)

                        // ── Feature list ──────────────────────────────
                        VStack(alignment: .leading, spacing: 0) {
                            Text("Everything included")
                                .font(.system(size: 11, weight: .regular, design: .serif))
                                .italic()
                                .foregroundStyle(Color(hex: "#4B8EF5").opacity(0.7))
                                .padding(.bottom, 10)

                            let features = selectedIsPremium ? mysticFeatures : dreamerFeatures
                            ForEach(features.indices, id: \.self) { i in
                                HStack(spacing: 10) {
                                    Image(systemName: "sparkle")
                                        .font(.system(size: 11))
                                        .foregroundStyle(Color(hex: "#4B8EF5"))
                                        .frame(width: 16)
                                    Text(features[i].0)
                                        .font(.system(size: 14))
                                        .foregroundStyle(.white.opacity(0.85))
                                    Spacer()
                                }
                                .padding(.vertical, 5)
                            }
                        }
                        .padding(.horizontal, 24)

                        // ── Plan cards ────────────────────────────────
                        VStack(spacing: 10) {
                            Text("Choose your path through the dreamscape")
                                .font(.system(size: 11, weight: .regular, design: .serif))
                                .italic()
                                .foregroundStyle(.white.opacity(0.4))
                                .multilineTextAlignment(.center)

                            ForEach(sortedPackages, id: \.identifier) { pkg in
                                PaywallPlanCard(
                                    package: pkg,
                                    isPremium: pkg.identifier == premiumPackage?.identifier,
                                    isSelected: selectedPackage?.identifier == pkg.identifier,
                                    onTap: { selectedPackage = pkg }
                                )
                            }
                        }
                        .padding(.horizontal, 20)

                        if let err = errorMessage {
                            Text(err)
                                .font(.caption)
                                .foregroundStyle(Color.red.opacity(0.8))
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 24)
                        }

                        // Spacer for fixed bottom bar
                        Spacer(minLength: 100)
                    }
                }

                // ── Fixed bottom bar ──────────────────────────────────
                VStack(spacing: 8) {
                    Button(action: handlePurchase) {
                        HStack {
                            if isPurchasing {
                                ProgressView()
                                    .progressViewStyle(.circular)
                                    .tint(.white)
                            } else {
                                Text("Begin Your Journey")
                                    .font(.system(size: 16, weight: .semibold))
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(
                            LinearGradient(
                                colors: [Color(hex: "#4B8EF5"), Color(hex: "#7C3AED")],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .shadow(color: Color(hex: "#4B8EF5").opacity(0.45), radius: 12, y: 4)
                    }
                    .disabled(isPurchasing || selectedPackage == nil)

                    Text("Auto-renews · Cancel anytime")
                        .font(.system(size: 10))
                        .foregroundStyle(.white.opacity(0.3))
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 28)
                .background(
                    Rectangle()
                        .fill(.ultraThinMaterial)
                        .ignoresSafeArea()
                )
            }
        }
        .onAppear { selectedPackage = premiumPackage ?? packages.first }
    }

    // ── Sorted packages: premium first ──────────────────────────────
    private var sortedPackages: [Package] {
        packages.sorted {
            ($0.storeProduct.price as Decimal) > ($1.storeProduct.price as Decimal)
        }
    }

    // ── Purchase handler ─────────────────────────────────────────────
    private func handlePurchase() {
        guard let pkg = selectedPackage else { return }
        isPurchasing = true
        errorMessage = nil
        Purchases.shared.purchase(package: pkg) { transaction, info, error, cancelled in
            DispatchQueue.main.async {
                isPurchasing = false
                if cancelled { return }
                if let error = error {
                    errorMessage = error.localizedDescription
                    return
                }
                onPurchased()
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MARK: - Plan card
// ─────────────────────────────────────────────────────────────────────────────

private struct PaywallPlanCard: View {
    let package: Package
    let isPremium: Bool
    let isSelected: Bool
    let onTap: () -> Void

    private var priceString: String {
        package.localizedPriceString
    }

    var body: some View {
        Button(action: onTap) {
            ZStack(alignment: .topTrailing) {
                HStack {
                    VStack(alignment: .leading, spacing: 3) {
                        Text(isPremium ? "Mystic" : "Dreamer")
                            .font(.system(size: 15, weight: .semibold,
                                          design: isPremium ? .serif : .default))
                            .foregroundStyle(.white)
                        Text("\(priceString) / month")
                            .font(.system(size: 13))
                            .foregroundStyle(.white.opacity(0.55))
                    }
                    Spacer()
                    // Radio indicator
                    ZStack {
                        Circle()
                            .strokeBorder(
                                isSelected
                                    ? (isPremium ? Color(hex: "#F59E0B") : Color(hex: "#4B8EF5"))
                                    : Color.white.opacity(0.2),
                                lineWidth: 2
                            )
                            .frame(width: 20, height: 20)
                        if isSelected {
                            Circle()
                                .fill(isPremium ? Color(hex: "#F59E0B") : Color(hex: "#4B8EF5"))
                                .frame(width: 10, height: 10)
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(
                            isSelected
                                ? (isPremium
                                    ? Color(hex: "#F59E0B").opacity(0.12)
                                    : Color(hex: "#4B8EF5").opacity(0.12))
                                : Color.white.opacity(0.05)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .strokeBorder(
                                    isSelected
                                        ? (isPremium ? Color(hex: "#F59E0B").opacity(0.6) : Color(hex: "#4B8EF5").opacity(0.6))
                                        : Color.white.opacity(0.1),
                                    lineWidth: 1
                                )
                        )
                        .shadow(
                            color: isSelected
                                ? (isPremium ? Color(hex: "#F59E0B").opacity(0.2) : Color(hex: "#4B8EF5").opacity(0.2))
                                : .clear,
                            radius: 10
                        )
                )

                // Best value badge
                if isPremium {
                    Text("Best Value")
                        .font(.system(size: 9, weight: .bold))
                        .tracking(0.8)
                        .foregroundStyle(Color(hex: "#78350F"))
                        .padding(.horizontal, 10)
                        .padding(.vertical, 3)
                        .background(
                            Capsule().fill(
                                LinearGradient(
                                    colors: [Color(hex: "#FCD34D"), Color(hex: "#F97316")],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                        )
                        .offset(x: -12, y: -10)
                }
            }
        }
        .buttonStyle(.plain)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MARK: - Decorative stars
// ─────────────────────────────────────────────────────────────────────────────

private struct PaywallStars: View {
    private struct Dot: Identifiable {
        let id: Int
        let x: CGFloat; let y: CGFloat
        let size: CGFloat; let opacity: Double
    }
    private let dots: [Dot] = (0..<25).map { i in
        let seed = Double(i * 137 + 41)
        return Dot(
            id: i,
            x: CGFloat((seed * 1.3).truncatingRemainder(dividingBy: 100)),
            y: CGFloat((seed * 2.7).truncatingRemainder(dividingBy: 100)),
            size: CGFloat((seed * 0.7).truncatingRemainder(dividingBy: 2) + 1),
            opacity: Double((seed * 0.13).truncatingRemainder(dividingBy: 0.6) + 0.2)
        )
    }
    var body: some View {
        GeometryReader { geo in
            ForEach(dots) { d in
                Circle()
                    .fill(Color.white.opacity(d.opacity))
                    .frame(width: d.size, height: d.size)
                    .position(
                        x: d.x / 100 * geo.size.width,
                        y: d.y / 100 * geo.size.height
                    )
            }
        }
        .allowsHitTesting(false)
    }
}
