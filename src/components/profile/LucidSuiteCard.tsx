import React from "react";
import { ExternalLink, Film, Moon } from "lucide-react";

/**
 * Cross-product ecosystem card: positions Lucid Repo alongside
 * Lucid Engine as part of the Lucid Studios suite.
 * Visual language mirrors Lucid Engine's glass + ink tokens.
 */
const LucidSuiteCard: React.FC = () => {
  return (
    <div className="rounded-2xl border border-glass bg-glass-strong p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-faint">
          Lucid · Studios
        </span>
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-faint">
          The Suite
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3 rounded-xl border border-glass bg-glass px-3 py-2.5">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-primary/15 text-primary">
            <Moon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground leading-tight">Lucid Repo</div>
            <div className="text-xs text-ink-soft leading-tight">Where dreams are kept.</div>
          </div>
          <span className="font-mono text-[10px] tracking-wider uppercase text-ink-faint">You are here</span>
        </div>

        <a
          href="https://lucidengine.app"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-xl border border-glass bg-glass px-3 py-2.5 transition-colors hover:bg-glass-strong"
        >
          <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-primary/15 text-primary">
            <Film className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground leading-tight">Lucid Engine</div>
            <div className="text-xs text-ink-soft leading-tight">Your personal production studio.</div>
          </div>
          <ExternalLink className="h-4 w-4 text-ink-faint transition-colors group-hover:text-foreground" />
        </a>
      </div>
    </div>
  );
};

export default LucidSuiteCard;