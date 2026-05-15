"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCampaigns } from "@/data/campaigns";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import {
  Download,
  RefreshCw,
  Search,
  Filter,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Loader2,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── Helpers ───────────────────────────────────────────────────────────────
function pct(v: number) {
  return `${v.toFixed(1)}%`;
}

const CAMPAIGN_STATUS_STYLE: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  active:    "bg-blue-500/10 text-blue-600 border-blue-500/20",
  scheduled: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  paused:    "bg-amber-500/10 text-amber-600 border-amber-500/20",
  failed:    "bg-red-500/10 text-red-600 border-red-500/20",
  draft:     "bg-muted text-muted-foreground border-border",
};

// ─── Page ─────────────────────────────────────────────────────────────────
export default function CampaignReportsPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"sent" | "deliveryRate" | "readRate" | "replyRate" | "createdAt" | "cost">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const { data: campaigns, isLoading, refetch } = useQuery({
    queryKey: ["campaigns-report"],
    queryFn: () => getCampaigns(),
  });

  const sortedAndFiltered = useMemo(() => {
    if (!campaigns) return [];
    let result = [...campaigns];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(s) || c.templateName.toLowerCase().includes(s));
    }

    if (activeTab !== "ALL") {
      result = result.filter(c => c.category === activeTab);
    }

    if (statusFilter !== "all") {
      result = result.filter(c => c.status === statusFilter);
    }

    return result.sort((a, b) => {
      let av: number;
      let bv: number;
      
      if (sortField === "createdAt") {
        av = new Date(a.createdAt).getTime();
        bv = new Date(b.createdAt).getTime();
      } else if (sortField === "cost") {
        av = a.totalCost || 0;
        bv = b.totalCost || 0;
      } else {
        av = a.metrics[sortField] ?? 0;
        bv = b.metrics[sortField] ?? 0;
      }
      
      return sortDir === "desc" ? bv - av : av - bv;
    });
  }, [campaigns, search, activeTab, statusFilter, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (field === sortField) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  // Top aggregated stats
  const totalSent = sortedAndFiltered.reduce((sum, c) => sum + (c.metrics.sent || 0), 0);
  const totalCost = sortedAndFiltered.reduce((sum, c) => sum + (c.totalCost || 0), 0);
  const avgDelivery = sortedAndFiltered.length > 0 
    ? sortedAndFiltered.reduce((sum, c) => sum + (c.metrics.deliveryRate || 0), 0) / sortedAndFiltered.length 
    : 0;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto w-full space-y-6 flex-1">
      <PageHeader
        title="Campaign Reports"
        description="Detailed performance breakdown of all your campaigns."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => refetch()}
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </Button>
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <Download className="w-3 h-3" /> Export CSV
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/50 p-1 mb-2">
            <TabsTrigger value="ALL" className="text-xs">All Campaigns</TabsTrigger>
            <TabsTrigger value="MARKETING" className="text-xs">Marketing</TabsTrigger>
            <TabsTrigger value="UTILITY" className="text-xs">Utility</TabsTrigger>
            <TabsTrigger value="AUTHENTICATION" className="text-xs">Authentication</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading campaign reports…</span>
          </div>
        ) : (
          <>
            {/* Top Aggregated Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl border border-border bg-card flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Sent (Filtered)</p>
                  <p className="text-2xl font-bold tracking-tight mt-1">{formatNumber(totalSent)}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
              <div className="p-5 rounded-xl border border-border bg-card flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Avg Delivery Rate</p>
                  <p className="text-2xl font-bold tracking-tight mt-1">{pct(avgDelivery)}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="p-5 rounded-xl border border-border bg-card flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Cost (Filtered)</p>
                  <p className="text-2xl font-bold tracking-tight mt-1">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search campaigns or templates..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center border border-border rounded-lg overflow-hidden bg-muted/30">
                  {["all", "completed", "active", "scheduled"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium transition-colors capitalize",
                        statusFilter === s
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0 shrink-0">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card overflow-x-auto">
              <div className="min-w-[1000px]">
                {/* Table header */}
                <div className="grid grid-cols-[2fr_100px_120px_160px_80px_80px_80px_80px_60px] gap-3 px-5 py-3 bg-muted/20 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground items-center">
                  <div>Campaign Info</div>
                  <div className="text-center">Status</div>
                  <SortHeader label="Date" field="createdAt" current={sortField} dir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Sent" field="sent" current={sortField} dir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Delivery" field="deliveryRate" current={sortField} dir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Read" field="readRate" current={sortField} dir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Reply" field="replyRate" current={sortField} dir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Cost" field="cost" current={sortField} dir={sortDir} onSort={toggleSort} />
                  <div className="text-right">Actions</div>
                </div>

                <div className="divide-y divide-border">
                  {sortedAndFiltered.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                        <Search className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">No campaigns found</p>
                      <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search query.</p>
                    </div>
                  ) : (
                    sortedAndFiltered.map((c) => (
                      <div key={c.id} className="grid grid-cols-[2fr_100px_120px_160px_80px_80px_80px_80px_60px] gap-3 px-5 py-4 items-center hover:bg-muted/20 transition-colors">
                        <div className="min-w-0 pr-2">
                          <p className="text-sm font-semibold truncate text-foreground">{c.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground truncate bg-muted px-1.5 py-0.5 rounded">
                              {c.templateName}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <span className={cn(
                            "text-[9px] font-semibold px-2 py-1 rounded-full border uppercase tracking-wider",
                            CAMPAIGN_STATUS_STYLE[c.status] ?? "bg-muted text-muted-foreground"
                          )}>
                            {c.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground">
                            {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        
                        {/* Sent Column with Reach Context */}
                        <div className="text-right">
                          <span className="text-sm font-bold tabular-nums">{formatNumber(c.metrics.sent)}</span>
                          <span className="text-[10px] text-muted-foreground ml-1">/ {formatNumber(c.audience.estimatedReach)}</span>
                          <div className="w-full bg-muted h-1 rounded-full mt-1.5 flex overflow-hidden justify-end">
                            <div 
                              className="bg-primary h-full rounded-full" 
                              style={{ width: `${Math.min(100, (c.metrics.sent / c.audience.estimatedReach) * 100)}%` }} 
                            />
                          </div>
                        </div>

                        {/* Rates */}
                        <RateCell value={c.metrics.deliveryRate} thresholds={[95, 90]} />
                        <RateCell value={c.metrics.readRate} thresholds={[75, 55]} />
                        <RateCell value={c.metrics.replyRate} thresholds={[10, 5]} />
                        
                        {/* Cost */}
                        <div className="text-right">
                          <span className="text-xs font-semibold">${c.totalCost?.toFixed(2) || "0.00"}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function SortHeader({
  label,
  field,
  current,
  dir,
  onSort,
  className,
}: {
  label: string;
  field: any;
  current: string;
  dir: "asc" | "desc";
  onSort: (f: any) => void;
  className?: string;
}) {
  const active = current === field;
  return (
    <button
      onClick={() => onSort(field)}
      className={cn("flex items-center gap-1 text-right justify-end hover:text-foreground transition-colors", className, active && "text-primary")}
    >
      {label}
      {active ? (
        dir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
      ) : (
        <ChevronDown className="w-3 h-3 opacity-30" />
      )}
    </button>
  );
}

function RateCell({
  value,
  thresholds,
}: {
  value: number;
  thresholds: [number, number];
}) {
  let color = "text-foreground";
  if (value !== undefined && thresholds) {
    color = value >= thresholds[0] ? "text-emerald-600" : value >= thresholds[1] ? "text-amber-600" : "text-red-500";
  }
  return (
    <div className="text-right">
      <span className={cn("text-xs font-semibold tabular-nums", color)}>{pct(value || 0)}</span>
    </div>
  );
}
