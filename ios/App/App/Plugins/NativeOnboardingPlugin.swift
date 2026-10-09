import Foundation
import Capacitor
import SwiftUI

// ─────────────────────────────────────────────────────────────────────────────
// NativeOnboardingPlugin
//
// Presents a full-screen native SwiftUI onboarding flow that matches the
// app's cosmic dream-journaling aesthetic.  Call it when hasSeenOnboarding
// is false — it resolves when the user accepts terms and taps "Enter".
//
// JS usage:
//   import { NativeOnboardingPlugin } from '@/plugins/NativeOnboardingPlugin';
//   const { completed } = await NativeOnboardingPlugin.presentOnboarding();
// ─────────────────────────────────────────────────────────────────────────────

@objc(NativeOnboardingPlugin)
public class NativeOnboardingPlugin: CAPPlugin {

    @objc func presentOnboarding(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let window = UIApplication.shared.windows.first else {
                call.resolve(["completed": false])
                return
            }
            let onboardingView = NativeOnboardingView {
                window.rootViewController?.dismiss(animated: true) {
                    call.resolve(["completed": true])
                }
            }
            let vc = UIHostingController(rootView: onboardingView)
            vc.modalPresentationStyle = .fullScreen
            vc.modalTransitionStyle   = .crossDissolve
            window.rootViewController?.present(vc, animated: true)
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MARK: - Page data
// ─────────────────────────────────────────────────────────────────────────────

private struct OnboardingPage {
    let systemIcon: String
    let iconColor: Color
    let title: String
    let subtitle: String
    let gradientColors: [Color]
}

private let onboardingPages: [OnboardingPage] = [
    OnboardingPage(
        systemIcon: "moon.stars.fill",
        iconColor: Color(hex: "#93C5FD"),
        title: "Capture Every Dream",
        subtitle: "Every dream is a message from your deeper self. Capture it the moment your eyes open — before it dissolves into morning.",
        gradientColors: [Color(hex: "#0f1729"), Color(hex: "#080c14")]
    ),
    OnboardingPage(
        systemIcon: "brain.head.profile",
        iconColor: Color(hex: "#a78bfa"),
        title: "AI-Powered Insights",
        subtitle: "Beneath every dream lies a constellation of symbols. Our AI reads the patterns your waking mind cannot see.",
        gradientColors: [Color(hex: "#140d2b"), Color(hex: "#080812")]
    ),
    OnboardingPage(
        systemIcon: "sparkles",
        iconColor: Color(hex: "#60a5fa"),
        title: "See Your Dreams Come Alive",
        subtitle: "Your subconscious paints in impossible colors. Watch your inner visions take shape as living art and cinematic memory.",
        gradientColors: [Color(hex: "#0e1828"), Color(hex: "#060d18")]
    ),
    OnboardingPage(
        systemIcon: "globe.americas.fill",
        iconColor: Color(hex: "#34d399"),
        title: "Join the Dream Community",
        subtitle: "You are never alone in the dark. Share what the night reveals and discover the dreams you hold in common with strangers.",
        gradientColors: [Color(hex: "#091a18"), Color(hex: "#050e0d")]
    ),
    OnboardingPage(
        systemIcon: "safari.fill",
        iconColor: Color(hex: "#818cf8"),
        title: "Your Journey Begins",
        subtitle: "The threshold is before you. Step through — thousands of dreamers are already on the other side.",
        gradientColors: [Color(hex: "#131028"), Color(hex: "#08061a")]
    ),
]

// ─────────────────────────────────────────────────────────────────────────────
// MARK: - Main view
// ─────────────────────────────────────────────────────────────────────────────

struct NativeOnboardingView: View {
    var onComplete: () -> Void

    @State private var currentPage  = 0
    @State private var termsAccepted = false
    @State private var showTerms     = false   // last screen
    @GestureState private var dragOffset: CGFloat = 0

    private var isLastPage: Bool  { showTerms }
    private var totalPages: Int   { onboardingPages.count }

    var body: some View {
        ZStack {
            // Dynamic background
            let colors = currentColors
            LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()
                .animation(.easeInOut(duration: 0.6), value: currentPage)

            RadialGradient(
                colors: [onboardingPages[safe: currentPage]?.iconColor.opacity(0.18) ?? .clear, .clear],
                center: .top,
                startRadius: 0,
                endRadius: 280
            )
            .ignoresSafeArea()
            .animation(.easeInOut(duration: 0.6), value: currentPage)

            OnboardingStarField()

            // Skip button
            if !isLastPage {
                VStack {
                    HStack {
                        Spacer()
                        Button(action: { withAnimation { showTerms = true } }) {
                            Text("Skip")
                                .font(.system(size: 14))
                                .foregroundStyle(.white.opacity(0.35))
                        }
                        .padding(.horizontal, 24)
                        .padding(.top, 56)
                    }
                    Spacer()
                }
            }

            // Page content
            VStack(spacing: 0) {
                Spacer()

                if isLastPage {
                    TermsPageView(termsAccepted: $termsAccepted)
                        .transition(.asymmetric(
                            insertion: .move(edge: .trailing).combined(with: .opacity),
                            removal:   .move(edge: .leading).combined(with: .opacity)
                        ))
                } else {
                    PageContentView(page: onboardingPages[currentPage])
                        .id(currentPage)
                        .transition(.asymmetric(
                            insertion: .move(edge: .trailing).combined(with: .opacity),
                            removal:   .move(edge: .leading).combined(with: .opacity)
                        ))
                }

                Spacer()

                // Bottom controls
                VStack(spacing: 16) {
                    // Dot indicators (hidden on terms page)
                    if !isLastPage {
                        HStack(spacing: 8) {
                            ForEach(0..<totalPages, id: \.self) { i in
                                Capsule()
                                    .fill(i == currentPage
                                          ? Color(hex: "#4B8EF5")
                                          : Color.white.opacity(0.2))
                                    .frame(width: i == currentPage ? 22 : 8, height: 8)
                                    .animation(.spring(response: 0.3), value: currentPage)
                            }
                        }
                    }

                    // Action button
                    if isLastPage {
                        Button(action: { if termsAccepted { onComplete() } }) {
                            Text("Enter the Dream Realm")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundStyle(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 56)
                                .background(
                                    Group {
                                        if termsAccepted {
                                            AnyView(
                                                LinearGradient(
                                                    colors: [Color(hex: "#4B8EF5"), Color(hex: "#7C3AED")],
                                                    startPoint: .leading,
                                                    endPoint: .trailing
                                                )
                                            )
                                        } else {
                                            AnyView(Color.white.opacity(0.1))
                                        }
                                    }
                                )
                                .clipShape(Capsule())
                                .shadow(
                                    color: termsAccepted ? Color(hex: "#4B8EF5").opacity(0.5) : .clear,
                                    radius: 16, y: 4
                                )
                                .opacity(termsAccepted ? 1.0 : 0.4)
                        }
                        .disabled(!termsAccepted)
                        .animation(.easeInOut(duration: 0.25), value: termsAccepted)
                    } else {
                        Button(action: advance) {
                            Text("Next")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundStyle(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 56)
                                .background(
                                    LinearGradient(
                                        colors: [Color(hex: "#4B8EF5").opacity(0.2), Color(hex: "#7C3AED").opacity(0.15)],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .clipShape(Capsule())
                                .overlay(
                                    Capsule().strokeBorder(Color(hex: "#4B8EF5").opacity(0.4), lineWidth: 1)
                                )
                        }
                    }
                }
                .padding(.horizontal, 28)
                .padding(.bottom, 40)
            }
        }
        .gesture(
            DragGesture()
                .onEnded { value in
                    if value.translation.width < -50 { advance() }
                    if value.translation.width >  50 { retreat() }
                }
        )
        .animation(.spring(response: 0.4, dampingFraction: 0.85), value: currentPage)
        .animation(.spring(response: 0.4, dampingFraction: 0.85), value: isLastPage)
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private var currentColors: [Color] {
        onboardingPages[safe: currentPage]?.gradientColors
            ?? [Color(hex: "#0d0d1f"), Color(hex: "#080812")]
    }

    private func advance() {
        if currentPage < totalPages - 1 {
            withAnimation { currentPage += 1 }
        } else {
            withAnimation { showTerms = true }
        }
    }

    private func retreat() {
        if isLastPage {
            withAnimation { showTerms = false }
        } else if currentPage > 0 {
            withAnimation { currentPage -= 1 }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MARK: - Page content
// ─────────────────────────────────────────────────────────────────────────────

private struct PageContentView: View {
    let page: OnboardingPage

    var body: some View {
        VStack(spacing: 28) {
            // Icon with layered glow
            ZStack {
                Circle()
                    .fill(page.iconColor.opacity(0.12))
                    .frame(width: 130, height: 130)
                Circle()
                    .fill(page.iconColor.opacity(0.08))
                    .frame(width: 100, height: 100)
                    .overlay(
                        Circle().strokeBorder(page.iconColor.opacity(0.2), lineWidth: 1)
                    )
                Image(systemName: page.systemIcon)
                    .font(.system(size: 44, weight: .medium))
                    .foregroundStyle(page.iconColor)
                    .shadow(color: page.iconColor.opacity(0.6), radius: 12)
            }

            // Text
            VStack(spacing: 12) {
                Text(page.title)
                    .font(.system(size: 24, weight: .semibold, design: .serif))
                    .foregroundStyle(.white)
                    .multilineTextAlignment(.center)

                Text(page.subtitle)
                    .font(.system(size: 15, weight: .regular))
                    .foregroundStyle(.white.opacity(0.58))
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
                    .padding(.horizontal, 16)
            }
        }
        .padding(.horizontal, 28)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MARK: - Terms page
// ─────────────────────────────────────────────────────────────────────────────

private struct TermsPageView: View {
    @Binding var termsAccepted: Bool

    var body: some View {
        VStack(spacing: 28) {
            // Icon
            ZStack {
                Circle()
                    .fill(Color(hex: "#6366F1").opacity(0.12))
                    .frame(width: 120, height: 120)
                Image(systemName: "lock.shield.fill")
                    .font(.system(size: 44, weight: .medium))
                    .foregroundStyle(Color(hex: "#818cf8"))
                    .shadow(color: Color(hex: "#818cf8").opacity(0.5), radius: 12)
            }

            VStack(spacing: 12) {
                Text("Terms & Privacy")
                    .font(.system(size: 24, weight: .semibold, design: .serif))
                    .foregroundStyle(.white)

                Text("Before you cross the threshold, read and accept these terms. Your privacy is sacred here.")
                    .font(.system(size: 15))
                    .foregroundStyle(.white.opacity(0.55))
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
                    .padding(.horizontal, 16)
            }

            // Checkbox
            HStack(alignment: .top, spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 5)
                        .strokeBorder(
                            termsAccepted ? Color(hex: "#4B8EF5") : Color.white.opacity(0.3),
                            lineWidth: 1.5
                        )
                        .frame(width: 22, height: 22)
                        .background(
                            RoundedRectangle(cornerRadius: 5)
                                .fill(termsAccepted ? Color(hex: "#4B8EF5") : .clear)
                        )
                    if termsAccepted {
                        Image(systemName: "checkmark")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundStyle(.white)
                    }
                }
                .onTapGesture { withAnimation(.spring(response: 0.2)) { termsAccepted.toggle() } }

                VStack(alignment: .leading, spacing: 4) {
                    Text("I agree to the ")
                        .font(.system(size: 13))
                        .foregroundStyle(.white.opacity(0.65))
                    + Text("Terms of Use")
                        .font(.system(size: 13))
                        .foregroundStyle(Color(hex: "#4B8EF5"))
                        .underline()
                    + Text(" and ")
                        .font(.system(size: 13))
                        .foregroundStyle(.white.opacity(0.65))
                    + Text("Privacy Policy")
                        .font(.system(size: 13))
                        .foregroundStyle(Color(hex: "#4B8EF5"))
                        .underline()
                }
                .onTapGesture { withAnimation(.spring(response: 0.2)) { termsAccepted.toggle() } }
            }
            .padding(.horizontal, 28)
        }
        .padding(.horizontal, 8)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MARK: - Star field
// ─────────────────────────────────────────────────────────────────────────────

private struct OnboardingStarField: View {
    private struct StarPos: Identifiable {
        let id: Int; let x: CGFloat; let y: CGFloat; let r: CGFloat; let opacity: Double
    }
    private let stars: [StarPos] = (0..<55).map { i in
        let seed = Double(i * 173 + 29)
        return StarPos(
            id: i,
            x: CGFloat((seed * 1.7).truncatingRemainder(dividingBy: 100)),
            y: CGFloat((seed * 2.3).truncatingRemainder(dividingBy: 100)),
            r: CGFloat((seed * 0.09).truncatingRemainder(dividingBy: 1.5) + 0.5),
            opacity: Double((seed * 0.11).truncatingRemainder(dividingBy: 0.65) + 0.15)
        )
    }
    var body: some View {
        GeometryReader { geo in
            ForEach(stars) { s in
                Circle()
                    .fill(Color.white.opacity(s.opacity))
                    .frame(width: s.r * 2, height: s.r * 2)
                    .position(x: s.x / 100 * geo.size.width,
                              y: s.y / 100 * geo.size.height)
            }
        }
        .allowsHitTesting(false)
        .ignoresSafeArea()
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MARK: - Safe array subscript
// ─────────────────────────────────────────────────────────────────────────────

private extension Array {
    subscript(safe index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
