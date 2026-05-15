"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTemplates } from "@/data/templates";
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
import { ArrowRight, ArrowLeft, Loader2, Variable, Link2 } from "lucide-react";
import type { VariableMapping } from "@/types/campaign";

interface Props {
  templateId: string;
  value: VariableMapping;
  onChange: (m: VariableMapping) => void;
  onNext: () => void;
  onBack: () => void;
}

const CONTACT_FIELDS = [
  { key: "first_name", label: "First Name" },
  { key: "last_name", label: "Last Name" },
  { key: "phone", label: "Phone Number" },
  { key: "email", label: "Email" },
];

// Extracts {{1}}, {{2}}, etc. from template body
function extractVariables(body: string): string[] {
  const matches = body.match(/\{\{\d+\}\}/g) ?? [];
  return [...new Set(matches)].sort((a, b) => {
    const na = parseInt(a.replace(/[{}]/g, ""));
    const nb = parseInt(b.replace(/[{}]/g, ""));
    return na - nb;
  });
}

export function Step3Variables({ templateId, value, onChange, onNext, onBack }: Props) {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["templates", { status: "approved" }],
    queryFn: () => getTemplates({ status: "approved" }),
  });

  const template = templates?.find((t) => t.id === templateId);
  const variables = template ? extractVariables(template.body) : [];

  const [mapping, setMapping] = useState<Record<string, { source: "contact_field" | "literal"; field?: string; value?: string }>>(
    () => {
      const init: Record<string, { source: "contact_field" | "literal"; field?: string; value?: string }> = {};
      variables.forEach((v) => {
        const existing = value[v];
        if (existing) {
          if (existing.kind === "contact_field") init[v] = { source: "contact_field", field: existing.field };
          else if (existing.kind === "literal") init[v] = { source: "literal", value: existing.value };
        } else {
          init[v] = { source: "contact_field", field: "first_name" };
        }
      });
      return init;
    },
  );

  // Auto-init when template loads
  useEffect(() => {
    if (variables.length > 0) {
      setMapping((prev) => {
        const next = { ...prev };
        variables.forEach((v) => {
          if (!next[v]) next[v] = { source: "contact_field", field: "first_name" };
        });
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, template?.body]);

  const setVarSource = (variable: string, source: "contact_field" | "literal") =>
    setMapping((p) => ({ ...p, [variable]: { ...p[variable], source } }));

  const setVarField = (variable: string, field: string) =>
    setMapping((p) => ({ ...p, [variable]: { ...p[variable], field } }));

  const setVarValue = (variable: string, val: string) =>
    setMapping((p) => ({ ...p, [variable]: { ...p[variable], value: val } }));

  const canProceed =
    variables.length === 0 ||
    variables.every((v) => {
      const m = mapping[v];
      if (!m) return false;
      if (m.source === "contact_field") return !!m.field;
      if (m.source === "literal") return !!m.value?.trim();
      return true;
    });

  const handleNext = () => {
    const result: VariableMapping = {};
    variables.forEach((v) => {
      const m = mapping[v];
      if (m?.source === "contact_field" && m.field) {
        result[v] = { kind: "contact_field", field: m.field };
      } else if (m?.source === "literal" && m.value) {
        result[v] = { kind: "literal", value: m.value };
      }
    });
    onChange(result);
    onNext();
  };

  // Build preview with substitutions
  const previewBody = template
    ? variables.reduce((body, v) => {
        const m = mapping[v];
        let replacement = v;
        if (m?.source === "contact_field" && m.field) {
          replacement = `[${CONTACT_FIELDS.find((f) => f.key === m.field)?.label ?? m.field}]`;
        } else if (m?.source === "literal" && m.value) {
          replacement = m.value;
        }
        return body.replaceAll(v, `<mark>${replacement}</mark>`);
      }, template.body)
    : "";

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-20 justify-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading template…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Personalize Variables</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Map each template placeholder to a contact field or a fixed value.
        </p>
      </div>

      {variables.length === 0 ? (
        <div className="p-8 rounded-xl border border-dashed bg-muted/20 text-center">
          <Variable className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">No variables in this template</p>
          <p className="text-xs text-muted-foreground mt-1">The selected template has no placeholders — you can skip this step.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-3">Variable</div>
            <div className="col-span-4">Source</div>
            <div className="col-span-5">Mapping</div>
          </div>
          <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
            {variables.map((variable) => {
              const m = mapping[variable] ?? { source: "contact_field" as const };
              // Get context: find variable in body and get 20 chars around it
              const varIdx = template?.body.indexOf(variable) ?? -1;
              const context = varIdx !== -1 
                ? "…" + template?.body.slice(Math.max(0, varIdx - 15), Math.min(template.body.length, varIdx + variable.length + 15)).replace(variable, `<b class="text-primary">${variable}</b>`) + "…"
                : "";

              return (
                <div key={variable} className="grid grid-cols-12 gap-4 px-5 py-3 items-center">
                  <div className="col-span-3 space-y-1">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold w-fit">
                      {variable}
                    </span>
                    {context && (
                      <p 
                        className="text-[10px] text-muted-foreground leading-tight italic line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: context }}
                      />
                    )}
                  </div>
                  
                  <div className="col-span-4 flex gap-1">
                    <button
                      onClick={() => setVarSource(variable, "contact_field")}
                      className={cn(
                        "px-2 py-1 rounded text-[10px] font-medium border transition-all",
                        m.source === "contact_field"
                          ? "bg-primary text-white border-primary"
                          : "border-border hover:border-primary/40 text-muted-foreground",
                      )}
                    >
                      Field
                    </button>
                    <button
                      onClick={() => setVarSource(variable, "literal")}
                      className={cn(
                        "px-2 py-1 rounded text-[10px] font-medium border transition-all",
                        m.source === "literal"
                          ? "bg-primary text-white border-primary"
                          : "border-border hover:border-primary/40 text-muted-foreground",
                      )}
                    >
                      Fixed
                    </button>
                  </div>

                  <div className="col-span-5">
                    {m.source === "contact_field" ? (
                      <Select value={m.field ?? ""} onValueChange={(v) => v && setVarField(variable, v)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Field…" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTACT_FIELDS.map((f) => (
                            <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="Value…"
                        value={m.value ?? ""}
                        onChange={(e) => setVarValue(variable, e.target.value)}
                        className="h-8 text-xs"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live preview */}
      {/* {template && variables.length > 0 && (
        <div className="p-4 rounded-xl border border-border bg-card space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Message Preview</p>
          {template.header?.text && (
            <p className="text-sm font-semibold">{template.header.text}</p>
          )}
          <p
            className="text-sm text-foreground leading-relaxed [&_mark]:bg-primary/20 [&_mark]:text-primary [&_mark]:rounded [&_mark]:px-0.5"
            dangerouslySetInnerHTML={{ __html: previewBody }}
          />
          {template.footer && (
            <p className="text-xs text-muted-foreground border-t pt-2 mt-2">{template.footer}</p>
          )}
        </div>
      )} */}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={handleNext} disabled={!canProceed} className="gap-2 px-6">
          Next: Schedule <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
