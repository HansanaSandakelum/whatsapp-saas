"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getTemplates } from "@/data/templates";
import { getSenders } from "@/data/senders";
import { getContactGroups } from "@/data/contacts";
import { createCampaign } from "@/data/campaigns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import {
  ArrowLeft,
  Rocket,
  Loader2,
  CheckCircle2,
  Users,
  MessageSquare,
  Calendar,
  Clock,
  Variable,
  Phone,
  Zap,
  Timer,
} from "lucide-react";
import type { WizardState } from "@/app/(dashboard)/campaigns/new/page";
import type { Campaign, CampaignAudience, CampaignSchedule } from "@/types/campaign";

interface Props {
  state: WizardState;
  onBack: () => void;
}

export function Step5Review({ state, onBack }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: templates } = useQuery({
    queryKey: ["templates", { status: "approved" }],
    queryFn: () => getTemplates({ status: "approved" }),
  });
  const { data: senders } = useQuery({
    queryKey: ["senders"],
    queryFn: () => getSenders(),
  });
  const { data: groups } = useQuery({
    queryKey: ["contact-groups"],
    queryFn: getContactGroups,
  });

  const template = templates?.find((t) => t.id === state.step1.templateId);
  const sender = senders?.find((s) => s.id === state.step1.senderId);
  
  const step2 = state.step2;
  const selectedGroups =
    step2?.mode === "GROUP"
      ? (groups ?? []).filter((g) => step2.groupIds.includes(g.id))
      : [];

  const audienceSummary = () => {
    if (!state.step2) return "No audience";
    if (state.step2.mode === "GROUP") {
      const total = selectedGroups.reduce((s, g) => s + g.memberCount, 0);
      return `${selectedGroups.length} group${selectedGroups.length !== 1 ? "s" : ""} · ~${formatNumber(total)} contacts`;
    }
    if (state.step2.mode === "PASTED") return `${state.step2.phoneNumbers.length} phone numbers`;
    return "CSV upload";
  };

  const scheduleSummary = () => {
    const s = state.step4;
    if (s.mode === "SEND_NOW") return "Send immediately";
    if (s.mode === "SCHEDULED")
      return `Scheduled: ${new Date(s.scheduledAt).toLocaleString()} (${s.timezone})`;
    if (s.mode === "DRIP")
      return `Drip from ${new Date(s.startAt).toLocaleString()} · ${s.ratePerMin} msg/min`;
    return "";
  };

  const variableEntries = Object.entries(state.step3);

  const CONTACT_FIELD_LABELS: Record<string, string> = {
    first_name: "First Name",
    last_name: "Last Name",
    phone: "Phone Number",
    email: "Email",
  };

  const handleLaunch = async () => {
    setSubmitting(true);
    
    // Construct audience
    const audience: CampaignAudience = {
      source: (state.step2?.mode.toLowerCase() as any) || "group",
      totalRecipients: 0,
      dedupCount: 0,
      optedOutCount: 0,
      estimatedReach: 0,
    };

    if (step2?.mode === "GROUP") {
      audience.groupIds = step2.groupIds;
      audience.totalRecipients = selectedGroups.reduce((s, g) => s + g.memberCount, 0);
      audience.estimatedReach = Math.floor(audience.totalRecipients * 0.98);
    } else if (step2?.mode === "PASTED") {
      audience.phoneNumbers = step2.phoneNumbers;
      audience.totalRecipients = step2.phoneNumbers.length;
      audience.estimatedReach = audience.totalRecipients;
    }

    // Construct schedule
    const step4 = state.step4;
    const schedule: CampaignSchedule = {
      type: step4.mode === "SEND_NOW" ? "send_now" : step4.mode === "SCHEDULED" ? "scheduled" : "drip",
      scheduledAt: step4.mode === "SCHEDULED" ? step4.scheduledAt : step4.mode === "DRIP" ? step4.startAt : undefined,
      timezone: step4.mode !== "SEND_NOW" ? step4.timezone : undefined,
      quietHoursEnabled: !!step4.quietHours,
      quietHoursStart: step4.quietHours?.start,
      quietHoursEnd: step4.quietHours?.end,
      ratePerMin: step4.mode === "DRIP" ? step4.ratePerMin : undefined,
    };

    // Construct full campaign
    const newCampaign: Omit<Campaign, "id" | "createdAt" | "updatedAt"> = {
      name: state.step1.name,
      description: state.step1.description,
      status: state.step4.mode === "SEND_NOW" ? "active" : "scheduled",
      templateId: state.step1.templateId,
      templateName: template?.name || "Unknown Template",
      senderId: state.step1.senderId,
      senderName: sender?.displayName || "Unknown Sender",
      audience,
      costBreakdown: [
        { country: "United States", countryFlag: "🇺🇸", recipients: audience.estimatedReach, ratePerConversation: 0.0147, subtotal: audience.estimatedReach * 0.0147 }
      ],
      totalCost: audience.estimatedReach * 0.0147,
      placeholders: variableEntries.map(([v, s]) => ({
        variable: v,
        contactField: s.kind === "contact_field" ? s.field : null,
        defaultValue: s.kind === "literal" ? s.value : s.kind === "system" ? `{{system:${s.name}}}` : s.kind === "campaign_field" ? `{{campaign:${s.field}}}` : "",
      })),
      schedule,
      metrics: {
        sent: 0,
        delivered: 0,
        read: 0,
        replied: 0,
        failed: 0,
        deliveryRate: 0,
        readRate: 0,
        replyRate: 0,
      },
      optInConfirmed: true,
    };

    try {
      await createCampaign(newCampaign);
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => router.push("/campaigns"), 2000);
    } catch (error) {
      console.error("Failed to create campaign:", error);
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Campaign Launched!</h2>
          <p className="text-muted-foreground mt-1.5 text-sm">
            "{state.step1.name}" is now queued. Redirecting to campaigns…
          </p>
        </div>
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Review & Launch</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Double-check everything before sending. This action cannot be undone for active sends.
        </p>
      </div>

      {/* Summary sections grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Basics */}
        <ReviewSection title="Campaign Basics" icon={<MessageSquare className="w-3.5 h-3.5" />}>
          <Row label="Name">{state.step1.name}</Row>
          <Row label="Sender">
            <span className="flex items-center gap-1.5 truncate">
              <Phone className="w-3 h-3" />
              {sender?.displayName ?? state.step1.senderId}
            </span>
          </Row>
          <Row label="Template">
            <span className="flex items-center gap-1.5 truncate">
              <MessageSquare className="w-3 h-3" />
              {template?.name ?? state.step1.templateId}
            </span>
          </Row>
          {template && (
            <div className="mt-2 p-2 rounded bg-muted/40 text-[10px] text-foreground border border-border line-clamp-3">
              {template.body}
            </div>
          )}
        </ReviewSection>

        {/* Audience */}
        <ReviewSection title="Audience" icon={<Users className="w-3.5 h-3.5" />}>
          <Row label="Source">{state.step2?.mode ?? "—"}</Row>
          <Row label="Reach">{audienceSummary()}</Row>
          {selectedGroups.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1 max-h-[60px] overflow-y-auto">
              {selectedGroups.map((g) => (
                <span key={g.id} className="text-[10px] bg-muted border border-border rounded-full px-2 py-0.5">
                  {g.name}
                </span>
              ))}
            </div>
          )}
        </ReviewSection>

        {/* Variables */}
        <ReviewSection title="Variable Mappings" icon={<Variable className="w-3.5 h-3.5" />}>
          {variableEntries.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">No variables.</p>
          ) : (
            <div className="space-y-1 max-h-[100px] overflow-y-auto pr-1">
              {variableEntries.map(([variable, source]) => (
                <Row key={variable} label={variable}>
                  <span className="truncate">
                    {source.kind === "contact_field"
                      ? `${CONTACT_FIELD_LABELS[source.field] ?? source.field}`
                      : source.kind === "literal"
                      ? `"${source.value}"`
                      : source.kind === "system"
                      ? `System: ${source.name}`
                      : `Campaign: ${source.field}`}
                  </span>
                </Row>
              ))}
            </div>
          )}
        </ReviewSection>

        {/* Schedule */}
        <ReviewSection title="Schedule" icon={<Calendar className="w-3.5 h-3.5" />}>
          <Row label="Mode">
            <span className="flex items-center gap-1.5 truncate">
              {state.step4.mode === "SEND_NOW" && <Zap className="w-3 h-3 text-amber-500" />}
              {state.step4.mode === "SCHEDULED" && <Calendar className="w-3 h-3 text-blue-500" />}
              {state.step4.mode === "DRIP" && <Timer className="w-3 h-3 text-violet-500" />}
              {scheduleSummary()}
            </span>
          </Row>
          {state.step4.quietHours && (
            <Row label="Quiet Hours">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {state.step4.quietHours.start} – {state.step4.quietHours.end}
              </span>
            </Row>
          )}
        </ReviewSection>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 text-sm">
        <Rocket className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-amber-800 dark:text-amber-300">
          Once launched, messages will be sent to all opted-in contacts in your audience.
          {state.step4.mode === "SEND_NOW" ? " Delivery begins immediately." : " Delivery will begin at the scheduled time."}
        </p>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2" disabled={submitting}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={handleLaunch}
          disabled={submitting}
          className="gap-2 px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Launching…
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" /> Launch Campaign
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card space-y-3">
      <h3 className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {icon} {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="text-muted-foreground w-28 shrink-0 leading-5">{label}</span>
      <span className="text-foreground font-medium leading-5 flex items-center gap-1.5">{children}</span>
    </div>
  );
}
