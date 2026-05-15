"use client";

import { useQuery } from "@tanstack/react-query";
import { getCampaignById } from "@/data/campaigns";
import { getTemplateById } from "@/data/templates";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, Loader2, Search, CheckCircle2, CheckCircle, Check, XCircle, MessageSquare,
  ChevronLeft, ChevronRight, Calendar, User, Layout, Tags, Users
} from "lucide-react";
import { PhonePreview } from "@/components/shared/phone-preview";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Mock contact report generator
function generateMockContactReports(campaign: any) {
  const reports = [];
  // Generating a small mock list for presentation
  const total = 50;
  
  const firstNames = ["James", "Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia", "Lucas", "Isabella"];
  const orderIds = ["ORD-9123", "ORD-8821", "ORD-7234", "ORD-6621", "ORD-5542"];

  for (let i = 0; i < total; i++) {
    let status = "sent";
    const rand = Math.random();
    if (rand > 0.95) status = "failed";
    else if (rand > 0.8) status = "sent";
    else if (rand > 0.4) status = "delivered";
    else if (rand > 0.1) status = "read";
    else status = "replied";

    reports.push({
      id: `rep-${i}`,
      phone: `+1 (555) ${Math.floor(1000000 + Math.random() * 9000000)}`,
      status,
      contactData: {
        first_name: firstNames[i % firstNames.length],
        order_id: orderIds[i % orderIds.length],
        order_total: `$${(Math.random() * 150 + 20).toFixed(2)}`,
        cart_items: `${Math.floor(Math.random() * 4) + 1}`,
        delivery_date: "Tomorrow",
      },
      sentAt: campaign.createdAt,
      deliveredAt: status === "failed" || status === "sent" ? null : new Date(new Date(campaign.createdAt).getTime() + 1000 * 60).toISOString(),
      readAt: status === "read" || status === "replied" ? new Date(new Date(campaign.createdAt).getTime() + 1000 * 60 * 5).toISOString() : null,
      repliedAt: status === "replied" ? new Date(new Date(campaign.createdAt).getTime() + 1000 * 60 * 15).toISOString() : null,
    });
  }
  return reports;
}

const STATUS_ICONS: Record<string, any> = {
  sent: <Check className="w-4 h-4 text-muted-foreground" />,
  delivered: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  read: <CheckCircle2 className="w-4 h-4 text-blue-500" />,
  replied: <CheckCircle2 className="w-4 h-4 text-violet-500" />,
  failed: <XCircle className="w-4 h-4 text-red-500" />,
};

