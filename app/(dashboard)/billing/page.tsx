"use client";

import { useQuery } from "@tanstack/react-query";
import { getInvoices } from "@/data/invoices";
import {
  Download,
  ExternalLink,
  Receipt,
  Shield,
  Tag,
  Clock,
  MessageSquare,
  CalendarDays,
  TrendingUp,
  Hash,
} from "lucide-react";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const MOCK_USAGE = {
  marketing:     { count: 12500, cost: 350.50, color: "text-violet-500", bg: "bg-violet-500/10", icon: Tag,          label: "Marketing" },
  utility:       { count:  4200, cost:  45.20, color: "text-blue-500",   bg: "bg-blue-500/10",   icon: Clock,         label: "Utility" },
  authentication:{ count:   850, cost:  20.00, color: "text-orange-500", bg: "bg-orange-500/10", icon: Shield,        label: "Authentication" },
  service:       { count:  1200, cost:   5.00, color: "text-emerald-500",bg: "bg-emerald-500/10",icon: MessageSquare, label: "Service" },
};

const STATUS_STYLES: Record<string, string> = {
  paid:   "bg-emerald-500/10 text-emerald-600 border-emerald-400/30",
  open:   "bg-amber-500/10 text-amber-600 border-amber-400/30",
  failed: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function BillingPage() {
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  });

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]   = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "open" | "failed">("all");

  const totalCost = Object.values(MOCK_USAGE).reduce((s, v) => s + v.cost, 0);
  const totalConvs = Object.values(MOCK_USAGE).reduce((s, v) => s + v.count, 0);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const d = parseISO(inv.date);
      if (dateFrom && d < startOfDay(parseISO(dateFrom))) return false;
      if (dateTo   && d > endOfDay(parseISO(dateTo)))     return false;
      if (statusFilter !== "all" && inv.status !== statusFilter) return false;
      return true;
    });
  }, [invoices, dateFrom, dateTo, statusFilter]);

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-5 pb-16">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold leading-tight">Billing &amp; Usage</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            May 1 – May 31, 2025 &nbsp;·&nbsp; Cycle active
          </p>
        </div>
        <a
          href="https://developers.facebook.com/docs/whatsapp/pricing"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Meta Pricing
        </a>
      </div>

      {/* ── Summary stat row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Estimated cost */}
        <div className="rounded-lg border border-border bg-card px-4 py-3 flex flex-col gap-0.5">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Est. Cost</span>
          <span className="text-xl font-bold">${totalCost.toFixed(2)}</span>
          <span className="text-[10px] text-muted-foreground">USD · this cycle</span>
        </div>
        {/* Total conversations */}
        <div className="rounded-lg border border-border bg-card px-4 py-3 flex flex-col gap-0.5">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Conversations</span>
          <span className="text-xl font-bold">{totalConvs.toLocaleString()}</span>
          <span className="text-[10px] text-muted-foreground">All categories</span>
        </div>
        {/* Invoices paid */}
        <div className="rounded-lg border border-border bg-card px-4 py-3 flex flex-col gap-0.5">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Invoices Paid</span>
          <span className="text-xl font-bold">{invoices.filter(i => i.status === "paid").length}</span>
          <span className="text-[10px] text-muted-foreground">of {invoices.length} total</span>
        </div>
        {/* Top category */}
        <div className="rounded-lg border border-border bg-card px-4 py-3 flex flex-col gap-0.5">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Top Category</span>
          <span className="text-xl font-bold">Marketing</span>
          <span className="text-[10px] text-muted-foreground">${MOCK_USAGE.marketing.cost.toFixed(2)} spent</span>
        </div>
      </div>

      {/* ── Usage by category — compact chips ── */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Usage by Category</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.values(MOCK_USAGE).map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.label}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
              >
                <div className={cn("p-1.5 rounded-md shrink-0", cat.bg)}>
                  <Icon className={cn("w-3.5 h-3.5", cat.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground">{cat.label}</p>
                  <p className="text-sm font-semibold leading-tight">${cat.cost.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">{cat.count.toLocaleString()} convs</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Billing History ── */}
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Table toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2.5 bg-muted/20 border-b border-border">
          <p className="text-xs font-semibold">Billing History</p>
          <div className="flex flex-wrap items-center gap-2">
            {/* Date From */}
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-7 text-xs w-[130px] px-2"
              />
            </div>
            <span className="text-muted-foreground text-xs">–</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-7 text-xs w-[130px] px-2"
            />

            {/* Status filter pills */}
            <div className="flex items-center border border-border rounded-md overflow-hidden bg-background">
              {(["all", "paid", "open", "failed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-medium capitalize transition-colors",
                    statusFilter === s
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Clear filters */}
            {(dateFrom || dateTo || statusFilter !== "all") && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); setStatusFilter("all"); }}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            )}

            {/* Download all */}
            <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 px-2.5">
              <Download className="w-3 h-3" /> Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-xs text-muted-foreground">Loading invoices…</div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="text-[10px] uppercase tracking-wider">
                <TableHead className="py-2 h-8">Invoice</TableHead>
                <TableHead className="py-2 h-8">Period</TableHead>
                <TableHead className="py-2 h-8">Date</TableHead>
                <TableHead className="py-2 h-8">Amount</TableHead>
                <TableHead className="py-2 h-8">Status</TableHead>
                <TableHead className="py-2 h-8 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="text-xs hover:bg-muted/10">
                  <TableCell className="py-2 font-mono text-[11px] text-muted-foreground">{invoice.id}</TableCell>
                  <TableCell className="py-2 font-medium">{invoice.period}</TableCell>
                  <TableCell className="py-2 text-muted-foreground">
                    {format(parseISO(invoice.date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="py-2 font-semibold">${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell className="py-2">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] capitalize px-1.5 py-0.5 font-medium", STATUS_STYLES[invoice.status])}
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7" />}>
                          <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="sr-only">Download PDF</span>
                        </TooltipTrigger>
                        <TooltipContent side="left">Download PDF</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-20 text-center text-xs text-muted-foreground">
                    No invoices match the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {/* Footer count */}
        <div className="px-3 py-2 border-t border-border bg-muted/10 text-[10px] text-muted-foreground">
          {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? "s" : ""} shown
          {(dateFrom || dateTo) && " for selected date range"}
        </div>
      </div>
    </div>
  );
}
