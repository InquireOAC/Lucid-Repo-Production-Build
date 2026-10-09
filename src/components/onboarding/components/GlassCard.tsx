import { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
}

const GlassCard = ({ children, className = "", hover = true, style }: GlassCardProps) => (
  <div
    style={style}
    className={cn(
      "relative rounded-xl md:rounded-2xl p-4 md:p-5 transition-all duration-500",
      "bg-white/[0.035] backdrop-blur-xl border border-white/[0.08]",
      "shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.05)]",
      hover && "hover:bg-white/[0.06] hover:border-white/[0.14] hover:-translate-y-0.5",
      className
    )}
  >
    <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
    <div className="relative z-10">{children}</div>
  </div>
);

export default GlassCard;