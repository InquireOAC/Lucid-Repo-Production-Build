---
name: Lucid Repo
description: A dream-journaling app with a dark, cosmic-aurora aesthetic — deep navy surfaces, frosted glass cards, animated starfields, and a luminous blue-to-violet brand gradient.
mode: dark-first

colors:
  # Surface scale — deep navy foundation
  background: "#0d0f12"
  surface: "#0d0f12"
  surface-container-lowest: "#0a0c0f"
  surface-container-low: "#101319"
  surface-container: "#11141a"
  surface-container-high: "#171a22"
  surface-container-highest: "#1d2129"
  popover: "#13161d"

  # Foreground / on-surface
  on-surface: "#f0f1f2"
  on-surface-variant: "#9ba3ad"
  on-surface-strong: "#ffffff"
  inverse-surface: "#f0f1f2"
  inverse-on-surface: "#0d0f12"

  # Borders, dividers, inputs
  outline: "#252830"
  outline-variant: "#1a1d24"
  border: "#252830"
  input-border: "#252830"
  ring: "#3b82f6"

  # Brand — Aurora primary
  primary: "#3b82f6"
  on-primary: "#ffffff"
  primary-container: "#1e3a8a"
  on-primary-container: "#dbeafe"
  primary-soft: "rgba(59, 130, 246, 0.15)"

  # Brand — Electric Violet secondary
  secondary: "#8b5cf6"
  on-secondary: "#ffffff"
  secondary-container: "#3a1f6e"
  on-secondary-container: "#ede9fe"

  # Aurora accent palette (for gradients, glows, decorative)
  aurora-purple: "#3b82f6"
  aurora-violet: "#7aa6f5"
  aurora-blue: "#5d92f0"
  aurora-teal: "#26d9c4"
  aurora-cyan: "#3fd4d4"
  aurora-seafoam: "#6fdfb8"
  mystic-gold: "#f5c244"
  mystic-amber: "#f59e0b"

  # Tag / category palette (filter pills, dream classification)
  tag-lucid: "#3b82f6"
  tag-adventure: "#10b981"
  tag-spiritual: "#f59e0b"
  tag-water: "#06b6d4"
  tag-nightmare: "#ef4444"
  tag-recurring: "#a855f7"
  tag-default: "#6b7280"

  # Semantic
  success: "#10b981"
  warning: "#f59e0b"
  destructive: "#ef4444"
  on-destructive: "#ffffff"
  info: "#3b82f6"

  # Muted / disabled
  muted: "#252830"
  on-muted: "#9ba3ad"
  disabled: "rgba(240, 241, 242, 0.38)"

typography:
  display:
    fontFamily: "Lato, ui-sans-serif, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: "800"
    lineHeight: "52px"
    letterSpacing: "-0.02em"
  headline-lg:
    fontFamily: "Lato, ui-sans-serif, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: "700"
    lineHeight: "40px"
    letterSpacing: "-0.01em"
  headline-md:
    fontFamily: "Lato, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: "700"
    lineHeight: "32px"
  title-lg:
    fontFamily: "Lato, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: "700"
    lineHeight: "28px"
  title-md:
    fontFamily: "Lato, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: "600"
    lineHeight: "26px"
  body-lg:
    fontFamily: "basis-grotesque-pro, Lato, ui-sans-serif, sans-serif"
    fontSize: "18px"
    fontWeight: "400"
    lineHeight: "28px"
  body-md:
    fontFamily: "basis-grotesque-pro, Lato, ui-sans-serif, sans-serif"
    fontSize: "16px"
    fontWeight: "400"
    lineHeight: "24px"
  body-sm:
    fontFamily: "basis-grotesque-pro, Lato, ui-sans-serif, sans-serif"
    fontSize: "14px"
    fontWeight: "400"
    lineHeight: "20px"
  label-md:
    fontFamily: "Lato, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: "600"
    lineHeight: "20px"
    letterSpacing: "0.01em"
  label-sm:
    fontFamily: "Lato, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: "600"
    lineHeight: "16px"
    letterSpacing: "0.02em"
  wordmark:
    fontFamily: "Lato, ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: "900"
    lineHeight: "32px"
    letterSpacing: "0.04em"
    textTransform: "uppercase"
  eyebrow:
    fontFamily: "Lato, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: "700"
    lineHeight: "16px"
    letterSpacing: "0.16em"
    textTransform: "uppercase"
  quote:
    fontFamily: "Playfair Display, EB Garamond, ui-serif, Georgia, serif"
    fontSize: "28px"
    fontWeight: "700"
    lineHeight: "36px"
    fontStyle: "italic"
  serif-body:
    fontFamily: "EB Garamond, ui-serif, Georgia, serif"
    fontSize: "18px"
    fontWeight: "400"
    lineHeight: "28px"
  mono:
    fontFamily: "Fira Code, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "13px"
    fontWeight: "400"
    lineHeight: "20px"

