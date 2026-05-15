"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getContactGroups } from "@/data/contacts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Users,
  FileUp,
  CheckCircle2,
  Hash,
} from "lucide-react";
import type { Step2State } from "@/types/campaign";
import type { ContactGroup } from "@/types/contact";

interface Props {
  value: Step2State | null;
  onChange: (s: Step2State) => void;
  onNext: () => void;
  onBack: () => void;
}

type AudienceMode = "GROUP" | "CSV";

export function Step2Audience({ value, onChange, onNext, onBack }: Props) {
  const [mode, setMode] = useState<AudienceMode>(
    value?.mode === "GROUP" || value?.mode === "CSV"
      ? value.mode
      : "GROUP",
  );
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    value?.mode === "GROUP" ? value.groupIds : [],
  );

  const { data: groups, isLoading } = useQuery({
    queryKey: ["contact-groups"],
    queryFn: getContactGroups,
  });

  const toggleGroup = (id: string) =>
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );

  const totalFromGroups = (groups ?? [])
    .filter((g) => selectedGroups.includes(g.id))
    .reduce((sum, g) => sum + g.memberCount, 0);

  const canProceed =
    (mode === "GROUP" && selectedGroups.length > 0) ||
    mode === "CSV";

  const handleNext = () => {
    let state: Step2State;
    if (mode === "GROUP") state = { mode: "GROUP", groupIds: selectedGroups };
    else state = { mode: "CSV", uploadId: "mock-upload-id" };
    onChange(state);
    onNext();
  };

  const MODES: { id: AudienceMode; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: "GROUP", label: "Contact Groups", desc: "Select from saved groups", icon: <Users className="w-4 h-4" /> },
    { id: "CSV", label: "Upload CSV", desc: "Import a phone number list", icon: <FileUp className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Audience</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose who will receive this campaign.
        </p>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-3">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all",
              mode === m.id
                ? "border-primary bg-primary/5 ring-1 ring-primary/30 text-primary"
                : "border-border hover:border-primary/40 hover:bg-muted/30 text-muted-foreground",
            )}
          >
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", mode === m.id ? "bg-primary/15" : "bg-muted")}>
              {m.icon}
            </div>
            <div>
              <p className="text-[11px] font-semibold">{m.label}</p>
              <p className="text-[9px] opacity-70 mt-0.5">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* GROUP mode */}
      {mode === "GROUP" && (
        <div className="space-y-3 p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Select Groups</h3>
            {selectedGroups.length > 0 && (
              <span className="text-xs text-primary font-medium flex items-center gap-1">
                <Hash className="w-3 h-3" />
                ~{formatNumber(totalFromGroups)} contacts
              </span>
            )}
          </div>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-4 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading groups…
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {(groups ?? []).map((g) => (
                <GroupCard
                  key={g.id}
                  group={g}
                  selected={selectedGroups.includes(g.id)}
                  onToggle={() => toggleGroup(g.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* CSV mode */}
      {mode === "CSV" && (
        <div className="p-5 rounded-xl border border-dashed border-border bg-card flex flex-col items-center justify-center gap-3 py-12">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <FileUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">Drop your CSV here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse — must have a <code className="bg-muted px-1 rounded">phone</code> column</p>
          </div>
          <Button variant="outline" size="sm">Browse File</Button>
          <p className="text-xs text-muted-foreground">
            (Mock: file upload simulated for demo)
          </p>
        </div>
      )}

      {/* Audience summary */}
      {canProceed && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-success/8 border border-success/20 text-success text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            {mode === "GROUP" && `${selectedGroups.length} group${selectedGroups.length > 1 ? "s" : ""} — ~${formatNumber(totalFromGroups)} contacts`}
            {mode === "CSV" && "CSV file ready to be processed"}
          </span>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={handleNext} disabled={!canProceed} className="gap-2 px-6">
          Next: Variables <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function GroupCard({
  group,
  selected,
  onToggle,
}: {
  group: ContactGroup;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center gap-2 p-2 rounded-lg border transition-all text-left",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "border-border hover:border-primary/40 hover:bg-muted/30",
      )}
    >
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", selected ? "bg-primary/15" : "bg-muted")}>
        <Users className={cn("w-3 h-3", selected ? "text-primary" : "text-muted-foreground")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{group.name}</p>
        {group.description && (
          <p className="text-[10px] text-muted-foreground truncate">{group.description}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-[11px] font-semibold">{formatNumber(group.memberCount)}</p>
        <p className="text-[9px] text-muted-foreground">contacts</p>
      </div>
      {selected && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
    </button>
  );
}
