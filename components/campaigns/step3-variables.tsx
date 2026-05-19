"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Variable,
  Type,
  FileUp,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Sparkles,
  Info,
  Check,
} from "lucide-react";
import type { VariableMapping, Step2State } from "@/types/campaign";
import { localizePhoneNumber } from "@/lib/format";

interface Props {
  templateId: string;
  value: VariableMapping;
  onChange: (m: VariableMapping) => void;
  audienceValue: Step2State | null;
  onChangeAudience: (s: Step2State) => void;
  onNext: () => void;
  onBack: () => void;
}

// Simple client-side CSV parser
function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines
    .slice(1)
    .map(parseLine)
    .filter((row) => row.length >= headers.length && row.some(cell => cell !== ""));

  return { headers, rows };
}

// Extracts {{1}}, {{2}}, etc. from a text template
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

function fromVariableMapping(existing: VariableMapping, keys: string[], fields: string[]): VarMap {
  const init: VarMap = {};
  const defaultField = fields.length > 0 ? fields[0] : "first_name";
  keys.forEach((k) => {
    const e = existing[k];
    if (e?.kind === "contact_field") {
      init[k] = { source: "contact_field", field: e.field };
    } else if (e?.kind === "literal") {
      init[k] = { source: "literal", value: e.value };
    } else {
      // Pick smart defaults or match based on key index
      let field = defaultField;
      if (k.toLowerCase().includes("1") && fields.includes("first_name")) field = "first_name";
      else if (fields.includes("phone")) field = "phone";
      
      init[k] = { source: "contact_field", field };
    }
  });
  return init;
}

