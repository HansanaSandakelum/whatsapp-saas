"use client";

import { useQuery } from "@tanstack/react-query";
import { getSenders } from "@/data/senders";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { CountryFlag } from "@/components/shared/country-flag";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Settings, Smartphone, MoreHorizontal, Plus, ShieldCheck, Activity } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

function QualityBadge({ rating }: { rating: string }) {
  const colors = {
    high: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    low: "bg-red-500/10 text-red-600 border-red-500/20",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider", colors[rating as keyof typeof colors] || "bg-muted")}>
      {rating}
    </span>
  );
}

export default function SendersPage() {
  const { data: senders, isLoading } = useQuery({
    queryKey: ["senders"],
    queryFn: () => getSenders(),
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="WhatsApp Senders"
        description="Manage your connected WhatsApp Business phone numbers and messaging limits."
        actions={
          <Button render={<Link href="/api-settings" />} nativeButton={false} className="gap-2">
            <Plus className="w-4 h-4" /> Add Phone Number
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Header */}
              <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_60px] gap-4 px-6 py-4 bg-muted/20 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div>Phone Number / Display Name</div>
                <div>Status</div>
                <div>Quality Rating</div>
                <div>Messaging Limit</div>
                <div>Usage Today</div>
                <div className="text-right">Actions</div>
              </div>

              {/* Body */}
              <div className="divide-y divide-border">
                {senders?.map((sender) => (
                  <div key={sender.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_60px] gap-4 px-6 py-4 items-center hover:bg-muted/10 transition-colors">
                    
                    {/* Name & Number */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Smartphone className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold truncate text-foreground">{sender.displayName}</p>
                          {sender.isVerified && (
                            <span title="Official Business Account">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <CountryFlag flag={sender.countryFlag} className="w-3 h-3 text-[10px]" />
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {sender.phoneNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <StatusBadge status={sender.status} />
                    </div>

                    {/* Quality */}
                    <div>
                      <QualityBadge rating={sender.qualityRating} />
                    </div>

                    {/* Limit */}
                    <div className="text-sm font-medium">
                      {formatNumber(sender.dailyLimit)} <span className="text-xs text-muted-foreground font-normal">/ 24h</span>
                    </div>

                    {/* Usage */}
                    <div className="pr-4">
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-sm font-semibold tabular-nums">{formatNumber(sender.usedToday)}</span>
                        <span className="text-[10px] text-muted-foreground">{((sender.usedToday / sender.dailyLimit) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full", (sender.usedToday / sender.dailyLimit) > 0.8 ? "bg-amber-500" : "bg-primary")} 
                          style={{ width: `${Math.min(100, (sender.usedToday / sender.dailyLimit) * 100)}%` }} 
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" />}>
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem render={<Link href={`${ROUTES.SENDERS}/${sender.id}`} />}>
                            <Settings className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem render={<Link href={`${ROUTES.CONVERSATIONS}?sender=${sender.id}`} />}>
                            <MessageSquare className="w-4 h-4 mr-2" /> Open Inbox
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
