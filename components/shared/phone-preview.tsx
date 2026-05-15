"use client";

import React from "react";
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  FileVideo, 
  FileText, 
  Phone, 
  ExternalLink, 
  MousePointerClick 
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Template } from "@/types/template";

interface PhonePreviewProps {
  senderName?: string;
  template?: Template;
  renderedBody?: string;
  time?: string;
  className?: string;
}

export function PhonePreview({ 
  senderName = "Business", 
  template, 
  renderedBody, 
  time = "12:00 PM",
  className
}: PhonePreviewProps) {
  // Helper to process markdown-like formatting for body
  const formatBody = (text: string) => {
    return text
      .replace(/\*(.+?)\*/g, "<b>$1</b>")
      .replace(/_(.+?)_/g, "<i>$1</i>")
      .replace(/~(.+?)~/g, "<s>$1</s>")
      .replace(/`(.+?)`/g, "<code class='bg-white/10 rounded px-0.5'>$1</code>")
      .replace(/\n/g, "<br />");
  };

  const bodyContent = renderedBody || template?.body || "Message body preview...";

  return (
    <div 
      className={cn(
        "w-[280px] bg-[#111B21] border-[7px] border-[#222] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col shrink-0", 
        className
      )} 
      style={{ height: 560 }}
    >
      {/* WA Header */}
      <div className="h-14 bg-[#1F2C34] flex items-center gap-3 px-3 shrink-0">
        <ArrowLeft className="w-4 h-4 text-[#8696A0]" />
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
          {senderName ? senderName[0].toUpperCase() : "B"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#E9EDEF] text-[13px] font-medium truncate">
            {senderName}
          </p>
          <p className="text-[#8696A0] text-[10px]">Business Account</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto bg-[#0B141A] p-3 flex flex-col gap-2 scrollbar-hide">
        {/* Bubble */}
        <div className="bg-[#1F2C34] rounded-lg rounded-tl-none p-2.5 w-[95%] relative shadow-sm mt-3">
          {/* Tail */}
          <svg viewBox="0 0 8 13" width="8" height="13" className="absolute -left-[7px] top-0 text-[#1F2C34]">
            <path fill="currentColor" d="M1.533 2.568 8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z" />
          </svg>

          {/* Header Preview */}
          {template?.header?.type === "TEXT" && template.header.text && (
            <p className="text-[#E9EDEF] text-[13px] font-bold mb-1">
              {template.header.hasVariable
                ? template.header.text.replace("{{1}}", template.header.exampleValue || "{{1}}")
                : template.header.text}
            </p>
          )}
          {template?.header?.type === "IMAGE" && (
            <div className="w-full h-28 rounded-md bg-[#2A3942] flex items-center justify-center mb-2">
              <ImageIcon className="w-8 h-8 text-[#8696A0]" />
            </div>
          )}
          {template?.header?.type === "VIDEO" && (
            <div className="w-full h-28 rounded-md bg-[#2A3942] flex items-center justify-center mb-2">
              <FileVideo className="w-8 h-8 text-[#8696A0]" />
            </div>
          )}
          {template?.header?.type === "DOCUMENT" && (
            <div className="w-full flex items-center gap-2 bg-[#2A3942] rounded-md p-2 mb-2">
              <FileText className="w-6 h-6 text-[#8696A0] shrink-0" />
              <span className="text-[#E9EDEF] text-[11px] truncate">document.pdf</span>
            </div>
          )}

          {/* Body Preview */}
          <div
            className="text-[#E9EDEF] text-[13px] leading-relaxed break-words"
            dangerouslySetInnerHTML={{ __html: formatBody(bodyContent) }}
          />

          {/* Footer */}
          {template?.footer && (
            <p className="text-[#8696A0] text-[10px] mt-1.5">{template.footer}</p>
          )}

          <div className="text-right text-[#8696A0] text-[10px] mt-1">
            {time}
          </div>
        </div>

        {/* Button Previews */}
        {template?.buttons && template.buttons.length > 0 && (
          <div className="flex flex-col gap-1 w-[95%]">
            {template.buttons.map((btn: any) => (
              <div
                key={btn.id}
                className="bg-[#1F2C34] rounded-lg px-3 py-2 text-center text-[#53BDEB] text-[12px] font-medium flex items-center justify-center gap-1.5 border border-[#2A3942]"
              >
                {btn.type === "PHONE" && <Phone className="w-3 h-3" />}
                {btn.type === "URL" && <ExternalLink className="w-3 h-3" />}
                {btn.type === "QUICK_REPLY" && <MousePointerClick className="w-3 h-3" />}
                {btn.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fake Input Bar */}
      <div className="h-10 bg-[#1F2C34] flex items-center gap-2 px-3 shrink-0 border-t border-[#2A3942]">
        <div className="flex-1 bg-[#2A3942] rounded-full h-6 px-3 flex items-center">
          <span className="text-[#8696A0] text-[10px]">Message</span>
        </div>
      </div>
    </div>
  );
}