rounded:
  none: "0"
  sm: "0.5rem"
  DEFAULT: "0.75rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.25rem"
  "2xl": "1.5rem"
  "3xl": "2rem"
  full: "9999px"

spacing:
  base: "4px"
  "0": "0"
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  "2xl": "64px"
  "3xl": "96px"
  gutter: "16px"
  page-margin-mobile: "16px"
  page-margin-desktop: "24px"
  section-gap: "32px"
  card-padding: "20px"
  tab-bar-height: "64px"
  safe-area-aware: true

shadows:
  none: "none"
  xs: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
  sm: "0 1px 3px 0 rgba(0, 0, 0, 0.10), 0 1px 2px -1px rgba(0, 0, 0, 0.10)"
  md: "0 1px 3px 0 rgba(0, 0, 0, 0.10), 0 2px 4px -1px rgba(0, 0, 0, 0.10)"
  lg: "0 1px 3px 0 rgba(0, 0, 0, 0.10), 0 4px 6px -1px rgba(0, 0, 0, 0.10)"
  xl: "0 1px 3px 0 rgba(0, 0, 0, 0.10), 0 8px 10px -1px rgba(0, 0, 0, 0.10)"
  "2xl": "0 1px 3px 0 rgba(0, 0, 0, 0.25)"
  card-glass: "0 8px 32px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(96, 165, 250, 0.10), 0 0 20px rgba(59, 130, 246, 0.05)"
  card-luminous: "0 10px 40px rgba(0, 0, 0, 0.50), inset 0 1px 0 rgba(96, 165, 250, 0.15), 0 0 30px rgba(59, 130, 246, 0.08)"
  card-luminous-hover: "0 15px 50px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(96, 165, 250, 0.20), 0 0 50px rgba(59, 130, 246, 0.15)"
  card-featured: "0 20px 60px rgba(0, 0, 0, 0.60), inset 0 1px 0 rgba(96, 165, 250, 0.20), 0 0 60px rgba(59, 130, 246, 0.12)"
  glow-primary: "0 0 40px rgba(59, 130, 246, 0.40)"
  glow-primary-soft: "0 0 20px rgba(59, 130, 246, 0.15)"
  glow-secondary: "0 0 30px rgba(139, 92, 246, 0.30)"
  glow-gold: "0 0 20px rgba(245, 194, 68, 0.35)"
  input-focus: "0 0 20px rgba(59, 130, 246, 0.15)"

effects:
  glass-standard:
    backdropFilter: "blur(16px) saturate(120%)"
    background: "linear-gradient(180deg, rgba(43, 88, 153, 0.08) 0%, rgba(45, 78, 134, 0.04) 100%)"
    border: "1px solid rgba(96, 165, 250, 0.15)"
    shadow: "{shadows.card-glass}"
  glass-luminous:
    backdropFilter: "blur(20px) saturate(130%)"
    background: "linear-gradient(180deg, rgba(50, 100, 175, 0.12) 0%, rgba(53, 92, 155, 0.06) 100%)"
    border: "1px solid rgba(59, 130, 246, 0.20)"
    shadow: "{shadows.card-luminous}"
    hoverShadow: "{shadows.card-luminous-hover}"
    hoverTransform: "translateY(-2px)"
  glass-featured:
    backdropFilter: "blur(24px) saturate(140%)"
    background: "linear-gradient(135deg, rgba(50, 110, 195, 0.15) 0%, rgba(53, 100, 170, 0.10) 50%, rgba(60, 100, 155, 0.08) 100%)"
    border: "1px solid rgba(59, 130, 246, 0.25)"
    shadow: "{shadows.card-featured}"
  glass-nav:
    backdropFilter: "blur(24px) saturate(120%)"
    background: "linear-gradient(180deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)"
    border: "1px solid rgba(59, 130, 246, 0.10)"
    shadow: "inset 0 1px 0 rgba(96, 165, 250, 0.15), 0 -4px 20px rgba(59, 130, 246, 0.05)"

