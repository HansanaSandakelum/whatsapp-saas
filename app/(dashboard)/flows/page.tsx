"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFlows } from "@/data/flows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Search, Workflow } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { FlowCard } from "@/components/flows/flow-card";

export default function FlowsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const { data: flows, isLoading } = useQuery({
    queryKey: ["flows", { search, category, status }],
    queryFn: () =>
      getFlows({
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
          <h1 className="text-2xl font-bold tracking-tight">WhatsApp Flows</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create, test and manage rich form-like interactive screens on WhatsApp.
          </p>
        </div>
        <Button
          render={<Link href={ROUTES.FLOWS_NEW} />}
          nativeButton={false}
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Flow
        </Button>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search flows by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={category} onValueChange={(v) => v && setCategory(v)}>
          <SelectTrigger className="w-full sm:w-48 h-9 text-sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="SIGN_UP">Sign Up / Registrations</SelectItem>
            <SelectItem value="APPOINTMENT_BOOKING">Appointments</SelectItem>
            <SelectItem value="SURVEY">Surveys & Feedback</SelectItem>
            <SelectItem value="LEAD_GENERATION">Lead Generation</SelectItem>
            <SelectItem value="CONTACT_US">Contact Forms</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => v && setStatus(v)}>
          <SelectTrigger className="w-full sm:w-40 h-9 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="deprecated">Deprecated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : flows?.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-xl bg-muted/20 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Workflow className="w-5 h-5 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-base mb-1">No flows found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search || category !== "all" || status !== "all"
              ? "Try adjusting your filters."
              : "Build rich, wizard-like interactions in WhatsApp with Flows."}
          </p>
          {search || category !== "all" || status !== "all" ? (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : (
            <Button
              size="sm"
              render={<Link href={ROUTES.FLOWS_NEW} />}
              nativeButton={false}
            >
              <Plus className="w-4 h-4 mr-1" /> Create Flow
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {flows?.map((flow) => (
            <FlowCard key={flow.id} flow={flow} />
          ))}
        </div>
      )}
    </div>
  );
}
