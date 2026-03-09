import React from "react";
import { motion } from "framer-motion";
import { staggerItemVariants } from "@/components/ui/StaggerContainer";
import type { DreamMatch } from "@/hooks/useDreamConnections";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

const MatchPercentRing: React.FC<{ pct: number }> = ({ pct }) => {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 80 ? "stroke-amber-400" : pct >= 60 ? "stroke-primary" : "stroke-primary";

  return (
    <svg width="48" height="48" className="shrink-0">
      <circle cx="24" cy="24" r={r} fill="none" strokeWidth="3" className="stroke-muted/20" />
      <circle
        cx="24" cy="24" r={r} fill="none" strokeWidth="3"
        className={color}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
      />
      <text x="24" y="28" textAnchor="middle" className="fill-foreground text-[11px] font-bold">{pct}%</text>
    </svg>
  );
};

const DreamMatchCard: React.FC<{ match: DreamMatch }> = ({ match }) => {
  const img1 = match.dream1?.image_url || match.dream1?.generatedImage;
  const img2 = match.dream2?.image_url || match.dream2?.generatedImage;
  const otherName = match.dream2?.profiles?.display_name || match.dream2?.profiles?.username || "Dreamer";

  return (
    <motion.div
      variants={staggerItemVariants}
      className="rounded-xl border border-purple-500/20 bg-card/80 p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-purple-300">
          ✨ Dream Match — {formatDistanceToNow(new Date(match.created_at), { addSuffix: true })}
        </p>
        <MatchPercentRing pct={match.match_percentage} />
      </div>

      <div className="grid grid-cols-2 gap-2 relative">
        <DreamPreview image={img1} title={match.dream1?.title || "Your Dream"} label="You" labelColor="text-emerald-400" />
        <DreamPreview image={img2} title={match.dream2?.title || "Their Dream"} label={otherName} labelColor="text-blue-400" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg z-10">🔮</span>
      </div>

      {match.shared_elements.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {match.shared_elements.map((el) => (
            <Badge key={el} variant="default" className="text-[10px] bg-purple-500/20 text-purple-300 border-0">{el}</Badge>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const DreamPreview = ({ image, title, label, labelColor }: { image?: string | null; title: string; label: string; labelColor: string }) => (
  <div className="relative rounded-lg overflow-hidden aspect-[4/3]">
    {image ? (
      <img src={image} alt={title} className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
    )}
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
      <p className={`text-[10px] font-semibold ${labelColor}`}>{label}</p>
      <p className="text-[11px] text-white font-medium line-clamp-1">{title}</p>
    </div>
  </div>
);

export default DreamMatchCard;
