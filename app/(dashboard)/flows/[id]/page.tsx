"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getFlowById } from "@/data/flows";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Loader2, Play, Layers, BarChart3, 
  Clock, CheckCircle2, AlertCircle, Eye, ExternalLink, 
  Smartphone, Terminal, LayoutDashboard, Settings2, Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FlowInteractivePlayer } from "@/components/flows/flow-player";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  draft: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  deprecated: "bg-muted text-muted-foreground border-border",
};

export default function FlowDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: flow, isLoading } = useQuery({
    queryKey: ["flow", id],
    queryFn: () => getFlowById(id),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-3 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading flow workspace...</span>
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center p-6">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold mb-1">Flow Not Found</h3>
        <p className="text-sm text-muted-foreground mb-6">We couldn't retrieve the flow details you requested.</p>
        <Button render={<Link href="/flows" />} nativeButton={false}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  // Mock screen analytic steps
  const mockFunnel = [
    { name: "Welcome Screen", views: 4500, completion: 92 },
    { name: "Information Collection", views: 4140, completion: 78 },
    { name: "Final Review & Sign", views: 3229, completion: 96 },
    { name: "Flow Completed", views: 3100, completion: 100 },
  ];

  return (
    <div className="px-6 py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Link href="/flows" className="hover:text-foreground hover:underline flex items-center gap-1">
              Flows Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground truncate font-semibold">{flow.name}</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{flow.name}</h1>
            <Badge variant="outline" className={cn("capitalize text-[11px]", STATUS_STYLES[flow.status])}>
              {flow.status}
            </Badge>
            <Badge variant="secondary" className="text-[11px] font-mono">
              v{flow.version}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Last modified {formatRelative(flow.updatedAt)} • Created 3 months ago
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="h-9">
            <ExternalLink className="w-4 h-4 mr-1.5" /> Get API Link
          </Button>
          <Button size="sm" className="h-9 shadow-sm">
            <Edit3 className="w-4 h-4 mr-1.5" /> Open Builder
          </Button>
        </div>
      </div>

      {/* ── Main Dashboard Split ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left / Center: Detail Tabs */}
        <div className="lg:col-span-2 space-y-6">
          
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="h-9 w-full max-w-xs bg-muted/60">
              <TabsTrigger value="analytics" className="text-xs flex-1">
                <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                Metrics
              </TabsTrigger>
              <TabsTrigger value="structure" className="text-xs flex-1">
                <Layers className="w-3.5 h-3.5 mr-1.5" />
                Structure
              </TabsTrigger>
            </TabsList>

            {/* Analytics Tab Content */}
            <TabsContent value="analytics" className="space-y-6 pt-4">
              
              {/* Top Stats Row */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Impressions</p>
                      <Eye className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold tracking-tight">4,500</span>
                      <span className="text-[11px] text-emerald-600 font-medium mt-0.5">+12.5% from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completions</p>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold tracking-tight">3,100</span>
                      <span className="text-[11px] text-emerald-600 font-medium mt-0.5">68.8% Completion Rate</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg. Duration</p>
                      <Clock className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold tracking-tight">42s</span>
                      <span className="text-[11px] text-muted-foreground mt-0.5">-3s improvement</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Screen Funnel Conversion Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-primary" />
                    Flow Screen Funnel
                  </CardTitle>
                  <CardDescription>
                    Track user progression through each consecutive screen.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {mockFunnel.map((step, idx) => (
                    <div key={step.name} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-medium">
                          <span className="w-5 h-5 rounded bg-muted border flex items-center justify-center font-mono text-[10px]">
                            {idx + 1}
                          </span>
                          <span>{step.name}</span>
                        </div>
                        <div className="text-muted-foreground flex gap-3">
                          <span>{step.views.toLocaleString()} visits</span>
                          <span className="font-semibold text-foreground">{step.completion}% completion</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-500 rounded-full",
                            step.completion > 90 ? "bg-emerald-500" : 
                            step.completion > 70 ? "bg-blue-500" : "bg-orange-500"
                          )}
                          style={{ width: `${step.completion}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* External Hook Info */}
              <Card className="bg-muted/15 border-dashed border-border/80">
                <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h4 className="text-sm font-bold">Endpoint Webhook Data Exchange</h4>
                    <p className="text-xs text-muted-foreground">
                      This flow sends submitted data to your endpoint at: <code className="bg-card px-1.5 py-0.5 rounded border font-mono text-[10px]">https://api.adeona.office/flows/webhooks</code>
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 text-xs h-8">
                    Test Endpoint
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Structure Tab Content */}
            <TabsContent value="structure" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Flow Schema Definition</CardTitle>
                  <CardDescription>The JSON structure delivered to Meta's WhatsApp business servers.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 border-t bg-[#0B141A] dark:bg-black text-[#8696A0] font-mono text-[11px] overflow-x-auto rounded-b-xl select-all">
                  <pre className="p-4 leading-relaxed text-emerald-400">
{`{
  "version": "${flow.version}",
  "screens": [
    {
      "id": "WELCOME_SCREEN",
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          { "type": "TextHeading", "text": "Welcome to ${flow.name}" },
          { "type": "Footer", "label": "Get Started" }
        ]
      }
    }
  ]
}`}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>

        {/* Right Sidebar: Visual Playground */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider px-1 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4" />
            Flow Playground
          </h3>
          
          <div className="p-6 border rounded-2xl bg-card shadow-sm flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" />
            <FlowInteractivePlayer flow={flow} />
          </div>
          
          <p className="text-[10px] text-center text-muted-foreground leading-normal px-2">
            Interact with the device above to test full flow logical navigation and submission actions in real time.
          </p>
        </div>

      </div>
    </div>
  );
}
