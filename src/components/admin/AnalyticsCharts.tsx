import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useAdminAnalytics, DataPoint } from "@/hooks/useAdminAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, Users, ImageIcon, Video, Globe, CreditCard } from "lucide-react";
import { format, parseISO } from "date-fns";

const RANGE_OPTIONS = [
  { label: "7d", value: 7 },
  { label: "14d", value: 14 },
  { label: "30d", value: 30 },
] as const;

interface ChartCardProps {
  title: string;
  data: DataPoint[];
  color: string;
  type?: "area" | "bar";
  total?: number;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, data, color, type = "area", total }) => {
  const displayTotal = total ?? data.reduce((sum, d) => sum + d.value, 0);
  const chartConfig = { value: { label: title, color } };

  return (
    <Card variant="glass">
      <CardHeader className="p-3 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <span className="text-lg font-bold">{displayTotal.toLocaleString()}</span>
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <ChartContainer config={chartConfig} className="h-[140px] w-full aspect-auto">
          {type === "area" ? (
            <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => format(parseISO(v), "M/d")}
                tick={{ fontSize: 10 }}
                className="text-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <ChartTooltip
                content={<ChartTooltipContent labelFormatter={(v) => format(parseISO(v as string), "MMM d, yyyy")} />}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#grad-${title.replace(/\s/g, '')})`}
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => format(parseISO(v), "M/d")}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <ChartTooltip
                content={<ChartTooltipContent labelFormatter={(v) => format(parseISO(v as string), "MMM d, yyyy")} />}
              />
              <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} />
            </BarChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const AnalyticsCharts: React.FC = () => {
  const [rangeDays, setRangeDays] = useState<number>(30);
  const analytics = useAdminAnalytics(rangeDays);

  return (
    <div className="space-y-3 mt-4">
      {/* Range Selector */}
      <div className="flex items-center gap-1.5">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setRangeDays(opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              rangeDays === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-2">
        <Card variant="glass" className="border-primary/20">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 ring-1 ring-green-500/10">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <div>
              {analytics.isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-xl font-bold">${analytics.mrr}</p>
              )}
              <p className="text-[10px] text-muted-foreground">Current MRR</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass" className="border-primary/20">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 ring-1 ring-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              {analytics.isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-xl font-bold">{analytics.retention}%</p>
              )}
              <p className="text-[10px] text-muted-foreground">User Retention</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {analytics.isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card variant="glass" key={i}>
              <CardContent className="p-3">
                <Skeleton className="h-[160px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <ChartCard title="New Users" data={analytics.newUsers} color="hsl(var(--primary))" />
          <ChartCard title="Subscriptions" data={analytics.newSubscriptions} color="hsl(262, 83%, 58%)" type="bar" />
          <ChartCard title="Monthly Active Users" data={[]} color="hsl(200, 95%, 50%)" total={analytics.monthlyActiveUsers} />
          <ChartCard title="Image Generations" data={analytics.imageGenerations} color="hsl(330, 80%, 60%)" />
          <ChartCard title="Video Generations" data={analytics.videoGenerations} color="hsl(25, 95%, 55%)" />
          <ChartCard title="Public Dreams" data={analytics.publicDreams} color="hsl(160, 70%, 45%)" />
        </div>
      )}
    </div>
  );
};

export default AnalyticsCharts;
