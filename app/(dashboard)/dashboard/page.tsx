"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "@/data/analytics";
import { getCampaigns } from "@/data/campaigns";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import {
  Send,
  CheckCircle2,
  Eye,
  MessageCircleReply,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Download,
  RefreshCw,
  Calendar,
  Zap,
  MessageSquare,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  Globe,
  Loader2,
  Activity,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";

// ─── Date range options ────────────────────────────────────────────────────
const DATE_RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
function pct(v: number) {
  return `${v.toFixed(1)}%`;
}

function sparkBar(value: number, max: number, color: string) {
  const w = Math.max(4, (value / max) * 100);
  return (
    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
      <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${w}%` }} />
    </div>
  );
}

// Minimal SVG bar chart — no external lib needed
function BarMiniChart({ data }: { data: { date: string; sent: number; delivered: number; read: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.sent));
  return (
    <div className="flex items-end gap-[3px] h-[80px] w-full">
      {data.map((d, i) => {
        const sh = Math.round((d.sent / maxVal) * 80) || 0;
        const dh = Math.round((d.delivered / maxVal) * 80) || 0;
        const rh = Math.round((d.read / maxVal) * 80) || 0;
        return (
          <div key={i} className="flex items-end gap-[1px] flex-1 group relative">
            <div className="flex-1 bg-primary/20 rounded-sm" style={{ height: sh }} title={`Sent: ${formatNumber(d.sent)}`} />
            <div className="flex-1 bg-primary/50 rounded-sm" style={{ height: dh }} title={`Delivered: ${formatNumber(d.delivered)}`} />
            <div className="flex-1 bg-primary rounded-sm" style={{ height: rh }} title={`Read: ${formatNumber(d.read)}`} />
          </div>
        );
      })}
    </div>
  );
}

// Donut chart using SVG
function DonutChart({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  let offset = 0;
  const r = 40;
  const cx = 56;
  const cy = 56;
  const circ = 2 * Math.PI * r;

  return (
    <svg viewBox="0 0 112 112" className="w-28 h-28">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--muted)" strokeWidth={14} />
      {slices.map((s, i) => {
        const dash = (s.value / total) * circ;
        const gap = circ - dash;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={14}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
            style={{ transition: "all 0.4s ease" }}
          />
        );
        offset += dash;
        return el;
      })}
      {/* Centre label */}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="fill-foreground" fontSize="11" fontWeight="600">
        {total}%
      </text>
    </svg>
  );
}

const DONUT_COLORS = ["#7c3aed", "#3b82f6", "#f97316", "#10b981"];

// ─── Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [range, setRange] = useState(30);

  const { data: analytics, isLoading: loadingAnalytics, refetch } = useQuery({
    queryKey: ["analytics", range],
    queryFn: () => getAnalytics(),
  });

  // Slice daily volume to selected range
  const volumeData = useMemo(() => {
    const raw = analytics?.dailyVolume ?? [];
    const slice = raw.slice(-range);
    // Group into ~10 bars
    const groupSize = Math.max(1, Math.floor(slice.length / 10));
    const groups: typeof slice = [];
    for (let i = 0; i < slice.length; i += groupSize) {
      const chunk = slice.slice(i, i + groupSize);
      groups.push({
        date: chunk[0].date,
        sent: chunk.reduce((s, x) => s + x.sent, 0),
        delivered: chunk.reduce((s, x) => s + x.delivered, 0),
        read: chunk.reduce((s, x) => s + x.read, 0),
        failed: chunk.reduce((s, x) => s + x.failed, 0),
      });
    }
    return groups;
  }, [analytics, range]);

  const isLoading = loadingAnalytics;

  const m = analytics?.metrics;

  const KPI_CARDS = [
    {
      label: "Total Sent",
      value: m ? formatNumber(m.totalSent) : "—",
      icon: <Send className="w-4 h-4" />,
      color: "text-primary bg-primary/10",
      trend: "+12.4%",
      up: true,
    },
    {
      label: "Delivery Rate",
      value: m ? pct(m.deliveryRate) : "—",
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: "text-emerald-600 bg-emerald-500/10",
      trend: "+0.3%",
      up: true,
    },
    {
      label: "Read Rate",
      value: m ? pct(m.readRate) : "—",
      icon: <Eye className="w-4 h-4" />,
      color: "text-blue-600 bg-blue-500/10",
      trend: "+2.1%",
      up: true,
    },
    {
      label: "Reply Rate",
      value: m ? pct(m.replyRate) : "—",
      icon: <MessageCircleReply className="w-4 h-4" />,
      color: "text-violet-600 bg-violet-500/10",
      trend: "-0.8%",
      up: false,
    },
    {
      label: "Total Cost",
      value: m ? `$${m.totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—",
      icon: <DollarSign className="w-4 h-4" />,
      color: "text-orange-600 bg-orange-500/10",
      trend: "+8.2%",
      up: true,
    },
  ];

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* ── Page header ── */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
        <PageHeader
          title="Dashboard"
          description="Overview of your WhatsApp messaging performance."
        />
        <div className="flex items-center gap-2">
          {/* Date range pills */}
          <div className="hidden sm:flex items-center border border-border rounded-lg overflow-hidden bg-muted/30">
            {DATE_RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setRange(r.days)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  range === r.days
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading dashboard…</span>
          </div>
        ) : (
          <>
            {/* ── KPI cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {KPI_CARDS.map((card) => (
                <div
                  key={card.label}
                  className="p-4 rounded-xl border border-border bg-card flex flex-col gap-3 hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
                    <span className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", card.color)}>
                      {card.icon}
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <span className="text-2xl font-bold tracking-tight leading-none">{card.value}</span>
                    <span className={cn(
                      "flex items-center gap-0.5 text-[11px] font-medium",
                      card.up ? "text-emerald-600" : "text-red-500"
                    )}>
                      {card.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {card.trend}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", card.up ? "bg-emerald-500" : "bg-red-400")} style={{ width: "65%" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* ── Row 2: Volume chart + Category split ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Message volume */}
              <div className="lg:col-span-2 p-5 rounded-xl border border-border bg-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold">Message Volume</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sent / Delivered / Read — last {range} days
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary/20 inline-block" /> Sent</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary/50 inline-block" /> Delivered</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> Read</span>
                  </div>
                </div>
                <BarMiniChart data={volumeData} />
                {/* X-axis date labels */}
                <div className="flex justify-between text-[9px] text-muted-foreground pt-1">
                  {volumeData.filter((_, i) => i % 2 === 0).map((d) => (
                    <span key={d.date}>{d.date.slice(5)}</span>
                  ))}
                </div>
              </div>

              {/* Category split donut */}
              <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                <div>
                  <h2 className="text-sm font-semibold">Category Split</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">By message volume</p>
                </div>
                <div className="flex items-center gap-4">
                  <DonutChart
                    slices={(analytics?.categorySplit ?? []).map((s, i) => ({
                      label: s.category,
                      value: s.value,
                      color: DONUT_COLORS[i] ?? "#94a3b8",
                    }))}
                  />
                  <div className="flex flex-col gap-2 flex-1">
                    {(analytics?.categorySplit ?? []).map((s, i) => (
                      <div key={s.category} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DONUT_COLORS[i] ?? "#94a3b8" }} />
                          <span className="text-[11px] text-muted-foreground">{s.category}</span>
                        </div>
                        <span className="text-[11px] font-semibold">{s.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Row 3: Top templates + Delivery by country ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top templates */}
              <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold">Top Templates</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">By messages sent</p>
                  </div>
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="space-y-3">
                  {(analytics?.topTemplates ?? []).map((t, i) => {
                    const maxSent = Math.max(...(analytics?.topTemplates ?? []).map((x) => x.sent));
                    return (
                      <div key={t.templateName} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] font-bold text-muted-foreground w-4 shrink-0">#{i + 1}</span>
                            <span className="text-xs font-medium truncate">{t.templateName}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[11px] text-muted-foreground">{formatNumber(t.sent)} sent</span>
                            <span className={cn(
                              "text-[11px] font-semibold tabular-nums",
                              t.readRate >= 80 ? "text-emerald-600" : t.readRate >= 60 ? "text-blue-600" : "text-amber-600"
                            )}>
                              {t.readRate}% read
                            </span>
                          </div>
                        </div>
                        {sparkBar(t.sent, maxSent, "bg-primary")}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery by country */}
              <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold">Delivery by Country</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Top markets performance</p>
                  </div>
                  <Globe className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                    <div className="col-span-4">Country</div>
                    <div className="col-span-3 text-right">Sent</div>
                    <div className="col-span-3 text-right">Delivery</div>
                    <div className="col-span-2 text-right">Cost</div>
                  </div>
                  {(analytics?.deliveryByCountry ?? []).map((c) => (
                    <div key={c.countryCode} className="grid grid-cols-12 gap-2 px-2 py-2 rounded-lg hover:bg-muted/30 transition-colors items-center">
                      <div className="col-span-4 flex items-center gap-1.5">
                        <span className="text-base leading-none">{c.countryFlag}</span>
                        <span className="text-xs font-medium truncate">{c.countryName}</span>
                      </div>
                      <div className="col-span-3 text-right text-xs text-muted-foreground">
                        {formatNumber(c.sent)}
                      </div>
                      <div className="col-span-3 text-right">
                        <span className={cn(
                          "text-xs font-semibold",
                          c.deliveryRate >= 98 ? "text-emerald-600" : "text-blue-600"
                        )}>
                          {c.deliveryRate}%
                        </span>
                      </div>
                      <div className="col-span-2 text-right text-xs text-muted-foreground">
                        ${c.cost.toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