gradients:
  aurora: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #3b82f6 100%)"
  aurora-cta: "linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)"
  cosmic-bg: "linear-gradient(180deg, #0d0f12 0%, #11141a 50%, #0d0f12 100%)"
  dream: "linear-gradient(to bottom, #0d0f12 0%, #2a1f4a 100%)"
  hero-radial: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.12), transparent)"
  card-image-overlay: "linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.30) 50%, transparent 100%)"
  gold-text: "linear-gradient(135deg, #f5c244 0%, #f59e0b 50%, #f5d062 100%)"
  banner-aurora: "linear-gradient(135deg, rgba(50, 105, 190, 0.40) 0%, rgba(53, 92, 155, 0.30) 30%, rgba(53, 92, 155, 0.25) 60%, rgba(50, 78, 130, 0.20) 100%)"
  scrollbar-thumb: "linear-gradient(180deg, rgba(59, 130, 246, 0.40), rgba(139, 92, 246, 0.30))"

starfield:
  base: "{gradients.cosmic-bg}"
  ambient-glows:
    - "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.12), transparent)"
    - "radial-gradient(ellipse 60% 40% at 100% 0%, rgba(139, 92, 246, 0.08), transparent)"
    - "radial-gradient(ellipse 60% 40% at 0% 100%, rgba(59, 130, 246, 0.06), transparent)"
  star-density: "8 stars per viewport, 1px–2px, 25%–50% opacity, blue/violet tints"
  star-animation: "{motion.starfield-drift}"

motion:
  duration:
    instant: "100ms"
    fast: "150ms"
    base: "300ms"
    slow: "400ms"
    slower: "500ms"
    page-reveal: "500ms"
    glow-pulse: "3s"
    aurora-shift: "8s"
    starfield-drift: "40s"
    float: "6s"
  easing:
    standard: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
    expressive: "cubic-bezier(0.22, 1, 0.36, 1)"
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)"
    linear: "linear"
  hover:
    lift-sm: "translateY(-2px)"
    lift-md: "translateY(-4px) scale(1.01)"
    lift-lg: "translateY(-6px) scale(1.01)"
    lift-xl: "translateY(-8px) scale(1.02)"
    cta-press: "scale(0.98)"
  named:
    page-reveal: "opacity 0→1, translateY(20px→0) scale(0.98→1) over 500ms expressive"
    fade-in-up: "opacity 0→1, translateY(16px→0) over 500ms standard"
    magic-glow: "box-shadow pulse between 15px@20% and 30px@40% rgba(59,130,246) over 3s ease-in-out infinite"
    glow-pulse: "box-shadow pulse 20px@15% → 40px@30% + 60px secondary@15% over 3s ease-in-out infinite"
    aurora-shift: "background-position 0%→100%→0% over 8s ease-in-out infinite"
    shimmer: "background-position -200% → 200% over 3s ease-in-out infinite"
    float: "translateY 0 → -10px → 0 over 6s ease-in-out infinite"
    starfield-drift: "translate 0,0 → 3,-5 → -2,-2 → 5,-8 → 0,0 over 40s ease-in-out infinite, opacity 0.8→1.0 modulated"
    twinkle: "opacity 0.1 → 1 → 0.1 over 2–4s randomized"
    light-sweep: "linear gradient sweeps left → right across surface over 600ms ease on hover"

z-index:
  base: 0
  raised: 10
  sticky: 20
  nav: 30
  overlay: 40
  modal: 50
  toast: 60
  tooltip: 70

breakpoints:
  sm: "640px"
  md: "768px"
  lg: "1024px"
  xl: "1280px"
  "2xl": "1400px"

