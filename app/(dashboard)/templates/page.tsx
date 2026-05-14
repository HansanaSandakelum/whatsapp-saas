"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTemplates } from "@/data/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  Plus,
  Search,
  Copy,
  Edit2,
  Trash2,
  MoreHorizontal,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TemplateStatus } from "@/types/common";

/* ── helpers ────────────────────────────────────────────── */
const STATUS_META: Record<
  TemplateStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  approved: {
    label: "Approved",
    icon: <CheckCircle2 className="w-3 h-3" />,
    className: "text-success bg-success/10 border-success/20",
  },
  pending: {
    label: "Pending",
    icon: <Clock className="w-3 h-3" />,
    className: "text-warning bg-warning/10 border-warning/20",
  },
  rejected: {
    label: "Rejected",
    icon: <XCircle className="w-3 h-3" />,
    className: "text-danger bg-danger/10 border-danger/20",
  },
  draft: {
    label: "Draft",
    icon: <AlertCircle className="w-3 h-3" />,
    className: "text-muted-foreground bg-muted border-border",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  MARKETING: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  UTILITY: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  AUTHENTICATION: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

function StatusPill({ status }: { status: TemplateStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.draft;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full border",
        meta.className,
      )}
    >
      {meta.icon}
      {meta.label}
    </span>
  );
}

/* ── page ───────────────────────────────────────────────── */
export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const { data: templates, isLoading } = useQuery({
    queryKey: ["templates", { search, category, status }],
    queryFn: () =>
      getTemplates({
        search: search || undefined,
        category: category !== "all" ? category : undefined,
        status: status !== "all" ? status : undefined,
      }),
  });

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setStatus("all");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage approved WhatsApp message templates
          </p>
        </div>
        <Button
          render={<Link href={ROUTES.TEMPLATES_NEW} />}
          nativeButton={false}
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Template
        </Button>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name or content…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={category} onValueChange={(v) => v && setCategory(v)}>
          <SelectTrigger className="w-full sm:w-44 h-9 text-sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="MARKETING">Marketing</SelectItem>
            <SelectItem value="UTILITY">Utility</SelectItem>
            <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => v && setStatus(v)}>
          <SelectTrigger className="w-full sm:w-40 h-9 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : templates?.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-xl bg-muted/20 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-base mb-1">No templates found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search || category !== "all" || status !== "all"
              ? "Try adjusting your filters."
              : "Get started by creating your first template."}
          </p>
          {search || category !== "all" || status !== "all" ? (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : (
            <Button
              size="sm"
              render={<Link href={ROUTES.TEMPLATES_NEW} />}
              nativeButton={false}
            >
              <Plus className="w-4 h-4 mr-1" /> Create Template
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates?.map((template) => (
            <div
              key={template.id}
              className="group flex flex-col rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-150 overflow-hidden"
            >
              {/* Card top strip */}
              <div className="flex items-start justify-between px-4 pt-4 pb-3">
                <div className="flex flex-col gap-1.5">
                  <span
                    className={cn(
                      "self-start text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                      CATEGORY_COLORS[template.category] ??
                        "bg-muted text-muted-foreground",
                    )}
                  >
                    {template.category}
                  </span>
                  <StatusPill status={template.status as TemplateStatus} />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity -mr-1 -mt-1 shrink-0"
                      />
                    }
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem>
                      <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="w-3.5 h-3.5 mr-2" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-danger">
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Name + body */}
              <div className="px-4 pb-3 flex-1">
                <h3
                  className="text-sm font-semibold truncate mb-1.5"
                  title={template.name}
                >
                  {template.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {template.body}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/20">
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MessageSquare className="w-3 h-3" />
                  {template.variableCount} var
                  {template.variableCount !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatRelative(template.updatedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
