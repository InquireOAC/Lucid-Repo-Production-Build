import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, Pin, PinOff, Sparkles, Check } from "lucide-react";
import { techniques } from "./techniqueData";
import { usePinnedTechniques } from "@/hooks/usePinnedTechniques";

import realityChecksImg from "@/assets/techniques/reality-checks.jpg";
import mildImg from "@/assets/techniques/mild.jpg";
import wbtbImg from "@/assets/techniques/wbtb.jpg";
import wildImg from "@/assets/techniques/wild.jpg";
import ssildImg from "@/assets/techniques/ssild.jpg";
import fildImg from "@/assets/techniques/fild.jpg";
import deildImg from "@/assets/techniques/deild.jpg";
import meditationImg from "@/assets/techniques/meditation.jpg";

const TECHNIQUE_IMAGES: Record<number, string> = {
  0: realityChecksImg,
  1: mildImg,
  2: wbtbImg,
  3: wildImg,
  4: ssildImg,
  5: fildImg,
  6: deildImg,
  7: meditationImg,
};

const MeterBar: React.FC<{ label: string; value: number; max?: number }> = ({
  label,
  value,
  max = 3,
}) => (
  <div className="flex flex-col gap-2 flex-1">
    <div className="flex items-center justify-between">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
        {label}
      </span>
      <span className="font-mono text-[10px] text-ink-soft">
        {value}/{max}
      </span>
    </div>
    <div className="h-1 rounded-full bg-foreground/10 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="h-full bg-gradient-to-r from-primary to-primary/60"
      />
    </div>
  </div>
);

const TechniqueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const index = Number(id);
  const technique = techniques[index];
  const { isPinned, pinTechnique, unpinTechnique } = usePinnedTechniques();
  const pinned = !isNaN(index) && isPinned(index);
  const headerImage = TECHNIQUE_IMAGES[index];
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, 80]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.08]);
  const heroOpacity = useTransform(scrollY, [0, 200, 300], [1, 0.6, 0.3]);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowStickyBar(window.scrollY > 180);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!technique) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-soft">Technique not found</p>
      </div>
    );
  }

  const paragraphs = technique.longDescription.split("\n\n");

  return (
    <div className="min-h-screen pb-32 bg-background">
      {/* Sticky translucent nav (appears on scroll) */}
      <motion.div
        initial={false}
        animate={{ opacity: showStickyBar ? 1 : 0, y: showStickyBar ? 0 : -8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-40 pt-safe-top backdrop-blur-xl bg-background/75 border-b border-glass ${
          showStickyBar ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-ink-soft hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <span className="text-sm font-medium text-foreground truncate max-w-[60%]">
            {technique.name}
          </span>
          <button
            onClick={() => (pinned ? unpinTechnique(index) : pinTechnique(index))}
            className={`p-1.5 rounded-full transition-colors ${
              pinned ? "text-primary" : "text-ink-soft hover:text-foreground"
            }`}
          >
            {pinned ? <PinOff size={18} /> : <Pin size={18} />}
          </button>
        </div>
      </motion.div>

      {/* Hero */}
      <div ref={heroRef} className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        {headerImage ? (
          <motion.img
            src={headerImage}
            alt={technique.name}
            style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <motion.div
            style={{ y: heroY, scale: heroScale }}
            className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-background flex items-center justify-center"
          >
            <span className="text-[160px] leading-none opacity-70">{technique.icon}</span>
          </motion.div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-transparent" />

        {/* Overlaid top nav */}
        <div className="absolute top-0 left-0 right-0 pt-safe-top z-10">
          <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-md border border-glass text-foreground hover:bg-background/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-medium">Back</span>
            </button>
            <button
              onClick={() => (pinned ? unpinTechnique(index) : pinTechnique(index))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border transition-colors ${
                pinned
                  ? "bg-primary/20 border-primary/30 text-primary"
                  : "bg-background/60 border-glass text-foreground hover:bg-background/80"
              }`}
            >
              {pinned ? <PinOff size={14} /> : <Pin size={14} />}
              <span className="text-xs font-medium">{pinned ? "Pinned" : "Pin"}</span>
            </button>
          </div>
        </div>

        {/* Title overlay */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="absolute bottom-0 left-0 right-0 px-6 pb-10 max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] px-2.5 py-1 rounded-md bg-glass border border-glass text-ink-soft">
              {technique.difficulty}
            </span>
            {technique.acronym && (
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] px-2.5 py-1 rounded-md bg-primary/15 border border-primary/25 text-primary">
                {technique.acronym}
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-medium text-foreground tracking-tight leading-[1.1]">
            {technique.name}
          </h1>
          <p className="text-sm text-ink-soft mt-3 max-w-prose leading-relaxed">
            {technique.shortDescription}
          </p>
        </motion.div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 -mt-2 space-y-10">
        {/* Stats panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="rounded-2xl bg-glass border border-glass backdrop-blur-xl p-5 flex gap-6"
        >
          <MeterBar label="Difficulty" value={technique.difficultyRating} />
          <div className="w-px bg-foreground/10" />
          <MeterBar label="Effectiveness" value={technique.effectiveness} />
        </motion.div>

        {/* Overview */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">
              Overview
            </span>
          </div>
          <div className="space-y-4 max-w-prose">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-[15px] text-ink leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </motion.section>

        {/* Step timeline */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">
              Step-by-Step Guide
            </span>
            <div className="flex-1 h-px bg-foreground/10" />
            <span className="font-mono text-[10px] text-ink-faint">
              {String(technique.steps.length).padStart(2, "0")} steps
            </span>
          </div>

          <ol className="relative">
            {/* Connecting line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

            {technique.steps.map((step, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.05 }}
                className="relative flex gap-5 pb-6 last:pb-0"
              >
                <div className="relative shrink-0 z-10">
                  <div className="w-8 h-8 rounded-full bg-background border border-primary/40 flex items-center justify-center shadow-[0_0_0_4px_hsl(var(--background))]">
                    <span className="font-mono text-[11px] font-medium text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
                <div className="flex-1 pt-1 pb-1">
                  <p className="text-[15px] text-ink leading-relaxed">{step}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </section>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-2xl bg-glass-strong border border-glass backdrop-blur-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h3 className="text-base font-medium text-foreground">
              {pinned ? "You're practicing this technique" : "Try this technique tonight"}
            </h3>
            <p className="text-xs text-ink-soft mt-1">
              Pin it to your home screen for a daily reminder.
            </p>
          </div>
          <button
            onClick={() => (pinned ? unpinTechnique(index) : pinTechnique(index))}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all ${
              pinned
                ? "bg-glass border border-glass text-ink hover:bg-glass-strong"
                : "bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_30px_hsl(var(--primary)/0.35)]"
            }`}
          >
            {pinned ? <Check className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            {pinned ? "Pinned" : "Pin technique"}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default TechniqueDetailPage;
