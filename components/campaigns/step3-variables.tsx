"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTemplates } from "@/data/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft, Loader2, Variable, Type } from "lucide-react";
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

// Extracts {{1}}, {{2}}, etc. from a string
function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{\d+\}\}/g) ?? [];
  return [...new Set(matches)].sort((a, b) => {
    const na = parseInt(a.replace(/[{}]/g, ""));
    const nb = parseInt(b.replace(/[{}]/g, ""));
    return na - nb;
  });
}

type VarEntry = { source: "contact_field" | "literal"; field?: string; value?: string };
type VarMap = Record<string, VarEntry>;

/** Convert internal VarMap to the VariableMapping format used by the rest of the wizard */
function toVariableMapping(map: VarMap): VariableMapping {
  const result: VariableMapping = {};
  Object.entries(map).forEach(([key, m]) => {
    if (m.source === "contact_field" && m.field) {
      result[key] = { kind: "contact_field", field: m.field };
    } else if (m.source === "literal" && m.value) {
      result[key] = { kind: "literal", value: m.value };
    }
  });
  return result;
}

/** Convert incoming VariableMapping back to VarMap for internal state */
function fromVariableMapping(existing: VariableMapping, keys: string[]): VarMap {
  const init: VarMap = {};
  keys.forEach((k) => {
    const e = existing[k];
    if (e?.kind === "contact_field") init[k] = { source: "contact_field", field: e.field };
    else if (e?.kind === "literal") init[k] = { source: "literal", value: e.value };
    else init[k] = { source: "contact_field", field: "first_name" };
  });
  return init;
}

