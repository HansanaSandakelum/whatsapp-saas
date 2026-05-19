"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Smartphone, Image as ImageIcon, FileVideo, FileText, ExternalLink, MousePointerClick, Phone as PhoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getTemplateById } from "@/data/templates";
import { Step1Basics } from "@/components/campaigns/step1-basics";
import { Step3Variables } from "@/components/campaigns/step3-variables";
import { Step4Schedule } from "@/components/campaigns/step4-schedule";
import { Step5Review } from "@/components/campaigns/step5-review";
import { PhonePreview } from "@/components/shared/phone-preview";
import type { Step1State, Step2State, Step4State, VariableMapping } from "@/types/campaign";

export type WizardState = {
  step1: Step1State;
  step2: Step2State | null;
  step3: VariableMapping;
  step4: Step4State;
};

const STEPS = [
  { id: 1, label: "Basics", desc: "Name & template" },
  { id: 2, label: "Variables", desc: "Upload CSV & personalize" },
  { id: 3, label: "Schedule", desc: "When to send" },
  { id: 4, label: "Review", desc: "Confirm & launch" },
];

const DEFAULT_STATE: WizardState = {
  step1: { name: "", senderId: "", templateId: "" },
  step2: null,
  step3: {},
  step4: { mode: "SEND_NOW" },
};

export default function NewCampaignPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [state, setState] = useState<WizardState>(DEFAULT_STATE);

  const { data: template } = useQuery({
    queryKey: ["template", state.step1.templateId],
    queryFn: () => getTemplateById(state.step1.templateId),
    enabled: !!state.step1.templateId,
  });

  const updateStep1 = (s: Step1State) => setState((p) => ({ ...p, step1: s }));
  const updateStep2 = (s: Step2State) => setState((p) => ({ ...p, step2: s }));
  const updateStep3 = (s: VariableMapping) =>
    setState((p) => ({ ...p, step3: s }));
  const updateStep4 = (s: Step4State) => setState((p) => ({ ...p, step4: s }));

  const goTo = (n: 1 | 2 | 3 | 4) => setStep(n);
  const next = () => setStep((s) => Math.min(s + 1, 4) as 1 | 2 | 3 | 4);
  const back = () => setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3 | 4);

  const renderedHeader = useMemo(() => {
    if (!template?.header || template.header.type !== "TEXT") return undefined;
    if (!template.header.hasVariable) return template.header.text;
    
    const hm = state.step3["header:{{1}}"];
    const val = hm?.kind === "literal" ? `<span class="text-emerald-400 font-bold">${hm.value}</span>`
      : hm?.kind === "contact_field" ? `<span class="text-blue-400 font-bold">[${hm.field}]</span>`
      : `<span class="text-primary font-bold">{{1}}</span>`;
    
    return (template.header.text ?? "").replace("{{1}}", val);
  }, [template, state.step3]);

  const renderedBody = useMemo(() => {
    if (!template) return "";
    let text = template.body;
    
    Object.entries(state.step3).forEach(([v, m]) => {
      if (v.startsWith("header:")) return;
      
      let replacement = `<span class="bg-primary/20 text-primary px-1 rounded font-bold">${v}</span>`;
      if (m.kind === "literal") {
        replacement = `<span class="bg-emerald-500/20 text-emerald-500 px-1 rounded font-bold border border-emerald-500/30">${m.value}</span>`;
      } else if (m.kind === "contact_field") {
        replacement = `<span class="bg-blue-500/20 text-blue-500 px-1 rounded font-bold border border-blue-500/30">[${m.field}]</span>`;
      }
      text = text.replaceAll(v, replacement);
    });
    
    return text;
  }, [template, state.step3]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-muted/20">
      {/* ── Sticky header ── */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b bg-background sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            render={<Link href="/campaigns" />}
            nativeButton={false}
            className="rounded-full h-8 w-8"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-base font-semibold leading-tight">
              Create Campaign
            </h1>
            <p className="text-xs text-muted-foreground">
              Step {step} of {STEPS.length} — {STEPS[step - 1].label}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="hidden sm:flex items-center gap-2 w-64">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {step}/{STEPS.length}
          </span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* ── Sidebar stepper ── */}
        <aside className="w-56 border-r bg-background p-5 flex flex-col gap-1 hidden md:flex shrink-0">
          {STEPS.map((s, i) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="relative">
                <button
                  onClick={() => done && goTo(s.id as 1 | 2 | 3 | 4)}
                  disabled={!done}
                  className={cn(
                    "w-full flex items-start gap-3 py-2.5 px-2 rounded-lg transition-colors text-left",
                    active && "bg-primary/8 text-primary",
                    done && "hover:bg-muted/60 cursor-pointer text-foreground",
                    !done && !active && "text-muted-foreground cursor-default",
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-semibold",
                      active && "border-primary bg-primary text-white",
                      done && "border-primary text-primary bg-primary/10",
                      !done && !active && "border-muted-foreground/50",
                    )}
                  >
                    {done ? <CheckCircle2 className="w-3 h-3" /> : s.id}
                  </div>
                  <div>
                    <p className="text-xs font-medium leading-none">
                      {s.label}
                    </p>
                    <p className="text-[11px] opacity-70 mt-0.5">{s.desc}</p>
                  </div>
                </button>
                {i < STEPS.length - 1 && (
                  <div className="absolute left-[18px] top-[36px] w-px h-3 bg-border" />
                )}
              </div>
            );
          })}
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto min-w-0">
          <div className="max-w-3xl mx-auto px-4 py-8">
            {step === 1 && (
              <Step1Basics
                value={state.step1}
                onChange={updateStep1}
                onNext={next}
              />
            )}
            {step === 2 && (
              <Step3Variables
                templateId={state.step1.templateId}
                value={state.step3}
                onChange={updateStep3}
                audienceValue={state.step2}
                onChangeAudience={updateStep2}
                onNext={next}
                onBack={back}
              />
            )}
            {step === 3 && (
              <Step4Schedule
                value={state.step4}
                onChange={updateStep4}
                onNext={next}
                onBack={back}
              />
            )}
            {step === 4 && <Step5Review state={state} onBack={back} />}
          </div>
        </main>

        {/* ── Right sidebar: Template Preview ── */}
        <aside className="w-72 xl:w-80 border-l bg-muted/10 p-4 xl:p-5 hidden lg:flex flex-col items-center shrink-0 overflow-y-auto">
          <div className="sticky top-0 w-full flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 self-start">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Template Preview
              </span>
            </div>

            {state.step1.templateId ? (
              template ? (
                <PhonePreview 
                  senderName={state.step1.senderId || "Business"}
                  template={template as any}
                  renderedHeader={renderedHeader}
                  renderedBody={renderedBody}
                  className="w-full scale-[0.9] origin-top"
                />
              ) : (
                <div className="w-full aspect-[9/16] rounded-[2rem] border border-border bg-background/50 flex flex-col items-center justify-center p-6 text-center gap-3 animate-pulse">
                  <Smartphone className="w-6 h-6 text-muted-foreground/20" />
                  <p className="text-[10px] text-muted-foreground/40 font-medium italic">Loading template...</p>
                </div>
              )
            ) : (
              <div className="w-full aspect-[9/16] rounded-[2rem] border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center p-6 text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">No template selected</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">Select a template in step 1 to see the preview here.</p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
