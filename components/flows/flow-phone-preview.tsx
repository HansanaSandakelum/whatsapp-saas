"use client";

import React from "react";
import { ArrowLeft, ChevronRight, Calendar, ChevronDown, Image as ImageIcon, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlowScreen, FlowComponent } from "@/types/flow";

interface FlowPhonePreviewProps {
  screen?: FlowScreen;
  className?: string;
  onComponentClick?: (componentIndex: number) => void;
  activeComponentIndex?: number | null;
}

export function FlowPhonePreview({
  screen,
  className,
  onComponentClick,
  activeComponentIndex,
}: FlowPhonePreviewProps) {
  // Mock rendering of flow components inside device frame
  const renderComponent = (comp: FlowComponent, index: number) => {
    const isActive = activeComponentIndex === index;

    const baseWrapperClass = cn(
      "relative p-2 rounded-md border border-transparent transition-all group/comp",
      onComponentClick && "cursor-pointer hover:bg-muted/10 hover:border-dashed hover:border-muted-foreground/30",
      isActive && "bg-primary/5 border-solid border-primary ring-1 ring-primary/40"
    );

    const renderField = () => {
      switch (comp.type) {
        case "TextHeading":
          return (
            <h2 className="text-[#E9EDEF] text-lg font-bold leading-snug mb-1">
              {comp.text || "Heading Text"}
            </h2>
          );
        case "TextBody":
          return (
            <p className="text-[#8696A0] text-xs leading-relaxed">
              {comp.text || "Body text paragraph goes here."}
            </p>
          );
        case "TextInput":
        case "TextArea":
          return (
            <div className="space-y-1.5">
              <label className="text-[#8696A0] text-[11px] font-medium">
                {comp.label || "Input Label"}{comp.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <div className={cn(
                "w-full bg-[#2A3942] rounded-md border border-[#374248] px-3 text-[#E9EDEF] text-xs flex items-center",
                comp.type === "TextArea" ? "h-20 py-2 items-start" : "h-10"
              )}>
                <span className="opacity-40">
                  {comp.type === "TextArea" ? "Enter details..." : "Type here..."}
                </span>
              </div>
            </div>
          );
        case "Dropdown":
          return (
            <div className="space-y-1.5">
              <label className="text-[#8696A0] text-[11px] font-medium">
                {comp.label || "Select Option"}{comp.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <div className="w-full h-10 bg-[#2A3942] rounded-md border border-[#374248] px-3 flex items-center justify-between text-xs text-[#E9EDEF]">
                <span className="opacity-40">Select an option</span>
                <ChevronDown className="w-4 h-4 opacity-60" />
              </div>
            </div>
          );
        case "DatePicker":
          return (
            <div className="space-y-1.5">
              <label className="text-[#8696A0] text-[11px] font-medium">
                {comp.label || "Pick a date"}{comp.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <div className="w-full h-10 bg-[#2A3942] rounded-md border border-[#374248] px-3 flex items-center justify-between text-xs text-[#E9EDEF]">
                <span className="opacity-40">YYYY-MM-DD</span>
                <Calendar className="w-4 h-4 opacity-60 text-primary" />
              </div>
            </div>
          );
        case "RadioButtons":
          return (
            <div className="space-y-2">
              <label className="text-[#8696A0] text-[11px] font-medium block">
                {comp.label || "Choose one"}{comp.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <div className="space-y-2">
                {(comp.options || [{ id: "1", title: "Option A" }, { id: "2", title: "Option B" }]).map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2 text-xs text-[#E9EDEF]">
                    <div className="w-4 h-4 rounded-full border border-[#8696A0] flex items-center justify-center">
                      {opt.id === "1" && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                    </div>
                    <span>{opt.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        case "CheckboxGroup":
          return (
            <div className="space-y-2">
              <label className="text-[#8696A0] text-[11px] font-medium block">
                {comp.label || "Select multiple"}{comp.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <div className="space-y-2">
                {(comp.options || [{ id: "1", title: "Option 1" }, { id: "2", title: "Option 2" }]).map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2 text-xs text-[#E9EDEF]">
                    <div className="w-4 h-4 rounded border border-[#8696A0] flex items-center justify-center bg-[#2A3942]">
                      {opt.id === "1" && <div className="w-2.5 h-2.5 bg-emerald-500 flex items-center justify-center text-[8px] text-white font-bold">✓</div>}
                    </div>
                    <span>{opt.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        case "Image":
          return (
            <div className="w-full h-28 rounded-lg bg-[#2A3942] border border-[#374248] flex flex-col items-center justify-center text-[#8696A0] gap-1">
              <ImageIcon className="w-6 h-6 opacity-60" />
              <span className="text-[10px]">Image component</span>
            </div>
          );
        case "Footer":
          // Handled separately at the bottom of the screen usually, but rendered inline if in tree
          return (
            <div className="w-full bg-emerald-500 py-2.5 rounded-full text-center text-white text-sm font-semibold shadow-sm">
              {comp.label || "Submit"}
            </div>
          );
        default:
          return (
            <div className="p-2 border border-dashed border-red-500/30 text-xs text-red-400">
              Unknown component: {comp.type}
            </div>
          );
      }
    };

    return (
      <div 
        key={`${comp.type}-${index}`} 
        className={baseWrapperClass}
        onClick={(e) => {
          e.stopPropagation();
          onComponentClick?.(index);
        }}
      >
        {/* Active badge indicator for builder */}
        {isActive && (
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground px-1 text-[9px] rounded font-medium uppercase tracking-wider z-10">
            {comp.type.replace(/Text/i, "")}
          </div>
        )}
        {renderField()}
      </div>
    );
  };

  const footerComponent = screen?.layout.children.find(c => c.type === "Footer");
  const nonFooterComponents = screen?.layout.children.filter(c => c.type !== "Footer") || [];

  return (
    <div 
      className={cn(
        "w-[300px] bg-[#111B21] border-[8px] border-[#222] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col shrink-0 relative select-none ring-4 ring-black/5", 
        className
      )} 
      style={{ height: 600 }}
    >
      {/* Notch / Top status bar mockup */}
      <div className="h-6 bg-[#1F2C34] w-full shrink-0 flex items-center justify-between px-5 text-[10px] text-[#8696A0] font-medium">
        <span>9:41</span>
        <div className="flex gap-1 items-center">
          <span>WiFi</span>
          <span>100%</span>
        </div>
      </div>

      {/* WA Header for Flow */}
      <div className="h-14 bg-[#1F2C34] flex items-center gap-4 px-4 border-b border-[#2A3942] shrink-0">
        <ArrowLeft className="w-5 h-5 text-emerald-500 stroke-[2.5]" />
        <div className="flex-1 min-w-0">
          <p className="text-[#E9EDEF] text-sm font-semibold truncate">
            {screen?.title || "Flow Screen"}
          </p>
        </div>
        <HelpCircle className="w-5 h-5 text-[#8696A0]" />
      </div>

      {/* Flow Scrollable Canvas */}
      <div className="flex-1 overflow-y-auto bg-[#0B141A] p-4 flex flex-col gap-4 scrollbar-hide pb-20">
        {nonFooterComponents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground px-4 border border-dashed border-border rounded-xl bg-[#1F2C34]/30">
            <HelpCircle className="w-6 h-6 mb-2 opacity-40" />
            <p className="text-xs">No components on this screen.</p>
            <p className="text-[10px] opacity-60 mt-0.5">Click components on the builder right panel to add them.</p>
          </div>
        ) : (
          nonFooterComponents.map((comp, idx) => renderComponent(comp, idx))
        )}
      </div>

      {/* Flow Fixed Sticky Footer Button */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#0B141A] p-4 border-t border-[#1F2C34] bg-gradient-to-t from-[#0B141A] via-[#0B141A]/95 to-[#0B141A]/80">
        {footerComponent ? (
          <div 
            className={cn(
              "w-full bg-emerald-500 py-2.5 rounded-full text-center text-white text-xs font-semibold hover:brightness-105 cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center shadow-md shadow-emerald-900/20",
              activeComponentIndex === screen?.layout.children.indexOf(footerComponent) && "ring-2 ring-primary ring-offset-2 ring-offset-[#0B141A]"
            )}
            onClick={(e) => {
              e.stopPropagation();
              if (screen) {
                const idx = screen.layout.children.indexOf(footerComponent);
                onComponentClick?.(idx);
              }
            }}
          >
            {footerComponent.label || "Next"}
          </div>
        ) : (
          <div className="w-full bg-[#2A3942] py-2.5 rounded-full text-center text-[#8696A0] text-xs font-medium border border-dashed border-[#374248]">
            + Add Footer Button
          </div>
        )}
      </div>
    </div>
  );
}
