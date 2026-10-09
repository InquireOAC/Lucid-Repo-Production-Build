import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Eye,
  MousePointerClick,
  X as XIcon,
  UserPlus,
  Trophy,
  Megaphone,
  CalendarDays,
  ArrowUpDown,
} from "lucide-react";
import type { EngagementEntityType } from "@/hooks/useEngagement";

interface AnalyticsRow {
  type: EngagementEntityType;
  id: string;
  title: string;
  created_at: string;
  status: string;
  views: number;
  unique_views: number;
  clicks: number;
  dismissals: number;
  rsvps: number;
  entries: number;
  ctr: number;
  dismiss_rate: number;
}

const TYPE_FILTERS = ["all", "announcement", "event", "challenge"] as const;
type TypeFilter = (typeof TYPE_FILTERS)[number];

const DATE_RANGES = ["7d", "30d", "all"] as const;
type DateRange = (typeof DATE_RANGES)[number];

type SortKey = "views" | "clicks" | "ctr" | "created_at";

const TypeIcon: React.FC<{ type: EngagementEntityType }> = ({ type }) => {
  if (type === "announcement") return <Megaphone className="h-3.5 w-3.5 text-blue-400" />;
  if (type === "event") return <CalendarDays className="h-3.5 w-3.5 text-violet-400" />;
  return <Trophy className="h-3.5 w-3.5 text-amber-400" />;
};

const fmtPct = (v: number) => `${Math.round(v * 100)}%`;