components:
  button-luminous:
    role: "Primary call-to-action — Sign In, Record Dream, See Insights."
    background: "{colors.primary}"
    backgroundHover: "{gradients.aurora-cta}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    paddingX: "{spacing.lg}"
    paddingY: "{spacing.sm}"
    height: "44px"
    shadow: "0 8px 16px -4px rgba(59, 130, 246, 0.35)"
    hoverShadow: "{shadows.glow-primary}"
    hoverTransform: "scale(1.02)"
    activeTransform: "{motion.hover.cta-press}"
    transition: "all {motion.duration.base} {motion.easing.expressive}"
  button-outline:
    background: "transparent"
    textColor: "{colors.primary}"
    border: "1px solid rgba(59, 130, 246, 0.30)"
    rounded: "{rounded.full}"
    paddingX: "{spacing.md}"
    paddingY: "{spacing.sm}"
    hoverBackground: "rgba(59, 130, 246, 0.10)"
  button-ghost:
    background: "transparent"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    hoverBackground: "rgba(255, 255, 255, 0.05)"
  button-icon:
    role: "Circular icon button — settings, messages, notifications, edit avatar."
    size: "44px"
    rounded: "{rounded.full}"
    background: "rgba(13, 15, 18, 0.60)"
    border: "1px solid rgba(59, 130, 246, 0.20)"
    iconColor: "{colors.on-surface}"
    backdropFilter: "blur(12px)"
    badgeBackground: "{colors.destructive}"
    badgeOffset: "-4px top, -4px right"
  button-destructive:
    background: "rgba(239, 68, 68, 0.15)"
    textColor: "{colors.destructive}"
    border: "1px solid rgba(239, 68, 68, 0.30)"
    rounded: "{rounded.full}"

  badge-lucid:
    role: "Marks a lucid dream — appears on dream cards and feed items."
    background: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    paddingX: "{spacing.sm}"
    paddingY: "2px"
    icon: "sparkle 12px on left"
  badge-aurora:
    background: "rgba(59, 130, 246, 0.30)"
    textColor: "{colors.on-surface-strong}"
    rounded: "{rounded.full}"
  badge-gold:
    background: "rgba(245, 194, 68, 0.20)"
    textColor: "{colors.mystic-gold}"
    rounded: "{rounded.full}"
  badge-notification-count:
    background: "{colors.destructive}"
    textColor: "{colors.on-destructive}"
    typography: "{typography.label-sm}"
    minWidth: "20px"
    height: "20px"
    rounded: "{rounded.full}"

  pill-filter:
    role: "Category filter chip on Journal and Repo screens."
    rounded: "{rounded.full}"
    paddingX: "{spacing.md}"
    paddingY: "6px"
    typography: "{typography.label-md}"
    inactiveBackground: "rgba(37, 40, 48, 0.50)"
    inactiveTextColor: "{colors.on-surface-variant}"
    inactiveBorder: "1px solid {colors.outline}"
    activeBackground: "{colors.primary}"
    activeTextColor: "{colors.on-primary}"
    perCategoryColor: "When category is named, text color uses the matching tag color (lucid → tag-lucid, adventure → tag-adventure, spiritual → tag-spiritual, water → tag-water)."

  card-glass:
    role: "Default content card."
    background: "{effects.glass-standard.background}"
    backdropFilter: "{effects.glass-standard.backdropFilter}"
    border: "{effects.glass-standard.border}"
    shadow: "{effects.glass-standard.shadow}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card-padding}"
  card-luminous:
    role: "Primary entry card — Record a Dream, Dream Book, Lucid Insights."
    background: "{effects.glass-luminous.background}"
    backdropFilter: "{effects.glass-luminous.backdropFilter}"
    border: "{effects.glass-luminous.border}"
    shadow: "{effects.glass-luminous.shadow}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card-padding}"
    hoverShadow: "{effects.glass-luminous.hoverShadow}"
    hoverTransform: "{effects.glass-luminous.hoverTransform}"
    transition: "all {motion.duration.slow} {motion.easing.standard}"
    leadingIcon:
      size: "40px"
      rounded: "{rounded.full}"
      background: "rgba(59, 130, 246, 0.15)"
      iconColor: "{colors.primary}"
  card-featured:
    role: "Hero feed card — Featured dream on Repo screen, top of search."
    background: "{effects.glass-featured.background}"
    backdropFilter: "{effects.glass-featured.backdropFilter}"
    border: "{effects.glass-featured.border}"
    shadow: "{effects.glass-featured.shadow}"
    rounded: "{rounded.2xl}"
    padding: "{spacing.lg}"
    overlay: "{gradients.card-image-overlay}"
  card-dream:
    role: "Dream entry tile — image background with title, date, badges."
    aspectRatio: "16:11 (mobile gallery), 16:9 (feed hero)"
    rounded: "{rounded.xl}"
    overlay: "{gradients.card-image-overlay}"
    titleTypography: "{typography.title-lg}"
    titleColor: "{colors.on-surface-strong}"
    metaTypography: "{typography.label-md}"
    datePill:
      background: "transparent"
      border: "1px solid rgba(59, 130, 246, 0.40)"
      textColor: "{colors.primary}"
      rounded: "{rounded.full}"
      paddingX: "{spacing.md}"
      paddingY: "4px"
    badgeOverlay: "top-left, badge-lucid when applicable"
  card-stat:
    role: "Insight metric tile (Lucid Rate, Top Technique, Avg Lucidity)."
    background: "{effects.glass-standard.background}"
    border: "1px solid rgba(59, 130, 246, 0.10)"
    rounded: "{rounded.xl}"
    padding: "{spacing.md}"
    valueTypography: "{typography.headline-lg}"
    valueColor: "{colors.on-surface-strong}"
    labelTypography: "{typography.label-sm}"
    labelColor: "{colors.on-surface-variant}"

  input-default:
    role: "Text input — email, password, dream title, search."
    background: "rgba(255, 255, 255, 0.02)"
    textColor: "{colors.on-surface}"
    placeholderColor: "{colors.on-surface-variant}"
    border: "1px solid {colors.outline}"
    borderBottom: "1px solid {colors.outline}"
    rounded: "{rounded.md}"
    paddingX: "{spacing.md}"
    height: "48px"
    typography: "{typography.body-md}"
    focusBorder: "1px solid rgba(59, 130, 246, 0.50)"
    focusShadow: "{shadows.input-focus}"
    style-variant-auth: "Underline-only on Auth form (no enclosing border, only bottom rule)."
  input-search:
    leadingIcon: "magnifying-glass at left, 18px, on-surface-variant"
    background: "rgba(255, 255, 255, 0.04)"
    border: "1px solid {colors.outline}"
    rounded: "{rounded.full}"
    height: "44px"

  toggle-switch:
    role: "Remember me, privacy toggles."
    width: "44px"
    height: "24px"
    rounded: "{rounded.full}"
    activeBackground: "{colors.primary}"
    inactiveBackground: "{colors.muted}"
    knobColor: "{colors.on-surface-strong}"
    knobSize: "20px"

  tab-bar-bottom:
    role: "Mobile primary navigation — Home, Journal, Repo, Stats, Profile."
    height: "{spacing.tab-bar-height}"
    background: "{effects.glass-nav.background}"
    backdropFilter: "{effects.glass-nav.backdropFilter}"
    borderTop: "1px solid rgba(59, 130, 246, 0.10)"
    shadow: "{effects.glass-nav.shadow}"
    safeArea: "respects bottom inset"
    inactiveIconColor: "rgba(240, 241, 242, 0.50)"
    inactiveLabelColor: "{colors.on-surface-variant}"
    activeIconColor: "{colors.primary}"
    activeLabelColor: "{colors.primary}"
    activeIndicator: "subtle background tint rgba(59, 130, 246, 0.10) behind active item"
    iconSize: "22px"
    labelTypography: "{typography.label-sm}"

  tabs-segmented:
    role: "Sign In / Sign Up switcher; Dreams / Likes profile switcher."
    container:
      background: "rgba(13, 15, 18, 0.60)"
      border: "1px solid rgba(59, 130, 246, 0.20)"
      rounded: "{rounded.full}"
      padding: "4px"
    activeTab:
      background: "{gradients.aurora-cta}"
      textColor: "{colors.on-primary}"
      rounded: "{rounded.full}"
      shadow: "{shadows.glow-primary-soft}"
    inactiveTab:
      background: "transparent"
      textColor: "{colors.on-surface-variant}"

  tabs-underline:
    role: "Profile content switcher (Dreams | Likes)."
    activeTextColor: "{colors.on-surface-strong}"
    activeUnderline: "2px solid {colors.primary}"
    inactiveTextColor: "{colors.on-surface-variant}"

  avatar-circle:
    rounded: "{rounded.full}"
    border: "2px solid rgba(59, 130, 246, 0.40)"
    sizes:
      sm: "32px"
      md: "48px"
      lg: "96px"
    editIndicator:
      size: "32px"
      background: "{colors.primary}"
      iconColor: "{colors.on-primary}"
      rounded: "{rounded.full}"
      offset: "bottom-right, 4px overlap"

  profile-banner:
    role: "Cover image at top of profile."
    height: "200px"
    background: "{gradients.banner-aurora}"
    overlayAnimation: "{motion.named.aurora-shift} at 12s"
    imageBlendMode: "normal"
    editButton: "{components.button-icon}, top-right, 16px inset"

  social-icon-row:
    role: "X / Instagram / Web link row on profile."
    iconSize: "22px"
    spacing: "{spacing.md}"
    monochrome: "default state — on-surface-variant; on-brand color for Instagram (#e1306c-equivalent magenta) and X (white)."

  feed-row-horizontal:
    role: "Following Feed, Trending Stories — horizontal scroller."
    itemWidth: "180px"
    itemAspect: "1:1"
    gap: "{spacing.md}"
    headingPair: "icon + title left, 'See all' link right (primary color)."

  empty-state-card:
    role: "Pinned Technique placeholder, empty feed."
    background: "rgba(13, 15, 18, 0.60)"
    border: "1px dashed rgba(59, 130, 246, 0.20)"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
    textColor: "{colors.on-surface-variant}"
    textAlign: "center"

