"use client";

import React from "react";
import { FlowBuilder } from "@/components/flows/flow-builder";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Flow } from "@/types/flow";

export default function NewFlowPage() {
  const router = useRouter();

  const handleSave = (flowData: Partial<Flow>) => {
    toast.success("Flow saved successfully!");
    router.push("/flows");
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-background">
      <FlowBuilder onSave={handleSave} />
    </div>
  );
}
