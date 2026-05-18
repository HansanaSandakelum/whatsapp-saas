"use client";

import React, { useState, useEffect } from "react";
import { FlowPhonePreview } from "./flow-phone-preview";
import type { Flow, FlowScreen } from "@/types/flow";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowLeft, CheckCircle2, Smartphone } from "lucide-react";
import { toast } from "sonner";

interface FlowPlayerProps {
  flow: Flow;
}

export function FlowInteractivePlayer({ flow }: FlowPlayerProps) {
  const [screens, setScreens] = useState<FlowScreen[]>([]);
  const [activeScreenId, setActiveScreenId] = useState<string>("");
  const [completed, setCompleted] = useState(false);
  const [submissionData, setSubmissionData] = useState<Record<string, any>>({});

  useEffect(() => {
    // Use flow.screens if they exist, otherwise create fallback mock screens for interactive preview
    if (flow.screens && flow.screens.length > 0) {
      setScreens(flow.screens);
      setActiveScreenId(flow.screens[0].id);
    } else {
      // Generate nice high-fidelity interactive fallback screens for preview
      const fallbackScreens: FlowScreen[] = [
        {
          id: "WELCOME",
          title: "Get Quote",
          layout: {
            type: "SingleColumnLayout",
            children: [
              { type: "Image" },
              { type: "TextHeading", text: `Welcome to ${flow.name}` },
              { type: "TextBody", text: "Get an instant customized quote in just 2 easy steps right here in WhatsApp." },
              {
                type: "Footer",
                label: "Get Started",
                action: { name: "navigate", payload: { screen: "FORM_SCREEN" } },
              },
            ],
          },
        },
        {
          id: "FORM_SCREEN",
          title: "Your Details",
          layout: {
            type: "SingleColumnLayout",
            children: [
              { type: "TextHeading", text: "Basic Information" },
              { type: "TextInput", label: "Full Name", required: true, name: "name" },
              { type: "DatePicker", label: "Date of Birth", required: true, name: "dob" },
              {
                type: "Dropdown",
                label: "Product Category",
                name: "cat",
                options: [{ id: "1", title: "Premium" }, { id: "2", title: "Standard" }],
              },
              {
                type: "Footer",
                label: "Next Step",
                action: { name: "navigate", payload: { screen: "CONFIRM" } },
              },
            ],
          },
        },
        {
          id: "CONFIRM",
          title: "Confirmation",
          terminal: true,
          layout: {
            type: "SingleColumnLayout",
            children: [
              { type: "TextHeading", text: "Review & Submit" },
              {
                type: "RadioButtons",
                label: "Select Plan Type",
                name: "plan",
                options: [{ id: "a", title: "Monthly ($15/mo)" }, { id: "b", title: "Annual ($120/yr)" }],
              },
              { type: "CheckboxGroup", label: "Agreements", options: [{ id: "1", title: "I accept the Terms of Service" }] },
              {
                type: "Footer",
                label: "Submit Application",
                action: { name: "complete" },
              },
            ],
          },
        },
      ];
      setScreens(fallbackScreens);
      setActiveScreenId(fallbackScreens[0].id);
    }
  }, [flow]);

  const activeScreen = screens.find((s) => s.id === activeScreenId);

  const handleFooterClick = (index: number) => {
    if (!activeScreen) return;
    const footer = activeScreen.layout.children[index];
    if (footer?.type !== "Footer") return;

    if (footer.action?.name === "navigate" && footer.action.payload?.screen) {
      setActiveScreenId(footer.action.payload.screen);
    } else if (footer.action?.name === "complete" || !footer.action) {
      setCompleted(true);
      toast.success("Flow completed in preview!");
    }
  };

  const handleReset = () => {
    if (screens.length > 0) {
      setActiveScreenId(screens[0].id);
      setCompleted(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-[360px] mx-auto">
      
      {completed ? (
        <div className="w-[300px] h-[600px] rounded-[2.5rem] border-[8px] border-[#222] bg-[#0B141A] flex flex-col items-center justify-center p-8 text-center shadow-2xl relative ring-4 ring-black/5 overflow-hidden">
          {/* WhatsApp header stub */}
          <div className="absolute top-0 left-0 w-full h-6 bg-[#1F2C34]" />
          <div className="absolute top-6 left-0 w-full h-14 bg-[#1F2C34] border-b border-[#2A3942]" />
          
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mb-4 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-[#E9EDEF] font-bold text-lg mb-2">Response Submitted</h3>
          <p className="text-[#8696A0] text-xs leading-relaxed mb-8">
            Your interaction simulated a completed flow. The payload has been successfully packed and sent back to the business.
          </p>
          
          <Button variant="outline" size="sm" onClick={handleReset} className="border-[#2A3942] bg-[#1F2C34] hover:bg-[#2A3942] text-[#E9EDEF]">
            <RotateCcw className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Play Again
          </Button>
        </div>
      ) : activeScreen ? (
        <div className="relative group">
          <FlowPhonePreview
            screen={activeScreen}
            onComponentClick={(idx) => {
              const comp = activeScreen.layout.children[idx];
              if (comp.type === "Footer") {
                handleFooterClick(idx);
              }
            }}
          />
          
          {/* Dynamic interactive tag */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide flex items-center gap-1 border border-white/10 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <Smartphone className="w-3 h-3" />
            Interactive Preview
          </div>
        </div>
      ) : (
        <div className="w-[300px] h-[600px] border-2 border-dashed border-border rounded-[2.5rem] flex items-center justify-center bg-muted/10">
          <span className="text-xs text-muted-foreground animate-pulse">Loading player...</span>
        </div>
      )}

      {activeScreen && !completed && (
        <div className="flex items-center gap-2 bg-muted/30 border px-3 py-1.5 rounded-full text-[11px] text-muted-foreground w-full max-w-fit shadow-sm">
          <span className="font-semibold text-foreground">Steps:</span>
          <span>{screens.indexOf(activeScreen) + 1} / {screens.length}</span>
          {screens.indexOf(activeScreen) > 0 && (
            <>
              <span className="opacity-30">|</span>
              <button
                onClick={() => {
                  const currentIdx = screens.indexOf(activeScreen);
                  setActiveScreenId(screens[currentIdx - 1].id);
                }}
                className="hover:text-primary transition-colors font-medium"
              >
                Back
              </button>
            </>
          )}
          <span className="opacity-30">|</span>
          <button onClick={handleReset} className="hover:text-primary transition-colors font-medium">
            Restart
          </button>
        </div>
      )}
    </div>
  );
}