iconography:
  style: "stroke-based outlines, 1.5–2px stroke weight, rounded caps and joins, geometric and minimal"
  default-size: "20px"
  inline-size: "16px"
  hero-size: "24px–28px"
  default-color: "{colors.on-surface}"
  active-color: "{colors.primary}"
  decorative-color: "{colors.on-surface-variant}"
  symbol-avatars: "Cosmic / astronomical glyphs (planet, galaxy, shooting-star) used as default profile imagery in violet/lavender."

logo:
  mark: "Three interlocking circles forming a triquetra-style triskelion, in aurora-purple to violet gradient. Conveys 'lucid' (clarity), 'repo' (collection), and 'dream' (cycle)."
  mark-size: "32px (sidebar) — 64px (auth screen)"
  wordmark-style: "{typography.wordmark}"
  wordmark-color: "{colors.on-surface-strong}"
  lockup: "Mark on left, wordmark on right, 12px gap, vertically centered."

voice:
  tone: "Literary, mystical, tech-forward. Astronomical metaphors paired with modern app conventions."
  tagline: "Join thousands sharing their nightly adventures."
  motto: "Dreams are today's answers to tomorrow's questions."
  section-labels:
    - "Tonight in the Repo"
    - "Pinned Technique"
    - "Lucid Insights"
    - "Following Feed"
    - "From People You Follow"
    - "Trending Stories"
  microcopy:
    welcome: "Welcome back, {name}"
    record: "What did you dream last night?"
    dream-book: "Your personal dream gallery"
    pinned-empty: "Pin a technique from the Explore page to display it here."
