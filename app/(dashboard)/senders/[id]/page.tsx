"use client";

import { useQuery } from "@tanstack/react-query";
import { getSenderById } from "@/data/senders";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { CountryFlag } from "@/components/shared/country-flag";
import { Loader2, ArrowLeft, Smartphone, Building2, Globe, Mail, MapPin, KeyRound, CheckCircle2, AlertCircle, Activity, Info } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

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

export default function SenderDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: sender, isLoading } = useQuery({
    queryKey: ["sender", id],
    queryFn: () => getSenderById(id),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!sender) {
    return (
      <div className="flex flex-col h-full items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Sender not found</h2>
        <Button variant="outline" render={<Link href={ROUTES.SENDERS} />} nativeButton={false}>
          Return to Senders
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="mb-2">
        <Link href={ROUTES.SENDERS} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Senders
        </Link>
      </div>

      <PageHeader
        title={sender.displayName}
        description={`Manage settings and profile for ${sender.phoneNumber}`}
        actions={
          <Button variant="outline" className="gap-2">
            Edit Profile
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Business Profile (Public facing) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base">WhatsApp Business Profile</CardTitle>
                  <CardDescription>Public information visible to your customers on WhatsApp.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Display Name</span>
                  <p className="text-sm font-semibold">{sender.displayName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Category</span>
                  <p className="text-sm">{sender.category || "Not specified"}</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">About (Status)</span>
                <p className="text-sm">{sender.about || "Available"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Business Description</span>
                <p className="text-sm">{sender.description || "No description provided."}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{sender.website || "No website"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{sender.email || "No email"}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-sm">{sender.address || "No address provided."}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Meta Technical Details */}
        <div className="space-y-6">
          {/* Status Overview */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Connection</span>
                <StatusBadge status={sender.status} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Quality Rating</span>
                <QualityBadge rating={sender.qualityRating} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">OBA Status</span>
                {sender.isVerified ? (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Official (Green Tick)
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Standard Business</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messaging Limits */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center justify-between">
                Messaging Limits
                <Activity className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Tier</span>
                <span className="text-sm font-semibold">Tier {sender.messagingTier}</span>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">24h Limit</span>
                  <span className="font-medium tabular-nums">{formatNumber(sender.usedToday)} / {formatNumber(sender.dailyLimit)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full", (sender.usedToday / sender.dailyLimit) > 0.8 ? "bg-amber-500" : "bg-primary")} 
                    style={{ width: `${Math.min(100, (sender.usedToday / sender.dailyLimit) * 100)}%` }} 
                  />
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Limits upgrade automatically when you consistently send high-quality messages approaching your current limit.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Meta Identifiers */}
          <Card className="bg-muted/30 border-dashed">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-muted-foreground" />
                API Identifiers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Phone Number ID</span>
                <p className="text-xs font-mono bg-background border border-border px-2 py-1.5 rounded">{sender.metaPhoneNumberId}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">WABA ID</span>
                <p className="text-xs font-mono bg-background border border-border px-2 py-1.5 rounded">{sender.metaBusinessAccountId}</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