export function Step3Variables({ templateId, value, onChange, onNext, onBack }: Props) {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["templates", { status: "approved" }],
    queryFn: () => getTemplates({ status: "approved" }),
  });

  const template = templates?.find((t) => t.id === templateId);

  // Body variables: {{1}}, {{2}}, …
  const bodyVars = template ? extractVariables(template.body) : [];

  // Header variable: only TEXT headers with hasVariable=true have {{1}}
  // We store them with a "header:" prefix key to distinguish from body vars
  const headerVar =
    template?.header?.type === "TEXT" && template.header.hasVariable
      ? "{{1}}" // Meta allows exactly one variable in header
      : null;
  const headerKey = headerVar ? `header:${headerVar}` : null; // e.g. "header:{{1}}"

  // All keys we need to map
  const allKeys = [
    ...(headerKey ? [headerKey] : []),
    ...bodyVars,
  ];

  const [mapping, setMapping] = useState<VarMap>(() =>
    fromVariableMapping(value, allKeys)
  );

  // Re-init when template loads
  useEffect(() => {
    if (allKeys.length > 0) {
      setMapping((prev) => {
        const next = { ...prev };
        allKeys.forEach((k) => {
          if (!next[k]) next[k] = { source: "contact_field", field: "first_name" };
        });
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, template?.body, template?.header?.text]);

  const setVarSource = (key: string, source: "contact_field" | "literal") =>
    setMapping((p) => ({ ...p, [key]: { ...p[key], source } }));
  const setVarField = (key: string, field: string) =>
    setMapping((p) => ({ ...p, [key]: { ...p[key], field } }));
  const setVarValue = (key: string, val: string) =>
    setMapping((p) => ({ ...p, [key]: { ...p[key], value: val } }));

  const canProceed =
    allKeys.length === 0 ||
    allKeys.every((k) => {
      const m = mapping[k];
      if (!m) return false;
      if (m.source === "contact_field") return !!m.field;
      if (m.source === "literal") return !!m.value?.trim();
      return true;
    });

  const handleNext = () => {
    onChange(toVariableMapping(mapping));
    onNext();
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-20 justify-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading template…
      </div>
    );
  }

  const hasNoVars = allKeys.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Personalize Variables</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Map each template placeholder to a contact field or a fixed value.
        </p>
      </div>

      {hasNoVars ? (
        <div className="p-8 rounded-xl border border-dashed bg-muted/20 text-center">
          <Variable className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">No variables in this template</p>
          <p className="text-xs text-muted-foreground mt-1">
            The selected template has no placeholders — you can skip this step.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* ── Header Variable Section ── */}
          {headerKey && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b bg-primary/5">
                <Type className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Header Variable
                </span>
                <span className="ml-auto text-[10px] text-muted-foreground italic">
                  Meta allows 1 variable in text headers
                </span>
              </div>
              {/* Header preview text */}
              {template?.header?.text && (
                <div className="px-5 py-2 border-b bg-muted/20 text-[11px] text-muted-foreground">
                  Template header:{" "}
                  <span className="font-mono text-foreground">{template.header.text}</span>
                </div>
              )}
              <div className="divide-y divide-border">
                <VarRow
                  varKey={headerKey}
                  displayLabel="{{1}}"
                  context={template?.header?.text}
                  mapping={mapping}
                  onSourceChange={setVarSource}
                  onFieldChange={setVarField}
                  onValueChange={setVarValue}
                />
              </div>
            </div>
          )}

          {/* ── Body Variables Section ── */}
          {bodyVars.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b bg-muted/30">
                <Variable className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Body Variables
                </span>
                <span className="ml-auto text-[10px] text-muted-foreground italic">
                  {bodyVars.length} variable{bodyVars.length !== 1 ? "s" : ""} detected
                </span>
              </div>
              {/* Column headers */}
              <div className="grid grid-cols-12 gap-4 px-5 py-2 border-b bg-muted/10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <div className="col-span-3">Variable</div>
                <div className="col-span-4">Source</div>
                <div className="col-span-5">Mapping</div>
              </div>
              <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                {bodyVars.map((variable) => {
                  const varIdx = template?.body.indexOf(variable) ?? -1;
                  const context =
                    varIdx !== -1
                      ? "…" +
                        template?.body
                          .slice(
                            Math.max(0, varIdx - 15),
                            Math.min(template.body.length, varIdx + variable.length + 15)
                          )
                          .replace(
                            variable,
                            `<b class="text-primary">${variable}</b>`
                          ) +
                        "…"
                      : "";
                  return (
                    <VarRow
                      key={variable}
                      varKey={variable}
                      displayLabel={variable}
                      context={context}
                      mapping={mapping}
                      onSourceChange={setVarSource}
                      onFieldChange={setVarField}
                      onValueChange={setVarValue}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

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

// ── Shared row component ────────────────────────────────────────────────────

interface VarRowProps {
  varKey: string;
  displayLabel: string;
  context?: string;
  mapping: VarMap;
  onSourceChange: (key: string, source: "contact_field" | "literal") => void;
  onFieldChange: (key: string, field: string) => void;
  onValueChange: (key: string, val: string) => void;
}

function VarRow({ varKey, displayLabel, context, mapping, onSourceChange, onFieldChange, onValueChange }: VarRowProps) {
  const m = mapping[varKey] ?? { source: "contact_field" as const };
  return (
    <div className="grid grid-cols-12 gap-4 px-5 py-3 items-center">
      <div className="col-span-3 space-y-1">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono font-bold w-fit">
          {displayLabel}
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
          onClick={() => onSourceChange(varKey, "contact_field")}
          className={cn(
            "px-2 py-1 rounded text-[10px] font-medium border transition-all",
            m.source === "contact_field"
              ? "bg-primary text-white border-primary"
              : "border-border hover:border-primary/40 text-muted-foreground"
          )}
        >
          Field
        </button>
        <button
          onClick={() => onSourceChange(varKey, "literal")}
          className={cn(
            "px-2 py-1 rounded text-[10px] font-medium border transition-all",
            m.source === "literal"
              ? "bg-primary text-white border-primary"
              : "border-border hover:border-primary/40 text-muted-foreground"
          )}
        >
          Fixed
        </button>
      </div>

      <div className="col-span-5">
        {m.source === "contact_field" ? (
          <Select value={m.field ?? ""} onValueChange={(v) => v && onFieldChange(varKey, v)}>
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
            onChange={(e) => onValueChange(varKey, e.target.value)}
            className="h-8 text-xs"
          />
        )}
      </div>
    </div>
  );
}
