"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft, Zap, Calendar, Timer, Clock, Info } from "lucide-react";
import type { Step4State } from "@/types/campaign";

interface Props {
  value: Step4State;
  onChange: (s: Step4State) => void;
  onNext: () => void;
  onBack: () => void;
}

type Mode = "SEND_NOW" | "SCHEDULED" | "DRIP";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export function Step4Schedule({ value, onChange, onNext, onBack }: Props) {
  const [mode, setMode] = useState<Mode>(value.mode);
  const [scheduledAt, setScheduledAt] = useState(
    value.mode === "SCHEDULED" ? value.scheduledAt.slice(0, 16) : "",
  );
  const [timezone, setTimezone] = useState(
    (value.mode === "SCHEDULED" || value.mode === "DRIP") ? value.timezone : "America/New_York",
  );
  const [ratePerMin, setRatePerMin] = useState(
    value.mode === "DRIP" ? value.ratePerMin : 100,
  );
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(
    !!value.quietHours,
  );
  const [quietStart, setQuietStart] = useState(value.quietHours?.start ?? "22:00");
  const [quietEnd, setQuietEnd] = useState(value.quietHours?.end ?? "08:00");

  const canProceed =
    mode === "SEND_NOW" ||
    (mode === "SCHEDULED" && !!scheduledAt) ||
    (mode === "DRIP" && !!scheduledAt && ratePerMin > 0);

  const handleNext = () => {
    const quietHours = quietHoursEnabled
      ? { start: quietStart, end: quietEnd }
      : undefined;

    let state: Step4State;
    if (mode === "SEND_NOW") {
      state = { mode: "SEND_NOW", quietHours };
    } else if (mode === "SCHEDULED") {
      state = {
        mode: "SCHEDULED",
        scheduledAt: new Date(scheduledAt).toISOString(),
        timezone,
        quietHours,
      };
    } else {
      state = {
        mode: "DRIP",
        startAt: new Date(scheduledAt).toISOString(),
        ratePerMin,
        timezone,
        quietHours,
      };
    }
    onChange(state);
    onNext();
  };

  const MODES: { id: Mode; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: "SEND_NOW", label: "Send Immediately", desc: "Deploy right after confirmation", icon: <Zap className="w-4 h-4" /> },
    { id: "SCHEDULED", label: "Schedule", desc: "Pick a date and time", icon: <Calendar className="w-4 h-4" /> },
    { id: "DRIP", label: "Drip (Rate Limit)", desc: "Spread delivery over time", icon: <Timer className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Schedule</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose when and how your campaign will be sent.
        </p>
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-3 gap-3">
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
              <p className="text-[9px] opacity-70 mt-0.5 leading-tight">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* SEND_NOW info */}
      {mode === "SEND_NOW" && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900 text-sm">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-blue-700 dark:text-blue-300">
            The campaign will be queued immediately after you confirm. Delivery begins within seconds, subject to Meta rate limits.
          </p>
        </div>
      )}

      {/* SCHEDULED fields */}
      {(mode === "SCHEDULED" || mode === "DRIP") && (
        <div className="space-y-4 p-5 rounded-xl border border-border bg-card">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {mode === "DRIP" ? "Drip Start Time" : "Scheduled Time"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="sched-at">Date & Time <span className="text-danger">*</span></Label>
              <Input
                id="sched-at"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={(v) => v && setTimezone(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Drip rate */}
          {mode === "DRIP" && (
            <div className="space-y-2 pt-2 border-t border-border">
              <Label htmlFor="drip-rate">Messages per minute</Label>
              <Input
                id="drip-rate"
                type="number"
                min={1}
                max={500}
                value={ratePerMin}
                onChange={(e) => setRatePerMin(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 50–200/min. Higher rates may trigger Meta throttling.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quiet hours */}
      <div className="space-y-3 p-5 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Quiet Hours</h3>
          </div>
          <button
            onClick={() => setQuietHoursEnabled((v) => !v)}
            className={cn(
              "relative w-9 h-5 rounded-full transition-colors",
              quietHoursEnabled ? "bg-primary" : "bg-muted-foreground/30",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                quietHoursEnabled ? "translate-x-4" : "translate-x-0.5",
              )}
            />
          </button>
        </div>

        {quietHoursEnabled && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="q-start" className="text-xs">Do not send after</Label>
              <Input id="q-start" type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="q-end" className="text-xs">Resume sending after</Label>
              <Input id="q-end" type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} />
            </div>
            <p className="col-span-2 text-xs text-muted-foreground">
              Messages scheduled during quiet hours will be held and sent after the resume time.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={handleNext} disabled={!canProceed} className="gap-2 px-6">
          Review Campaign <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