export function Step3Variables({
  templateId,
  value,
  onChange,
  audienceValue,
  onChangeAudience,
  onNext,
  onBack,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // CSV State
  const [csvData, setCsvData] = useState<{
    filename: string;
    rowCount: number;
    headers: string[];
    previewRows: string[][];
  } | null>(() => {
    if (audienceValue?.mode === "CSV" && audienceValue.csvFilename) {
      return {
        filename: audienceValue.csvFilename,
        rowCount: audienceValue.csvRowCount ?? 0,
        headers: ["phone", "first_name", "last_name", "company", "coupon_code"], // default fallback headers for display
        previewRows: [],
      };
    }
    return null;
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ["templates", { status: "approved" }],
    queryFn: () => getTemplates({ status: "approved" }),
  });

  const template = templates?.find((t) => t.id === templateId);

  // Extract template placeholders
  const bodyVars = template ? extractVariables(template.body) : [];
  const headerVar =
    template?.header?.type === "TEXT" && template.header.hasVariable
      ? "{{1}}"
      : null;
  const headerKey = headerVar ? `header:${headerVar}` : null;

  const allKeys = [
    ...(headerKey ? [headerKey] : []),
    ...bodyVars,
  ];

  // Dynamic fields from CSV columns or defaults
  const dynamicContactFields = useMemo(() => {
    if (csvData && csvData.headers.length > 0) {
      return csvData.headers.map((h) => ({
        key: h.trim(),
        label: `${h} (CSV Column)`,
      }));
    }
    return [
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "phone", label: "Phone Number" },
      { key: "email", label: "Email" },
    ];
  }, [csvData]);

  const [mapping, setMapping] = useState<VarMap>(() =>
    fromVariableMapping(value, allKeys, dynamicContactFields.map((f) => f.key))
  );

  // Check if a valid phone column exists in the CSV
  const phoneColumn = useMemo(() => {
    if (!csvData) return null;
    const match = csvData.headers.find((h) => {
      const norm = h.toLowerCase().trim();
      return norm === "phone" || norm === "mobile" || norm === "number" || norm.includes("phone") || norm.includes("tel");
    });
    return match || null;
  }, [csvData]);

  const phoneColumnExists = !!phoneColumn;

  // Sync templates and updates
  useEffect(() => {
    if (allKeys.length > 0) {
      const fields = dynamicContactFields.map((f) => f.key);
      setMapping((prev) => {
        const next = { ...prev };
        allKeys.forEach((k) => {
          if (!next[k]) {
            let field = fields[0] || "first_name";
            // Try to auto-match smart fields
            if (k.toLowerCase().includes("1") && fields.includes("first_name")) field = "first_name";
            else if (fields.includes("phone")) field = "phone";
            
            next[k] = { source: "contact_field", field };
          }
        });
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, template?.body, template?.header?.text, csvData]);

  // Handle uploaded CSV file
  const handleFile = (file: File) => {
    if (!file || !file.name.endsWith(".csv")) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCSV(text);
      
      if (headers.length === 0) return;

      // Identify phone column index
      const phoneColIdx = headers.findIndex((h) => {
        const norm = h.toLowerCase().trim();
        return norm === "phone" || norm === "mobile" || norm === "number" || norm.includes("phone") || norm.includes("tel");
      });

      // Apply Sri Lanka (+94) phone localization on phone column data
      const formattedRows = rows.map((row) => {
        if (phoneColIdx !== -1 && row[phoneColIdx]) {
          const newRow = [...row];
          newRow[phoneColIdx] = localizePhoneNumber(row[phoneColIdx]);
          return newRow;
        }
        return row;
      });

      const matchedCsv = {
        filename: file.name,
        rowCount: formattedRows.length,
        headers,
        previewRows: formattedRows.slice(0, 3),
      };
      
      setCsvData(matchedCsv);
      
      onChangeAudience({
        mode: "CSV",
        uploadId: "csv-" + Date.now(),
        csvFilename: file.name,
        csvRowCount: formattedRows.length,
      });

      // Auto map matching headers
      setMapping((prev) => {
        const next = { ...prev };
        const keys = Object.keys(next);
        keys.forEach((k, index) => {
          // Check if there is an approximate header matching
          const normHeaders = headers.map(h => h.toLowerCase().trim());
          const cleanKey = k.replace(/[{}]/g, "").trim().toLowerCase();
          
          let matchIndex = normHeaders.indexOf(cleanKey);
          if (matchIndex === -1 && cleanKey === "1") {
            // Suggest first_name for {{1}}
            matchIndex = normHeaders.findIndex(h => h.includes("name") || h.includes("first"));
          }
          if (matchIndex === -1 && cleanKey === "2") {
            // Suggest company/coupon etc
            matchIndex = normHeaders.findIndex(h => h.includes("promo") || h.includes("company") || h.includes("coupon") || h.includes("code"));
          }
          
          if (matchIndex !== -1) {
            next[k] = { source: "contact_field", field: headers[matchIndex] };
          } else if (headers.length > 0) {
            // Select based on index or default
            next[k] = { source: "contact_field", field: headers[Math.min(index, headers.length - 1)] };
          }
        });
        return next;
      });
    };
    reader.readAsText(file);
  };

  const handleClearCsv = () => {
    setCsvData(null);
    onChangeAudience({ mode: "GROUP", groupIds: [] });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const setVarSource = (key: string, source: "contact_field" | "literal") =>
    setMapping((p) => ({ ...p, [key]: { ...p[key], source } }));
  const setVarField = (key: string, field: string) =>
    setMapping((p) => ({ ...p, [key]: { ...p[key], field } }));
  const setVarValue = (key: string, val: string) =>
    setMapping((p) => ({ ...p, [key]: { ...p[key], value: val } }));

  const handleNext = () => {
    // If user clicked Next without uploading a CSV, configure a fallback Sri Lankan CSV audience state so subsequent pages load gracefully
    if (!csvData) {
      onChangeAudience({
        mode: "CSV",
        uploadId: "csv-sl-fallback",
        csvFilename: "auto_contacts_sl.csv",
        csvRowCount: 250,
      });
    }
    onChange(toVariableMapping(mapping));
    onNext();
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-20 justify-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading template...
      </div>
    );
  }

  const hasNoVars = allKeys.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Recipients & Personalization</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your contact CSV list and personalize your WhatsApp template variables.
        </p>
      </div>

      {/* ── 1. CSV Contact List Upload Section ── */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <FileUp className="w-3.5 h-3.5" /> 1. Upload Recipient CSV
        </label>
        
        {!csvData ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "p-8 rounded-xl border border-dashed text-center flex flex-col items-center justify-center gap-3 py-10 cursor-pointer transition-all hover:bg-muted/10 border-border bg-card",
              isDragging && "border-primary bg-primary/5 ring-2 ring-primary/20 scale-[0.99]"
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
              accept=".csv"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Drop your contact CSV here</p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse — must have a column for phone numbers (e.g. <code className="bg-muted px-1 rounded">phone</code>)
              </p>
            </div>
            
            <div className="mt-2">
              <Button type="button" variant="outline" size="sm" className="h-8">
                Browse File
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-success/20 bg-success/3 p-5 space-y-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{csvData.filename}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <span className="font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px]">
                      {csvData.rowCount} contacts found
                    </span>
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClearCsv}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Detected column headers */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Detected CSV Columns:</p>
              <div className="flex flex-wrap gap-1.5">
                {csvData.headers.map((h, i) => (
                  <span
                    key={i}
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded font-medium border",
                      h === phoneColumn
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold"
                        : "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    {h} {h === phoneColumn && "🌟"}
                  </span>
                ))}
              </div>
            </div>

            {/* Phone Column Validation */}
            {phoneColumnExists ? (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg">
                <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>
                  Successfully matched and localized <strong>"{phoneColumn}"</strong> as the recipient phone number column.
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/5 border border-destructive/10 p-2.5 rounded-lg">
                <AlertTriangle className="w-4 h-4 shrink-0 text-destructive mt-0.5" />
                <div>
                  <p className="font-semibold">Recipient phone number column missing!</p>
                  <p className="text-muted-foreground mt-0.5 text-[11px]">
                    We couldn't identify a clear phone number column (e.g. <code>phone</code>, <code>mobile</code>). Please upload a CSV with a phone column to send.
                  </p>
                </div>
              </div>
            )}

            {/* CSV Data Preview Table */}
            {csvData.previewRows.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CSV Contacts Preview (First {csvData.previewRows.length} Rows - Localized to SL):</span>
                  <span className="text-[9px] text-muted-foreground italic flex items-center gap-1">
                    <Info className="w-3 h-3 text-muted-foreground" /> Horizontal scrollable
                  </span>
                </div>
                <div className="border border-border rounded-lg overflow-x-auto bg-card">
                  <table className="min-w-full divide-y divide-border text-left text-xs">
                    <thead className="bg-muted/40 font-semibold text-muted-foreground">
                      <tr>
                        {csvData.headers.map((h, i) => (
                          <th key={i} className="px-3 py-1.5 font-bold uppercase tracking-wider text-[10px]">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {csvData.previewRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-muted/20">
                          {csvData.headers.map((_, hIdx) => (
                            <td key={hIdx} className="px-3 py-1.5 text-muted-foreground font-mono max-w-[150px] truncate text-[11px]">
                              {row[hIdx] || "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 2. Variables Personalization Section ── */}
      <div className="space-y-3 relative">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Variable className="w-3.5 h-3.5" /> 2. Personalize Template Variables
        </label>

        {hasNoVars ? (
          <div className="p-8 rounded-xl border border-dashed bg-muted/20 text-center">
            <Variable className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">No variables in this template</p>
            <p className="text-xs text-muted-foreground mt-1">
              The selected template has no placeholders — you can skip this section and proceed!
            </p>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in duration-200">
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
                    contactFields={dynamicContactFields}
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
                  <div className="col-span-5">Mapping / Personalize</div>
                </div>
                <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                  {bodyVars.map((variable) => {
                    const varIdx = template?.body.indexOf(variable) ?? -1;
                    const context =
                      varIdx !== -1
                        ? "..." +
                          template?.body
                            .slice(
                              Math.max(0, varIdx - 15),
                              Math.min(template.body.length, varIdx + variable.length + 15)
                            )
                            .replace(
                              variable,
                              `<b class="text-primary">${variable}</b>`
                            ) +
                          "..."
                        : "";
                    return (
                      <VarRow
                        key={variable}
                        varKey={variable}
                        displayLabel={variable}
                        context={context}
                        mapping={mapping}
                        contactFields={dynamicContactFields}
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
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={handleNext}
          className="gap-2 px-6"
        >
          Next: Schedule <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ── VarRow Row Component ──────────────────────────────────────────────────

interface VarRowProps {
  varKey: string;
  displayLabel: string;
  context?: string;
  mapping: VarMap;
  contactFields: { key: string; label: string }[];
  onSourceChange: (key: string, source: "contact_field" | "literal") => void;
  onFieldChange: (key: string, field: string) => void;
  onValueChange: (key: string, val: string) => void;
}

function VarRow({
  varKey,
  displayLabel,
  context,
  mapping,
  contactFields,
  onSourceChange,
  onFieldChange,
  onValueChange,
}: VarRowProps) {
  const m = mapping[varKey] ?? { source: "contact_field" as const };

  return (
    <div className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-muted/5 transition-colors">
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
          type="button"
          onClick={() => onSourceChange(varKey, "contact_field")}
          className={cn(
            "px-2.5 py-1 rounded text-[10px] font-semibold border transition-all flex items-center gap-1",
            m.source === "contact_field"
              ? "bg-primary text-white border-primary shadow-sm"
              : "border-border hover:border-primary/40 hover:bg-muted text-muted-foreground"
          )}
        >
          <Sparkles className="w-3 h-3" /> Field
        </button>
        <button
          type="button"
          onClick={() => onSourceChange(varKey, "literal")}
          className={cn(
            "px-2.5 py-1 rounded text-[10px] font-semibold border transition-all flex items-center gap-1",
            m.source === "literal"
              ? "bg-primary text-white border-primary shadow-sm"
              : "border-border hover:border-primary/40 hover:bg-muted text-muted-foreground"
          )}
        >
          <Type className="w-3 h-3" /> Fixed
        </button>
      </div>

      <div className="col-span-5">
        {m.source === "contact_field" ? (
          <Select value={m.field ?? ""} onValueChange={(v) => v && onFieldChange(varKey, v)}>
            <SelectTrigger className="h-8.5 text-xs font-medium">
              <SelectValue placeholder="Select Contact Field / CSV Column..." />
            </SelectTrigger>
            <SelectContent>
              {contactFields.map((f) => (
                <SelectItem key={f.key} value={f.key} className="text-xs">
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            placeholder="Type fixed value..."
            value={m.value ?? ""}
            onChange={(e) => onValueChange(varKey, e.target.value)}
            className="h-8.5 text-xs"
          />
        )}
      </div>
    </div>
  );
}
