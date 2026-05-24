import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { Megaphone, Trophy, CalendarDays, X, ChevronRight, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useChallenges } from "@/hooks/useChallenges";
import { useEvents } from "@/hooks/useEvents";
import { useEngagement } from "@/hooks/useEngagement";
import { cn } from "@/lib/utils";

type BroadcastKind = "announcement" | "event" | "challenge";

interface BroadcastRow {
  kind: BroadcastKind;
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  link_url?: string | null;
  cta_label?: string | null;
  image_url?: string | null;
  meta?: string;
}

const KIND_STYLES: Record<BroadcastKind, { icon: React.ElementType; pill: string; iconBg: string }> = {
  announcement: {
    icon: Megaphone,
    pill: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    iconBg: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  },
  event: {
    icon: CalendarDays,
    pill: "bg-violet-500/15 text-violet-300 border-violet-500/25",
    iconBg: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  },
  challenge: {
    icon: Trophy,
    pill: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    iconBg: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  },
};

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const BroadcastsSection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { recordEngagement } = useEngagement();
  const { announcements } = useAnnouncements();
  const { challenges } = useChallenges();
  const { events } = useEvents();
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(new Set());

  // Load this user's dismissals once
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("broadcast_dismissals")
        .select("entity_type, entity_id")
        .eq("user_id", user.id);
      if (cancelled || !data) return;
      const keys = new Set<string>(data.map((d: any) => `${d.entity_type}:${d.entity_id}`));
      setDismissedKeys(keys);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const rows: BroadcastRow[] = useMemo(() => {
    const now = Date.now();
    const out: BroadcastRow[] = [];

    for (const a of announcements) {
      if (a.notify_users === false) continue;
      if (now - new Date(a.created_at).getTime() > MAX_AGE_MS) continue;
      out.push({
        kind: "announcement",
        id: a.id,
        title: a.title,
        content: a.content,
        created_at: a.created_at,
        link_url: a.link_url,
        cta_label: a.cta_label,
        image_url: a.image_url,
      });
    }

    for (const e of events) {
      if (e.notify_users === false) continue;
      if (now - new Date(e.created_at).getTime() > MAX_AGE_MS) continue;
      let meta = "";
      try {
        meta = `${format(new Date(e.starts_at), "MMM d, h:mm a")}${e.location ? ` · ${e.location}` : ""}`;
      } catch { /* noop */ }
      out.push({
        kind: "event",
        id: e.id,
        title: e.title,
        content: e.description,
        created_at: e.created_at,
        link_url: e.link_url,
        cta_label: e.cta_label,
        image_url: e.banner_image_url,
        meta,
      });
    }

    for (const c of challenges) {
      if (c.status !== "active") continue;
      if (c.notify_users === false) continue;
      if (now - new Date(c.created_at).getTime() > MAX_AGE_MS) continue;
      let meta = c.required_tag || "";
      try {
        meta = `${meta} · ${format(new Date(c.start_date), "MMM d")} – ${format(new Date(c.end_date), "MMM d")}`;
      } catch { /* noop */ }
      out.push({
        kind: "challenge",
        id: c.id,
        title: c.title,
        content: c.description,
        created_at: c.created_at,
        cta_label: c.cta_label,
        image_url: c.banner_image_url,
        meta,
      });
    }

    // Sort: newest first
    out.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    // Strip dismissed
    return out.filter((r) => !dismissedKeys.has(`${r.kind}:${r.id}`));
  }, [announcements, events, challenges, dismissedKeys]);

  // Record view engagement on render for visible rows
  useEffect(() => {
    rows.forEach((r) => recordEngagement(r.kind, r.id, "view"));
  }, [rows, recordEngagement]);

  if (rows.length === 0) return null;

  const handleDismiss = async (row: BroadcastRow) => {
    setDismissedKeys((prev) => new Set(prev).add(`${row.kind}:${row.id}`));
    recordEngagement(row.kind, row.id, "dismiss");
    if (user) {
      await supabase.from("broadcast_dismissals").upsert(
        { user_id: user.id, entity_type: row.kind, entity_id: row.id },
        { onConflict: "user_id,entity_type,entity_id" },
      );
    }
  };

  const handleAction = (row: BroadcastRow) => {
    recordEngagement(row.kind, row.id, "click");
    if (row.link_url) {
      window.open(row.link_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Broadcasts
      </h2>
      <div className="space-y-2">
        {rows.map((r) => {
          const style = KIND_STYLES[r.kind];
          const Icon = style.icon;
          const ago = (() => {
            try { return formatDistanceToNow(new Date(r.created_at), { addSuffix: true }); }
            catch { return ""; }
          })();
          return (
            <div
              key={`${r.kind}:${r.id}`}
              className="relative rounded-xl bg-card border border-border/40 overflow-hidden hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-3 p-3">
                {r.image_url ? (
                  <img
                    src={r.image_url}
                    alt=""
                    className="w-12 h-12 rounded-md object-cover shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={cn(
                      "w-10 h-10 rounded-md flex items-center justify-center shrink-0 border",
                      style.iconBg,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={cn("text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border", style.pill)}>
                      {r.kind}
                    </span>
                    {ago && <span className="text-[10px] text-muted-foreground">{ago}</span>}
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-snug">
                    {r.title}
                  </p>
                  {r.content && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{r.content}</p>
                  )}
                  {r.meta && (
                    <p className="text-[10px] text-muted-foreground/80 mt-1">{r.meta}</p>
                  )}
                  {(r.link_url || r.cta_label) && (
                    <button
                      type="button"
                      onClick={() => handleAction(r)}
                      className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-primary hover:text-primary/80"
                    >
                      {r.cta_label || "Learn more"}
                      {r.link_url ? <ExternalLink className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDismiss(r)}
                  className="p-1.5 rounded-full hover:bg-muted/50 shrink-0"
                  aria-label="Dismiss broadcast"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BroadcastsSection;
