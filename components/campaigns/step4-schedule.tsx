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
import { ArrowRight, ArrowLeft, Zap, Calendar, Clock, Info } from "lucide-react";
import type { Step4State } from "@/types/campaign";

interface Props {
  value: Step4State;
  onChange: (s: Step4State) => void;
  onNext: () => void;
  onBack: () => void;
}

type Mode = "SEND_NOW" | "SCHEDULED";

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
  // Narrowing for initialization
  const isScheduled = value.mode === "SCHEDULED";
  
  const [mode, setMode] = useState<Mode>(isScheduled ? "SCHEDULED" : "SEND_NOW");
  const [scheduledAt, setScheduledAt] = useState(
    isScheduled ? value.scheduledAt.slice(0, 16) : "",
  );
  const [timezone, setTimezone] = useState(
    isScheduled ? value.timezone : "America/New_York",
  );
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(
    !!value.quietHours,
  );
  const [quietStart, setQuietStart] = useState(value.quietHours?.start ?? "22:00");
  const [quietEnd, setQuietEnd] = useState(value.quietHours?.end ?? "08:00");

  const [endDateEnabled, setEndDateEnabled] = useState(!!value.endDate);
  const [endDate, setEndDate] = useState(value.endDate ? value.endDate.slice(0, 16) : "");

  const canProceed =
    (mode === "SEND_NOW" || (mode === "SCHEDULED" && !!scheduledAt)) &&
    (!endDateEnabled || !!endDate);

  const handleNext = () => {
    const quietHours = quietHoursEnabled
      ? { start: quietStart, end: quietEnd }
      : undefined;
    const finalEndDate = endDateEnabled && endDate ? new Date(endDate).toISOString() : undefined;

    let state: Step4State;
    if (mode === "SEND_NOW") {
      state = { mode: "SEND_NOW", quietHours, endDate: finalEndDate };
    } else {
      state = {
        mode: "SCHEDULED",
        scheduledAt: new Date(scheduledAt).toISOString(),
        timezone,
        quietHours,
        endDate: finalEndDate,
      };
    }
    onChange(state);
    onNext();
  };

  const MODES: { id: Mode; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: "SEND_NOW", label: "Send Immediately", desc: "Deploy right after confirmation", icon: <Zap className="w-4 h-4" /> },
    { id: "SCHEDULED", label: "Schedule", desc: "Pick a date and time", icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Schedule</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose when and how your campaign will be sent.
        </p>
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-2 gap-3">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "flex flex-row items-center gap-3 p-3 rounded-xl border text-left transition-all",
              mode === m.id
                ? "border-primary bg-primary/5 ring-1 ring-primary/30 text-primary"
                : "border-border hover:border-primary/40 hover:bg-muted/30 text-muted-foreground",
            )}
          >
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", mode === m.id ? "bg-primary/15" : "bg-muted")}>
              {m.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{m.label}</p>
              <p className="text-xs opacity-70 mt-0.5 leading-tight">{m.desc}</p>
            </div>
            <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center shrink-0", mode === m.id ? "border-primary" : "border-muted-foreground")}>
              {mode === m.id && <div className="w-2 h-2 bg-primary rounded-full" />}
            </div>
          </button>
        ))}
      </div>

      {/* SEND_NOW info */}
      {mode === "SEND_NOW" && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900 text-sm">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-blue-700 dark:text-blue-300">
            The campaign will be queued immediately after you confirm. Delivery begins within seconds, subject to Meta rate limits.
          </p>
        </div>
      )}

      {/* SCHEDULED fields */}
      {mode === "SCHEDULED" && (
        <div className="space-y-3 p-4 rounded-xl border border-border bg-card">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Scheduled Time
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="sched-at">Date & Time <span className="text-destructive">*</span></Label>
              <Input
                id="sched-at"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-2">
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
        </div>
      )}

      {/* End Date */}
      <div className="space-y-3 p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">End Date & Time</h3>
          </div>
          <button
            onClick={() => setEndDateEnabled((v) => !v)}
            className={cn(
              "relative w-9 h-5 rounded-full transition-colors shrink-0 cursor-pointer",
              endDateEnabled ? "bg-primary" : "bg-muted-foreground/30",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform",
                endDateEnabled ? "translate-x-[18px]" : "translate-x-0.5",
              )}
            />
          </button>
        </div>

        {endDateEnabled && (
          <div className="pt-2">
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-xs">Stop sending after <span className="text-destructive">*</span></Label>
              <Input
                id="end-date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={scheduledAt || new Date().toISOString().slice(0, 16)}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              The campaign will automatically stop sending messages after this date and time.
            </p>
          </div>
        )}
      </div>

      {/* Quiet hours */}
      <div className="space-y-3 p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Quiet Hours</h3>
          </div>
          <button
            onClick={() => setQuietHoursEnabled((v) => !v)}
            className={cn(
              "relative w-9 h-5 rounded-full transition-colors shrink-0 cursor-pointer",
              quietHoursEnabled ? "bg-primary" : "bg-muted-foreground/30",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform",
                quietHoursEnabled ? "translate-x-[18px]" : "translate-x-0.5",
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
