"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSenders } from "@/data/senders";
import { getTemplates } from "@/data/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Loader2,
  Phone,
  CheckCircle2,
  MessageSquare,
  Zap,
  ShieldCheck,
} from "lucide-react";
import type { Step1State, CampaignCategory } from "@/types/campaign";
import type { Template } from "@/types/template";

interface Props {
  value: Step1State;
  onChange: (s: Step1State) => void;
  onNext: () => void;
}

const CATEGORY_META: Record<
  string,
  { icon: React.ReactNode; color: string; activeBorder: string; desc: string }
> = {
  MARKETING: {
    icon: <Zap className="w-3.5 h-3.5" />,
    color: "text-violet-600 bg-violet-500/10",
    activeBorder: "border-violet-500 bg-violet-500/5 ring-1 ring-violet-500/30",
    desc: "Promotions, offers & announcements",
  },
  UTILITY: {
    icon: <MessageSquare className="w-3.5 h-3.5" />,
    color: "text-blue-600 bg-blue-500/10",
    activeBorder: "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/30",
    desc: "Transactional updates & alerts",
  },
  AUTHENTICATION: {
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    color: "text-orange-600 bg-orange-500/10",
    activeBorder: "border-orange-500 bg-orange-500/5 ring-1 ring-orange-500/30",
    desc: "OTPs & verification codes",
  },
};

export function Step1Basics({ value, onChange, onNext }: Props) {
  const [form, setForm] = useState(value);
  const [templateSearch, setTemplateSearch] = useState("");

  const { data: senders, isLoading: loadingSenders } = useQuery({
    queryKey: ["senders"],
    queryFn: () => getSenders(),
  });

  const { data: allTemplates, isLoading: loadingTemplates } = useQuery({
    queryKey: ["templates", { status: "approved" }],
    queryFn: () => getTemplates({ status: "approved" }),
  });

  const filtered = (allTemplates ?? []).filter((t) => {
    const matchesSearch =
      !templateSearch ||
      t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.body.toLowerCase().includes(templateSearch.toLowerCase());
    const matchesCategory = !form.category || t.category === form.category;
    return matchesSearch && matchesCategory;
  });

  const selectedTemplate = allTemplates?.find((t) => t.id === form.templateId);
  const selectedSender = senders?.find((s) => s.id === form.senderId);

  const set = <K extends keyof Step1State>(k: K, v: Step1State[K]) => {
    const next = { ...form, [k]: v };
    setForm(next);
    onChange(next);
  };

  const handleCategoryChange = (cat: CampaignCategory) => {
    const next = { ...form, category: cat };
    if (selectedTemplate && selectedTemplate.category !== cat) {
      next.templateId = "";
    }
    setForm(next);
    onChange(next);
  };

  // Auto-suggest category from template when one is selected and no category is set yet
  useEffect(() => {
    if (selectedTemplate && !form.category) {
      set("category", selectedTemplate.category as CampaignCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate?.id]);

  const canProceed =
    form.name.trim().length >= 3 && form.senderId && form.templateId;

  const handleNext = () => {
    onChange(form);
    onNext();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">Campaign basics</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Give your campaign a name, pick a sender, and choose the template to
          broadcast.
        </p>
      </div>

      {/* Name, Description, Sender Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4 p-5 rounded-xl border border-border bg-card">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Campaign Info
          </h3>
          <div className="space-y-2">
            <Label htmlFor="camp-name">
              Campaign name <span className="text-danger">*</span>
            </Label>
            <Input
              id="camp-name"
              placeholder="e.g. Summer Sale Blast"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={cn(
                "h-9",
                form.name.length > 0 &&
                  form.name.length < 3 &&
                  "border-danger/60",
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="camp-desc">
              Description{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Textarea
              id="camp-desc"
              placeholder="Internal note…"
              rows={1}
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              className="min-h-[38px] py-2"
            />
          </div>

          {/* Category selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Category type</Label>
            </div>
            <div className="flex gap-2">
              {(Object.keys(CATEGORY_META) as CampaignCategory[]).map((cat) => {
                const meta = CATEGORY_META[cat];
                const active = form.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex-1 justify-center",
                      active
                        ? meta.activeBorder
                        : "border-border hover:border-primary/40 hover:bg-muted/30 text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn("shrink-0", active ? "" : "opacity-60")}
                    >
                      {meta.icon}
                    </span>
                    <span>
                      {cat === "AUTHENTICATION"
                        ? "Auth"
                        : cat.charAt(0) + cat.slice(1).toLowerCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-3 p-5 rounded-xl border border-border bg-card">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Sender
          </h3>
          {loadingSenders ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 max-h-[140px] overflow-y-auto pr-1">
              {(senders ?? [])
                .filter((s) => s.status === "approved")
                .map((sender) => {
                  const active = form.senderId === sender.id;
                  return (
                    <button
                      key={sender.id}
                      onClick={() => set("senderId", sender.id)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border text-left transition-all",
                        active
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border hover:border-primary/40 hover:bg-muted/40",
                      )}
                    >
                      <Phone
                        className={cn(
                          "w-3.5 h-3.5 shrink-0",
                          active ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {sender.displayName}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {sender.phoneNumber}
                        </p>
                      </div>
                      {active && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Template picker */}
      <div className="space-y-3 p-5 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Message Template
          </h3>
          {selectedTemplate && (
            <span className="text-xs text-primary font-medium">
              {selectedTemplate.name}
            </span>
          )}
        </div>

        <Input
          placeholder="Search templates…"
          value={templateSearch}
          onChange={(e) => setTemplateSearch(e.target.value)}
          className="h-8 text-sm"
        />

        {loadingTemplates ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading templates…
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No approved templates found.
              </p>
            ) : (
              filtered.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  selected={form.templateId === t.id}
                  onSelect={() => set("templateId", t.id)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="gap-2 px-6"
        >
          Next: Audience
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: Template;
  selected: boolean;
  onSelect: () => void;
}) {
  const cat = CATEGORY_META[template.category] ?? {
    icon: null,
    color: "bg-muted text-muted-foreground",
  };
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left p-2.5 rounded-lg border transition-all group",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
          : "border-border hover:border-primary/40 hover:bg-muted/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase shrink-0",
              cat.color,
            )}
          >
            {cat.icon} {template.category}
          </span>
          <span className="text-xs font-medium truncate">{template.name}</span>
        </div>
        {selected && (
          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
        )}
      </div>
      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-tight">
        {template.body}
      </p>
    </button>
  );
}