---

## Overview

Lucid Repo is a dream journal and social repository for nightly adventures. Its visual identity — internally codenamed **Cosmic Aurora** — is dark-first by intent: deep navy surfaces let blue-to-violet aurora gradients, frosted glass cards, and a slowly drifting starfield breathe. The app is meant to feel like *staring at the night sky through a slightly fogged window* — luminous, contemplative, and quietly alive. Every page is built on the same cosmic background (a 3-stop dark navy linear gradient overlaid with three radial aurora glows and a low-density starfield), with content rising on layered glass cards. Action surfaces — primary CTAs, active filters, lucid-dream badges — burn with the brand's signature blue-violet glow. Editorial moments (the daily quote on the Journal screen, the mystic-gold "Lucid" tags on rare dreams) inject a literary, almost grimoire-like warmth into an otherwise tech-forward palette.

## Colors

The palette is anchored by a near-black navy (`#0d0f12`) and a single luminous brand color, **Aurora Purple** (`#3b82f6`). Brand pairs:

- **Primary — Aurora Purple `#3b82f6`** is the action color: CTAs, active tabs, ring focus, links, and the lucid badge. It also drives every signature glow.
- **Secondary — Electric Violet `#8b5cf6`** is the dream-state companion. It appears almost exclusively in gradients, never as a solo CTA fill, blending with primary to create the brand's "aurora" sweep.
- **Accent — Mystic Gold `#f5c244`** is reserved. It appears on celebratory moments — gold text gradients, the rare "premium technique" badge — and *never* on functional UI.
- **Tag palette** carries category-specific hues used in pill filters and dream classification: Lucid (blue), Adventure (green `#10b981`), Spiritual (amber `#f59e0b`), Water (cyan `#06b6d4`), Nightmare (red), Recurring (violet). Each tag color is used at full saturation for the label text on transparent pills, never as a card background.
- **Surface scale** ladders six steps from `#0a0c0f` to `#1d2129` to support nested cards without resorting to lighter grays. Surfaces *never* go above `#1d2129`; lift comes from glow, not luminance.
- **Foreground** is `#f0f1f2` (95% white). Muted text drops to `#9ba3ad` (~65%). Pure white is reserved for headings and CTA labels.
- **Destructive** (`#ef4444`) is used sparingly — only on the notification-count dot and the Delete action.

## Typography

The system pairs three families to express three voices:

- **Lato** is the workhorse sans — used for nearly all UI text, headings, labels, and the wordmark. It's friendly, neutral, highly legible at small sizes.
- **basis-grotesque-pro** is the body fallback (with system-sans cascade) for long-form reading: dream descriptions, comments, profile bios.
- **Playfair Display** (italic) carries the editorial soul of the app. The motto on the Journal screen — *"Dreams are today's answers to tomorrow's questions."* — uses Playfair italic at 28px/700 to feel hand-inscribed and literary. Use it for quotes, blockquotes, and ceremonial copy only.
- **EB Garamond** is a serif companion available for long-form prose (rare).
- **Fira Code** is the mono — only for technical metadata or copyable IDs.

The **wordmark** "LUCID REPO" is set in Lato Black at 28px, uppercase, with `0.04em` tracking. It appears next to the triquetra mark, never on its own, never lowercase.

Hierarchy collapses cleanly into three buckets: **display** (44/800 hero greetings), **headline** (32/700 page titles, "Welcome back,"), **body** (16/400 reading text), and **label** (12–14/600 metadata). Headings sit at 95% white; body at 95% white; muted captions at ~65%.

## Layout & Spacing

