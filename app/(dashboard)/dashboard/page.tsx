"use client";

import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "@/data/analytics";
import { getCampaigns } from "@/data/campaigns";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Send, CheckCircle2, MessageSquare, Megaphone, Loader2 } from "lucide-react";
import { formatNumber, formatPercent } from "@/lib/format";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => getAnalytics(),
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["campaigns", "recent"],
    queryFn: () => getCampaigns(),
  });

  if (analyticsLoading || campaignsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const recentCampaigns = campaigns?.slice(0, 5) || [];
  const donutColors = ["hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--danger))", "hsl(var(--info))"];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your WhatsApp messaging performance."
      />

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Messages Sent"
          value={formatNumber(analytics?.metrics.totalSent || 0)}
          icon={<Send className="w-4 h-4" />}
          trend={{ value: 12.5, label: "vs last 30 days", isPositive: true }}
        />
        <StatCard
          title="Delivery Rate"
          value={formatPercent(analytics?.metrics.deliveryRate || 0)}
          icon={<CheckCircle2 className="w-4 h-4 text-success" />}
          trend={{ value: 0.2, label: "vs last 30 days", isPositive: true }}
        />
        <StatCard
          title="Read Rate"
          value={formatPercent(analytics?.metrics.readRate || 0)}
          icon={<MessageSquare className="w-4 h-4 text-info" />}
          trend={{ value: 2.4, label: "vs last 30 days", isPositive: true }}
        />
        <StatCard
          title="Active Campaigns"
          value="4"
          icon={<Megaphone className="w-4 h-4 text-primary" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Area Chart */}
        <Card className="col-span-3 md:col-span-2">
          <CardHeader>
            <CardTitle>Messaging Volume</CardTitle>
            <CardDescription>Messages sent and delivered over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.dailyVolume || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString()}
                  />
                  <Area type="monotone" dataKey="sent" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorSent)" />
                  <Area type="monotone" dataKey="delivered" stroke="hsl(var(--success))" strokeWidth={2} fillOpacity={1} fill="url(#colorDelivered)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart */}
        <Card className="col-span-3 md:col-span-1">
          <CardHeader>
            <CardTitle>Delivery Status</CardTitle>
            <CardDescription>Breakdown by status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Delivered", value: 85 },
                      { name: "Read", value: 10 },
                      { name: "Failed", value: 5 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {[0, 1, 2].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold tabular-nums">{formatPercent(analytics?.metrics.deliveryRate || 0)}</span>
                <span className="text-xs text-muted-foreground">Delivered</span>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-muted-foreground">Delivered</span>
                </div>
                <span className="font-medium">85%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-info"></div>
                  <span className="text-muted-foreground">Read</span>
                </div>
                <span className="font-medium">10%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-danger"></div>
                  <span className="text-muted-foreground">Failed</span>
                </div>
                <span className="font-medium">5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Latest campaign executions and status.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Sent</TableHead>
                  <TableHead className="w-[150px]">Read Rate</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={campaign.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(campaign.metrics.sent)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={campaign.metrics.readRate} className="h-2" />
                        <span className="text-xs text-muted-foreground tabular-nums w-8">{campaign.metrics.readRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {campaign.schedule.scheduledAt ? formatDateTime(campaign.schedule.scheduledAt) : "Immediate"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
