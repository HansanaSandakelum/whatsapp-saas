"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCampaigns } from "@/data/campaigns";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Search, MoreVertical, Play, Pause, Trash2 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { DataTable } from "@/components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Campaign } from "@/types/campaign";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { formatNumber, formatDateTime, formatCurrency } from "@/lib/format";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function CampaignsPage() {
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("all");

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns", { status: statusTab, search }],
    queryFn: () => getCampaigns({ status: statusTab, search }),
  });

  const columns: ColumnDef<Campaign>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link href={`${ROUTES.CAMPAIGNS}/${row.original.id}`} className="font-medium hover:underline text-foreground">
          {row.getValue("name")}
        </Link>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "audience.estimatedReach",
      header: "Audience Size",
      cell: ({ row }) => <span className="tabular-nums">{formatNumber(row.original.audience.estimatedReach)}</span>,
    },
    {
      accessorKey: "metrics.readRate",
      header: "Read Rate",
      cell: ({ row }) => {
        const rate = row.original.metrics.readRate;
        if (row.original.status === "scheduled" || row.original.status === "draft") {
          return <span className="text-muted-foreground text-sm">—</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <Progress value={rate} className="w-[60px] h-2" />
            <span className="text-xs text-muted-foreground tabular-nums w-8">{rate}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "schedule.scheduledAt",
      header: "Scheduled",
      cell: ({ row }) => {
        const dateStr = row.original.schedule.scheduledAt;
        return <span className="text-sm text-muted-foreground whitespace-nowrap">{dateStr ? formatDateTime(dateStr) : "Immediate"}</span>;
      },
    },
    {
      accessorKey: "totalCost",
      header: "Cost",
      cell: ({ row }) => {
        const cost = row.original.actualCost || row.original.totalCost;
        return <span className="tabular-nums">{formatCurrency(cost)}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const campaign = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem render={<Link href={`${ROUTES.CAMPAIGNS}/${campaign.id}`} />}>
                View details
              </DropdownMenuItem>
              {(campaign.status === "scheduled" || campaign.status === "active") && (
                <DropdownMenuItem>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </DropdownMenuItem>
              )}
              {campaign.status === "paused" && (
                <DropdownMenuItem>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </DropdownMenuItem>
              )}
              {(campaign.status === "draft" || campaign.status === "scheduled") && (
                <DropdownMenuItem className="text-danger">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Cancel Campaign
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Campaigns"
        description="Create and manage your broadcast campaigns."
        actions={
          <Button render={<Link href={ROUTES.CAMPAIGNS_NEW} />} nativeButton={false}>
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <Tabs defaultValue="all" value={statusTab} onValueChange={setStatusTab}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="active">Running</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </Tabs>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable columns={columns} data={campaigns || []} />
        )}
      </div>
    </div>
  );
}