The app is mobile-first. A single 4px base unit scales through xs(4) / sm(8) / md(16) / lg(24) / xl(40) / 2xl(64). Page margin is **16px** on mobile, **24px** on tablet+. Section gaps run **32px**. Content is single-column on mobile, two-up on tablet, masonry 3–4 columns on desktop for the gallery and feed views.

Navigation lives at the bottom on mobile — a fixed 64px frosted-glass tab bar with five anchors (**Home · Journal · Repo · Stats · Profile**). The bar respects iOS safe-area insets. On desktop, the same five items move to a slim left rail with the wordmark at top.

Touch targets never drop below 44px. Cards have **20px internal padding** and `xl` (1.25rem) corner radii, separated by 16px gutters. Horizontal feed rails (Following Feed, Trending Stories) use 180px-wide square tiles with 16px gaps and momentum scroll.

## Elevation & Depth

Depth in this system is a **physics of light, not weight**. Surfaces don't get heavier as they rise — they get *more luminous*. Three glass tiers ladder upward:

- **Standard glass** (16px blur, 120% saturation, `rgba(96,165,250,0.15)` border) — default content cards.
- **Luminous glass** (20px blur, 130% saturation, brighter border at 20% opacity, faint primary glow halo) — primary entry cards (Record a Dream, Dream Book, Insights). On hover, border brightens to 30%, card lifts 2px, glow halo grows from 30px to 50px.
- **Featured glass** (24px blur, 140% saturation, 25% border, 60px aurora halo) — single-hero moments like the featured dream at the top of Repo.

In addition to glass, three discrete glow shadows are reserved for emphasis: `glow-primary` (40px blue), `glow-secondary` (30px violet), `glow-gold`. These appear as halos behind CTAs, around active tab-bar items, and pulsing under the "magic-glow" animation on important interactive surfaces.

Conventional drop-shadows (the `xs`–`2xl` ladder) exist for subtle separation of in-card elements (avatars, image overlays, share cards) but are deliberately gentle — opacities cap at 25%.

## Shapes

The shape language is **rounded throughout — never sharp**. The canonical radius is **`xl` (1.25rem / 20px)**, applied to cards, the Auth form container, the bottom nav, and most surfaces. Pills, badges, avatars, the toggle switch, and CTA buttons go to **`full`** (9999px). Inputs, segmented tabs, and small chips use **`md` (0.75rem)**. Hero featured cards may use **`2xl` (1.5rem)**.

Corners are reinforced visually by inset top-light highlights on glass cards (a 1px inset `rgba(96, 165, 250, 0.10)` border) — this gives every rounded edge a faint refraction line, as if light were catching the bevel.

## Motion

Motion follows a three-band rhythm:

- **Snap (100–150ms)** for tactile feedback — button-press scale-down to 0.98, instant tab switches.
- **Comfortable (300–500ms)** for hover lifts, page reveals, fade-in-ups, and segmented-tab sliders. The page-reveal animation (opacity + 20px slide + 0.98→1 scale) plays once on every route enter.
- **Ambient (3–8s, looping)** for breathing brand effects — `magic-glow` and `glow-pulse` on featured cards (3s), `aurora-shift` on the profile banner gradient (8–12s). The starfield drifts on a **40-second** loop, panning a few pixels in each direction; it's barely perceptible, more felt than seen.