const STATUS_STYLES: Record<string, string> = {
  sent: "bg-muted text-muted-foreground border-border",
  delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  read: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  replied: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  failed: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function CampaignReportDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => getCampaignById(id),
  });

  const { data: template } = useQuery({
    queryKey: ["template", campaign?.templateId],
    queryFn: () => getTemplateById(campaign!.templateId),
    enabled: !!campaign,
  });

  const getRenderedMessage = () => {
    if (!template || !selectedReport) return "Loading template...";
    let msg = template.body;
    campaign?.placeholders?.forEach((ph: any) => {
      let val = ph.defaultValue;
      if (ph.contactField && selectedReport.contactData[ph.contactField]) {
        val = selectedReport.contactData[ph.contactField];
      }
      if (!val) val = `[${ph.contactField || 'Value'}]`;

      const v = ph.variable.replace(/[{}]/g, '');
      msg = msg.replace(new RegExp(`\\{\\{${v}\\}\\}`, 'g'), val);
    });
    return msg;
  };

  const reports = useMemo(() => {
    if (!campaign) return [];
    return generateMockContactReports(campaign);
  }, [campaign]);

  const filteredReports = useMemo(() => {
    let result = reports;
    if (search) {
      result = result.filter(r => r.phone.includes(search));
    }
    if (statusFilter !== "all") {
      result = result.filter(r => r.status === statusFilter);
    }
    return result;
  }, [reports, search, statusFilter]);

  const totalPages = Math.ceil(filteredReports.length / rowsPerPage);
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredReports.slice(start, start + rowsPerPage);
  }, [filteredReports, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading campaign report...</span>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-8 text-center">
        <p>Campaign not found</p>
        <Button className="mt-4"><Link href="/reports">Back to Reports</Link></Button>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 lg:px-8 lg:py-6 max-w-[1400px] mx-auto w-full space-y-4 flex-1">
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <Link href="/reports">
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <PageHeader
          title={campaign.name}
          description={`Detailed contact-level report for ${campaign.templateName}`}
          className="pb-0 mb-0 border-none w-full"
        />
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-3 py-3 px-5 bg-muted/5 rounded-xl border border-border text-xs">
        <div className="flex items-center gap-2">
          <Layout className="w-3.5 h-3.5 text-primary" />
          <span className="text-muted-foreground uppercase tracking-wider font-bold text-[10px]">Template:</span>
          <span className="font-semibold">{campaign.templateName}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-muted-foreground uppercase tracking-wider font-bold text-[10px]">Sender:</span>
          <span className="font-semibold">{campaign.senderName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-muted-foreground uppercase tracking-wider font-bold text-[10px]">Schedule:</span>
          <span className="font-semibold">
            {campaign.schedule.type === "scheduled" 
              ? new Date(campaign.schedule.scheduledAt!).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
              : "Immediate"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-muted-foreground uppercase tracking-wider font-bold text-[10px]">Audience:</span>
          <span className="font-semibold">{campaign.audience.estimatedReach.toLocaleString()} contacts</span>
        </div>
      </div>

      {/* <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard title="Total Audience" value={campaign.audience.estimatedReach} />
        <MetricCard title="Sent" value={campaign.metrics.sent} />
        <MetricCard title="Delivered" value={campaign.metrics.delivered} />
        <MetricCard title="Read" value={campaign.metrics.read} />
        <MetricCard title="Replied" value={campaign.metrics.replied} />
      </div> */}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/10">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search phone number..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm bg-background"
            />
          </div>
          <div className="flex flex-wrap items-center border border-border rounded-lg overflow-hidden bg-background">
            {["all", "sent", "delivered", "read", "replied", "failed"].map((s) => (
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
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_60px] gap-3 px-4 py-2 bg-muted/20 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <div>Contact Number</div>
              <div>Status</div>
              <div>Sent At</div>
              <div>Read At</div>
              <div>Replied At</div>
              <div className="text-right">Action</div>
            </div>
            <div className="divide-y divide-border">
              {paginatedReports.map((r) => (
                <div key={r.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_60px] gap-3 px-4 py-2 items-center text-xs hover:bg-muted/10 transition-colors">
                  <div className="font-medium font-mono">{r.phone}</div>
                  <div>
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide border",
                      STATUS_STYLES[r.status]
                    )}>
                      {STATUS_ICONS[r.status]} {r.status}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-[10px]">
                    {r.sentAt ? new Date(r.sentAt).toLocaleString() : "—"}
                  </div>
                  <div className="text-muted-foreground text-[10px]">
                    {r.readAt ? new Date(r.readAt).toLocaleString() : "—"}
                  </div>
                  <div className="text-muted-foreground text-[10px]">
                    {r.repliedAt ? new Date(r.repliedAt).toLocaleString() : "—"}
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => setSelectedReport(r)}>
                      <MessageSquare className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {paginatedReports.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No contacts found matching criteria.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/5">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredReports.length)} of {filteredReports.length}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <Button
                    key={p}
                    variant={currentPage === p ? "default" : "ghost"}
                    className="h-8 w-8 text-xs p-0"
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </Button>
                );
              })}
              {totalPages > 5 && <span className="text-muted-foreground text-xs px-1">...</span>}
              {totalPages > 5 && currentPage <= totalPages && currentPage > 5 && (
                 <Button
                    variant="default"
                    className="h-8 w-8 text-xs p-0"
                 >
                    {currentPage}
                 </Button>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedReport} onOpenChange={(o) => !o && setSelectedReport(null)}>
        <DialogContent className="sm:max-w-fit bg-transparent !bg-none border-none shadow-none p-0 flex justify-center [&>button]:hidden outline-none rounded-[2.5rem]">
          <PhonePreview 
            senderName={campaign?.senderName}
            template={template || undefined}
            renderedBody={getRenderedMessage()}
            time={selectedReport?.sentAt ? new Date(selectedReport.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value?.toLocaleString() || "0"}</p>
    </div>
  );
}