const EngagementAnalytics: React.FC = () => {
  const [rows, setRows] = useState<AnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "views", dir: "desc" });

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const [annResp, evResp, chResp] = await Promise.all([
        supabase
          .from("platform_announcements")
          .select("id, title, created_at, status, is_active")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("community_events")
          .select("id, title, created_at, status")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("community_challenges")
          .select("id, title, created_at, status")
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      const items: { type: EngagementEntityType; id: string; title: string; created_at: string; status: string }[] = [];
      (annResp.data || []).forEach((a: any) =>
        items.push({
          type: "announcement",
          id: a.id,
          title: a.title,
          created_at: a.created_at,
          status: a.status || (a.is_active ? "published" : "archived"),
        }),
      );
      (evResp.data || []).forEach((e: any) =>
        items.push({ type: "event", id: e.id, title: e.title, created_at: e.created_at, status: e.status }),
      );
      (chResp.data || []).forEach((c: any) =>
        items.push({ type: "challenge", id: c.id, title: c.title, created_at: c.created_at, status: c.status }),
      );

      const statsResults = await Promise.all(
        items.map((it) =>
          supabase.rpc("get_engagement_stats", { p_entity_type: it.type, p_entity_id: it.id }),
        ),
      );

      const built: AnalyticsRow[] = items.map((it, i) => {
        const row = (statsResults[i].data || [])[0] as Record<string, number | string> | undefined;
        return {
          ...it,
          views: Number(row?.views) || 0,
          unique_views: Number(row?.unique_views) || 0,
          clicks: Number(row?.clicks) || 0,
          dismissals: Number(row?.dismissals) || 0,
          rsvps: Number(row?.rsvps) || 0,
          entries: Number(row?.entries) || 0,
          ctr: Number(row?.ctr) || 0,
          dismiss_rate: Number(row?.dismiss_rate) || 0,
        };
      });

      setRows(built);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = rows;
    if (typeFilter !== "all") result = result.filter((r) => r.type === typeFilter);
    if (dateRange !== "all") {
      const days = dateRange === "7d" ? 7 : 30;
      const cutoff = Date.now() - days * 86400000;
      result = result.filter((r) => new Date(r.created_at).getTime() >= cutoff);
    }
    const sorted = [...result].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const an = typeof av === "string" ? new Date(av).getTime() : Number(av);
      const bn = typeof bv === "string" ? new Date(bv).getTime() : Number(bv);
      return sort.dir === "asc" ? an - bn : bn - an;
    });
    return sorted;
  }, [rows, typeFilter, dateRange, sort]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, r) => ({
        items: acc.items + 1,
        views: acc.views + r.views,
        clicks: acc.clicks + r.clicks,
        dismissals: acc.dismissals + r.dismissals,
        rsvps: acc.rsvps + r.rsvps,
        entries: acc.entries + r.entries,
      }),
      { items: 0, views: 0, clicks: 0, dismissals: 0, rsvps: 0, entries: 0 },
    );
  }, [filtered]);

  const headerSort = (key: SortKey) => (
    <button
      type="button"
      onClick={() =>
        setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }))
      }
      className="flex items-center gap-0.5 hover:text-foreground"
    >
      <ArrowUpDown className="h-2.5 w-2.5" />
    </button>
  );

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] capitalize border transition-colors ${
                typeFilter === t
                  ? "bg-foreground text-background border-foreground font-semibold"
                  : "bg-transparent text-foreground/70 border-border/40 hover:bg-muted/30"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          {DATE_RANGES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDateRange(d)}
              className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] capitalize border transition-colors ${
                dateRange === d
                  ? "bg-primary text-primary-foreground border-primary font-semibold"
                  : "bg-transparent text-foreground/70 border-border/40 hover:bg-muted/30"
              }`}
            >
              {d === "all" ? "All time" : `Last ${d}`}
            </button>
          ))}
        </div>
      </div>

      {/* Totals card */}
      <Card variant="compact">
        <CardContent className="p-3 grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Items</p>
            <p className="text-base font-semibold">{totals.items}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Views</p>
            <p className="text-base font-semibold">{totals.views}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Clicks</p>
            <p className="text-base font-semibold">{totals.clicks}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Dismiss</p>
            <p className="text-base font-semibold">{totals.dismissals}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">RSVPs</p>
            <p className="text-base font-semibold">{totals.rsvps}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Entries</p>
            <p className="text-base font-semibold">{totals.entries}</p>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">No items to show.</p>
      ) : (
        <Card variant="compact">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-border/40">
                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="text-left px-3 py-2 font-medium">Item</th>
                    <th className="text-right px-2 py-2 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3 w-3" /> Views {headerSort("views")}
                      </span>
                    </th>
                    <th className="text-right px-2 py-2 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <MousePointerClick className="h-3 w-3" /> Clicks {headerSort("clicks")}
                      </span>
                    </th>
                    <th className="text-right px-2 py-2 font-medium">CTR {headerSort("ctr")}</th>
                    <th className="text-right px-2 py-2 font-medium">
                      <XIcon className="h-3 w-3 inline" />
                    </th>
                    <th className="text-right px-2 py-2 font-medium">
                      <UserPlus className="h-3 w-3 inline" />
                    </th>
                    <th className="text-right px-2 py-2 font-medium">
                      <Trophy className="h-3 w-3 inline" />
                    </th>
                    <th className="text-right px-3 py-2 font-medium">Created {headerSort("created_at")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={`${r.type}:${r.id}`} className="border-b border-border/20 last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-2 max-w-[240px]">
                        <div className="flex items-center gap-2 min-w-0">
                          <TypeIcon type={r.type} />
                          <span className="truncate font-medium">{r.title}</span>
                          <Badge variant="outline" className="text-[9px] capitalize shrink-0">
                            {r.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="text-right px-2 py-2 font-semibold">{r.views}</td>
                      <td className="text-right px-2 py-2">{r.clicks}</td>
                      <td className="text-right px-2 py-2 text-muted-foreground">
                        {r.views > 0 ? fmtPct(r.ctr) : "—"}
                      </td>
                      <td className="text-right px-2 py-2 text-muted-foreground">{r.dismissals}</td>
                      <td className="text-right px-2 py-2 text-muted-foreground">{r.rsvps}</td>
                      <td className="text-right px-2 py-2 text-muted-foreground">{r.entries}</td>
                      <td className="text-right px-3 py-2 text-muted-foreground whitespace-nowrap">
                        {format(new Date(r.created_at), "MMM d")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EngagementAnalytics;
