"use client";

import { useQuery } from "@tanstack/react-query";
import { getCampaignById } from "@/data/campaigns";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { 
  ArrowLeft, Calendar, Users, MessageSquare, Clock, 
  CheckCircle2, AlertCircle, Send, MoreVertical,
  Download, Pause, Play, Trash2
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatNumber, formatPercent, formatDateTime, formatCurrency } from "@/lib/format";
import { ROUTES } from "@/lib/constants";
import { Loader2 } from "lucide-react";

export default function CampaignDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => getCampaignById(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Campaign not found</h2>
        <Button onClick={() => router.push(ROUTES.CAMPAIGNS)}>Back to Campaigns</Button>
      </div>
    );
  }

  const donutData = [
    { name: "Delivered", value: campaign.metrics.delivered, color: "hsl(var(--success))" },
    { name: "Failed", value: campaign.metrics.failed, color: "hsl(var(--danger))" },
    { name: "Remaining", value: Math.max(0, campaign.audience.estimatedReach - campaign.metrics.sent), color: "hsl(var(--muted))" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href={ROUTES.CAMPAIGNS} 
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Campaigns
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
              <StatusBadge status={campaign.status} />
            </div>
            <p className="text-muted-foreground">{campaign.description || "No description provided."}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Result
            </Button>
            {campaign.status === "active" ? (
              <Button variant="outline" size="sm">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            ) : campaign.status === "paused" ? (
              <Button variant="outline" size="sm">
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            ) : null}
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Reach"
          value={formatNumber(campaign.metrics.sent)}
          icon={<Users className="w-4 h-4 text-primary" />}
        />
        <StatCard
          title="Delivery Rate"
          value={`${campaign.metrics.deliveryRate}%`}
          icon={<CheckCircle2 className="w-4 h-4 text-success" />}
        />
        <StatCard
          title="Read Rate"
          value={`${campaign.metrics.readRate}%`}
          icon={<MessageSquare className="w-4 h-4 text-info" />}
        />
        <StatCard
          title="Total Cost"
          value={formatCurrency(campaign.actualCost || campaign.totalCost)}
          icon={<Send className="w-4 h-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Delivery Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Delivery Performance</CardTitle>
            <CardDescription>Real-time delivery and engagement metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sent</span>
                    <span className="font-medium">{formatPercent((campaign.metrics.sent / campaign.audience.estimatedReach) * 100)}</span>
                  </div>
                  <Progress value={(campaign.metrics.sent / campaign.audience.estimatedReach) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivered</span>
                    <span className="font-medium">{formatPercent(campaign.metrics.deliveryRate)}</span>
                  </div>
                  <Progress value={campaign.metrics.deliveryRate} className="h-2 bg-success/20" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Read</span>
                    <span className="font-medium">{formatPercent(campaign.metrics.readRate)}</span>
                  </div>
                  <Progress value={campaign.metrics.readRate} className="h-2 bg-info/20" />
                </div>
              </div>
              
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold">{formatNumber(campaign.metrics.sent)}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Sent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatNumber(campaign.metrics.delivered)}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Delivered</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatNumber(campaign.metrics.read)}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Read</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatNumber(campaign.metrics.failed)}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider text-danger">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Config</CardTitle>
            <CardDescription>Setup and scheduling details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Scheduled For</p>
                  <p className="text-xs text-muted-foreground">
                    {campaign.schedule.scheduledAt ? formatDateTime(campaign.schedule.scheduledAt) : "Send Immediately"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Template</p>
                  <p className="text-xs text-muted-foreground">{campaign.templateName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Send className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Sender</p>
                  <p className="text-xs text-muted-foreground">{campaign.senderName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Quiet Hours</p>
                  <p className="text-xs text-muted-foreground">
                    {campaign.schedule.quietHoursEnabled 
                      ? `${campaign.schedule.quietHoursStart} - ${campaign.schedule.quietHoursEnd}` 
                      : "Disabled"}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-3">Audience Source</h4>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border">
                <Users className="w-4 h-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium capitalize">{campaign.audience.source}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {campaign.audience.groupIds?.length ? `${campaign.audience.groupIds.length} Groups selected` : "Direct broadcast"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Country Breakdown</CardTitle>
          <CardDescription>Estimated costs and reach per country.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Recipients</TableHead>
                <TableHead className="text-right">Rate / Conv.</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaign.costBreakdown.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="flex items-center gap-2">
                    <span className="text-lg">{item.countryFlag}</span>
                    <span>{item.country}</span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(item.recipients)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(item.ratePerConversation)}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{formatCurrency(item.subtotal)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/30 font-bold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right tabular-nums">{formatNumber(campaign.audience.estimatedReach)}</TableCell>
                <TableCell className="text-right">—</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(campaign.totalCost)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