The default easing is **`cubic-bezier(0.22, 1, 0.36, 1)`** — fast out, soft settle — used for any user-initiated transition. Decorative loops use `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (smooth in-out). On hover, cards lift between **-2px** (standard) and **-8px** (magic) with optional 1.01–1.02 scale.

A subtle **light-sweep** animation crosses left-to-right over featured cards on hover (600ms), simulating a flashlight beam catching the glass.

## Components

### Buttons

The **Luminous CTA** is the system's anchor: pill-shaped, full-width on mobile, white text on solid Aurora Purple at rest, transitioning to the aurora gradient (blue → indigo → violet) on hover. It carries a soft drop-shadow and ignites a 40px primary-color glow on hover. Press scales it to 0.98 for haptic-feeling feedback. Use it once per screen — for the most important action.

Outline buttons (1px primary-30% border, transparent fill, primary text) handle secondary actions like Edit, Private, and category filters. Ghost buttons strip the border and only fill on hover. Circular **icon buttons** (44px, dark glass with primary border, optional notification dot) sit in the top-right of pages for settings, messages, and notifications.

### Badges & Pills

The **Lucid badge** is a primary-filled pill with a small sparkle icon and white "Lucid" text — it appears top-left on dream cards to mark a lucid experience. **Filter pills** (category chips on Journal/Repo) sit in two states: inactive (transparent on a subtle outline, muted label) and active (solid primary fill, white label). When the pill represents a named category (Lucid, Adventure, Spiritual, Water), the active text or border picks up the matching tag color, giving the filter row a rainbow-of-blues feel.

### Cards

There are four card archetypes:

- **Glass card** — default container.
- **Luminous card** — lifts on hover with brighter halo. Used for Home-screen entry points: each has a circular 40px primary-tinted icon on the left, a bold title, a muted subtitle, and an outbound arrow on the right.
- **Featured card** — single-hero, biggest blur, biggest halo. Used for the Repo screen's featured dream.
- **Dream card** — image-led tile. The dream image fills the surface, a bottom-rising black gradient (85% → transparent over 50%) reveals the title in white at the lower-left, with a primary-bordered date pill underneath. A small Lucid badge floats top-left when applicable.

Stat cards (Lucid Rate / Top Technique / Avg Lucidity) are minimal: a faint glass background, a 1px primary-10% border, a large 32px white value, and a 12px muted label.

### Inputs

The default text input uses a hairline outline border, dark transparent fill, and 16px placeholder text in muted color. On focus, the border brightens to primary-50% and a 20px primary glow blooms beneath. On the Auth screen, a stripped-down variant shows only an underline (no enclosing border), letting the form feel airy against the cosmic backdrop. Search inputs are full-pill with a leading magnifying-glass icon.

### Navigation

The **bottom tab bar** is the brand's hallmark: a 64px frosted-glass strip, 24px backdrop blur, with a 1px primary-tinted top border and a faint inset highlight along its top edge. Five tabs spread evenly. Inactive icons are 50% white; the active tab tints both icon and label primary, with a soft primary-10% rounded background behind it. Notification dots stack on top-right of icons. The bar respects safe-area insets and never lets the cosmic background show beneath.

The **segmented tabs** component (Sign In / Sign Up, Dreams / Likes) is a pill container with a sliding active pill that uses the aurora gradient.

### Profile banner

The profile cover spans full width, ~200px tall. It uses a multi-stop aurora gradient (40% → 20% opacity blues and violets) overlaid with three circular radial glows (purple, lavender, gold) animating on a 12-second `aurora-shift`. Profile imagery sits over this banner, never replacing it. The avatar is a 96px circle with a 2px primary-tinted ring and a 32px primary edit-pip overlapping its bottom-right.

### Iconography

All icons follow a stroke-based, 1.5–2px, rounded-cap style — geometric, minimal, never filled. Default size 20px. Default color matches surrounding text; primary color when active. A secondary set of cosmic *symbol avatars* (planet, galaxy, shooting-star, comet) substitute for unset profile pictures, rendered in violet on dark.

### Logo

The mark is a triquetra of three interlocking circles, set in the aurora gradient. Paired with the wordmark "LUCID REPO" (Lato Black, uppercase, tight tracking), it becomes the lockup used on the Auth screen at 64px and in navigation at 32px.

## Voice & Brand

Copy leans **literary-mystical-tech**. Section labels carry slight mysticism ("Tonight in the Repo", "Pinned Technique", "Lucid Insights") while interactions use plain, friendly verbs ("Record Dream", "Edit", "See all"). The tagline — *"Join thousands sharing their nightly adventures."* — frames the app as a community campfire under the stars.

The motto on the Journal screen, set in Playfair italic, is the brand's emotional anchor: *"Dreams are today's answers to tomorrow's questions."* It establishes that this is not a productivity tool — it's a place for reverence and reflection.

## Do's and Don'ts

**Do:**
- Lean into glow and blur to express elevation; let the navy backdrop do the heavy lifting for contrast.
- Keep all CTAs pill-shaped, primary-filled, and singular per screen.
- Use the aurora gradient for transitions, sliders, hovers — anywhere the eye should travel.
- Animate ambient effects gently and *always* (the starfield, the breathing glow on featured cards) — the app should feel alive at rest.
- Reserve gold for celebration; reserve red for danger.
- Honor iOS safe-area insets at every fixed-position surface.

**Don't:**
- Introduce pure-white surfaces or light-mode mid-grays on dark mode — they break the cosmic illusion.
- Use sharp 90° corners. The system has no place for them.
- Stack more than three gradients on a single surface — the result becomes muddy.
- Animate active interactions slower than 500ms or faster than 100ms — responsiveness lives in the 150–400ms band.
- Use neon-saturated reds, greens, or oranges as primary fills. The palette is cool and cosmic; warm hues only appear as gold accents or category tags.
- Replace the wordmark with a lowercase or non-Lato setting — the brand is always uppercase, always bold, always tight-tracked.
- Let the bottom tab bar lose its frosted-glass blur, even briefly. The transparency *is* the navigation.
