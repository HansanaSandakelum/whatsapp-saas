"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  AlertCircle,
  Smartphone,
  Plus,
  Trash2,
  Type,
  Image as ImageIcon,
  FileVideo,
  FileText,
  MousePointerClick,
  Phone,
  ExternalLink,
  Bold,
  Italic,
  Strikethrough,
  Code2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type HeaderType = "NONE" | "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";
type ButtonType = "QUICK_REPLY" | "PHONE" | "URL";
type Category = "MARKETING" | "UTILITY" | "AUTHENTICATION";

interface TemplateButton {
  id: string;
  type: ButtonType;
  text: string;
  value: string;
}

const HEADER_OPTIONS: {
  value: HeaderType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "NONE", label: "None", icon: null },
  { value: "TEXT", label: "Text", icon: <Type className="w-4 h-4" /> },
  { value: "IMAGE", label: "Image", icon: <ImageIcon className="w-4 h-4" /> },
  { value: "VIDEO", label: "Video", icon: <FileVideo className="w-4 h-4" /> },
  {
    value: "DOCUMENT",
    label: "Document",
    icon: <FileText className="w-4 h-4" />,
  },
];

const CATEGORY_INFO: Record<Category, { color: string; desc: string }> = {
  MARKETING: {
    color: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    desc: "Promotions, offers, announcements",
  },
  UTILITY: {
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    desc: "Transactional, order updates, alerts",
  },
  AUTHENTICATION: {
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    desc: "OTPs, verification codes",
  },
};

function varCount(text: string) {
  return (text.match(/\{\{\d+\}\}/g) || []).length;
}

function insertVar(text: string, cursorPos: number): string {
  const count = varCount(text) + 1;
  const tag = `{{${count}}}`;
  return text.slice(0, cursorPos) + tag + text.slice(cursorPos);
}

export default function CreateTemplatePage() {
  const router = useRouter();

  // Config
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("MARKETING");
  const [language, setLanguage] = useState("en_US");

  // Header
  const [headerType, setHeaderType] = useState<HeaderType>("NONE");
  const [headerText, setHeaderText] = useState("");
  // Header variable — Meta allows exactly 1 variable ({{1}}) in TEXT headers
  const [headerHasVar, setHeaderHasVar] = useState(false);
  const [headerVarExample, setHeaderVarExample] = useState("");

  // Derived: raw header text with {{1}} injected when headerHasVar is true
  const headerRawText = headerHasVar && !headerText.includes("{{1}}")
    ? headerText + " {{1}}"
    : headerText;

  const toggleHeaderVar = () => {
    if (!headerHasVar) {
      // Insert {{1}} if not already present
      if (!headerText.includes("{{1}}")) {
        setHeaderText((t) => t ? t + " {{1}}" : "{{1}}");
      }
      setHeaderHasVar(true);
    } else {
      // Remove {{1}} from header text
      setHeaderText((t) => t.replace(/\s?\{\{1\}\}\s?/g, " ").trim());
      setHeaderHasVar(false);
      setHeaderVarExample("");
    }
  };

  // Body
  const [body, setBody] = useState(
    "Hello {{1}},\n\nThank you for choosing us. Your order *{{2}}* is now confirmed.\n\nHave a great day! 😊",
  );
  const [bodyRef, setBodyRef] = useState<HTMLTextAreaElement | null>(null);
  // variable placeholders to help mapping (editable labels for each {{n}})
  const [placeholders, setPlaceholders] = useState<Record<number, string>>({});

  // Footer
  const [footer, setFooter] = useState("Reply STOP to unsubscribe");

  // Buttons
  const [buttons, setButtons] = useState<TemplateButton[]>([]);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Compliance ---
  const issues: string[] = [];
  if (body.toLowerCase().includes("win") && category !== "MARKETING")
    issues.push('Word "win" is flagged for non-marketing templates.');
  if (body.toLowerCase().includes("free offer"))
    issues.push('"Free offer" phrasing often triggers Meta review delays.');
  if (varCount(body) > 10)
    issues.push("More than 10 variables may reduce approval chances.");
  if (buttons.length > 3)
    issues.push("WhatsApp allows a maximum of 3 buttons per template.");
  if (headerHasVar && !headerVarExample.trim())
    issues.push("Header variable requires an example value for Meta review.");
  const headerCharCount = headerText.length;
  if (headerType === "TEXT" && headerCharCount > 60)
    issues.push("Header text (incl. variable) exceeds 60-character limit.");
  const isValid = name.trim().length > 0 && body.trim().length > 0 &&
    !(headerHasVar && !headerVarExample.trim());

  // --- Handlers ---
  const addButton = () => {
    if (buttons.length >= 3) return;
    setButtons([
      ...buttons,
      { id: Date.now().toString(), type: "QUICK_REPLY", text: "", value: "" },
    ]);
  };

  const updateButton = (id: string, updates: Partial<TemplateButton>) => {
    setButtons(buttons.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const removeButton = (id: string) =>
    setButtons(buttons.filter((b) => b.id !== id));

  const handleInsertVar = () => {
    if (!bodyRef) return;
    const pos = bodyRef.selectionStart ?? body.length;
    const newBody = insertVar(body, pos);
    setBody(newBody);
    // After inserting, ensure a placeholder entry exists for the new index
    const newCount = varCount(newBody);
    setPlaceholders((p) => ({ ...(p || {}), [newCount]: p?.[newCount] ?? "" }));
    setTimeout(() => bodyRef.focus(), 0);
  };

  const applyFormat = (tag: string) => {
    if (!bodyRef) return;
    const start = bodyRef.selectionStart ?? 0;
    const end = bodyRef.selectionEnd ?? 0;
    const selected = body.slice(start, end) || "text";
    const formatted = `${tag}${selected}${tag}`;
    setBody(body.slice(0, start) + formatted + body.slice(end));
  };

  const handleSubmit = async () => {
    if (!isValid) {
      toast.error("Template name and body are required.");
      return;
    }
    if (headerHasVar && !headerVarExample.trim()) {
      toast.error("Header variable example is required for Meta review.");
      return;
    }
    setIsSubmitting(true);
    // Build payload matching Template shape (would go to API)
    const _payload = {
      name, category, language,
      header: headerType !== "NONE" ? {
        type: headerType,
        text: headerType === "TEXT" ? headerText : undefined,
        hasVariable: headerType === "TEXT" ? headerHasVar : false,
        exampleValue: headerType === "TEXT" && headerHasVar ? headerVarExample : undefined,
      } : undefined,
      body,
      footer: footer || undefined,
      buttons,
      variableCount: varCount(body),
      headerVariableCount: headerHasVar ? 1 : 0,
    };
    await new Promise((r) => setTimeout(r, 1200));
    toast.success("Template submitted for Meta review", {
      description: "Approval usually takes up to 24 hours.",
    });
    setIsSubmitting(false);
    router.push(ROUTES.TEMPLATES);
  };


  // --- Preview Rendering ---
  const previewBody = body
    .replace(/\*(.+?)\*/g, "<b>$1</b>")
    .replace(/_(.+?)_/g, "<i>$1</i>")
    .replace(/~(.+?)~/g, "<s>$1</s>")
    .replace(/`(.+?)`/g, "<code class='bg-white/10 rounded px-0.5'>$1</code>")
    .replace(/\n/g, "<br />");

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8"
            render={<Link href={ROUTES.TEMPLATES} />}
            nativeButton={false}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold leading-tight">
              Create Template
            </h1>
            <p className="text-xs text-muted-foreground">
              Design and submit a WhatsApp message template for Meta approval
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[11px] font-medium border",
              CATEGORY_INFO[category].color,
            )}
          >
            {category}
          </Badge>
          <Button
            variant="outline"
            render={<Link href={ROUTES.TEMPLATES} />}
            nativeButton={false}
            className="hidden sm:flex"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit to Meta"
            )}
          </Button>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Col 1: Configuration ── */}
        <aside className="w-72 shrink-0 border-r border-border bg-muted/20 overflow-y-auto flex flex-col gap-5 p-4">
          <Card className="shadow-none border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Template Config</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g. order_confirmed_v1"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                    )
                  }
                  className="h-8 text-sm"
                />
                <p className="text-[10px] text-muted-foreground">
                  Lowercase letters, numbers, underscores only.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <div className="flex flex-col gap-2">
                  {(Object.keys(CATEGORY_INFO) as Category[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "flex flex-col text-left rounded-lg border px-3 py-2 transition-colors text-xs cursor-pointer",
                        category === cat
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <span className="font-medium">
                        {cat.charAt(0) + cat.slice(1).toLowerCase()}
                      </span>
                      <span className="text-muted-foreground leading-snug mt-0.5">
                        {CATEGORY_INFO[cat].desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Language</Label>
                <Select
                  value={language}
                  onValueChange={(v) => v && setLanguage(v)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_US">🇺🇸 English (US)</SelectItem>
                    <SelectItem value="en_GB">🇬🇧 English (UK)</SelectItem>
                    <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                    <SelectItem value="pt_BR">🇧🇷 Portuguese (BR)</SelectItem>
                    <SelectItem value="fr">🇫🇷 French</SelectItem>
                    <SelectItem value="de">🇩🇪 German</SelectItem>
                    <SelectItem value="ar">🇸🇦 Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Card */}
          {/* <Card
            className={cn(
              "shadow-none",
              issues.length > 0
                ? "border-warning/50 bg-warning/5"
                : "border-success/30 bg-success/5",
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {issues.length > 0 ? (
                  <ShieldAlert className="w-4 h-4 text-warning" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                )}
                Compliance Scanner
              </CardTitle>
            </CardHeader>
            <CardContent>
              {issues.length === 0 ? (
                <p className="text-xs text-success font-medium">
                  All checks passed. Ready to submit.
                </p>
              ) : (
                <ul className="space-y-2">
                  {issues.map((issue, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-warning"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      {issue}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card> */}
        </aside>

        {/* ── Col 2: Editor ── */}
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 min-w-0">
          {/* Header Section */}
          <Card className="shadow-none border-border shrink-0 overflow-visible">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  Header{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </CardTitle>
                <div className="flex gap-1">
                  {HEADER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setHeaderType(opt.value)}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-md border transition-colors flex items-center gap-1",
                        headerType === opt.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary/50 text-muted-foreground",
                      )}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            {headerType !== "NONE" && (
              <CardContent className="space-y-3">
                {headerType === "TEXT" ? (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Header text (max 60 chars)"
                          value={headerText}
                          onChange={(e) => setHeaderText(e.target.value.slice(0, 60))}
                          maxLength={60}
                          className="flex-1"
                        />
                        <Button
                          variant={headerHasVar ? "default" : "outline"}
                          size="sm"
                          className="h-9 text-xs shrink-0 gap-1.5"
                          onClick={toggleHeaderVar}
                          title={headerHasVar ? "Remove {{1}} from header" : "Add {{1}} variable to header (Meta allows 1)"}
                        >
                          <Plus className="w-3 h-3" />
                          {headerHasVar ? "Variable Added" : "Add Variable"}
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground text-right">
                        {headerText.length}/60 chars
                        {headerHasVar && (
                          <span className="ml-2 text-primary font-medium">&middot; 1 variable ({"{{1}}"})</span>
                        )}
                      </p>
                    </div>
                    {/* Example value for Meta review — required when header has {{1}} */}
                    {headerHasVar && null}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/20 hover:border-primary/40 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      {headerType === "IMAGE" && <ImageIcon className="w-8 h-8" />}
                      {headerType === "VIDEO" && <FileVideo className="w-8 h-8" />}
                      {headerType === "DOCUMENT" && <FileText className="w-8 h-8" />}
                      <p className="text-sm font-medium">Click to upload a sample {headerType.toLowerCase()}</p>
                      <p className="text-xs">Required for Meta review</p>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Body Section */}
          <Card className="shadow-none border-border shrink-0 overflow-visible">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">
                    Body <span className="text-destructive">*</span>
                  </CardTitle>
                  <CardDescription className="text-[11px] mt-0.5">
                    Use {"{{1}}"}, {"{{2}}"} etc. for dynamic variables.
                    Supports *bold*, _italic_, ~strike~.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1 px-2"
                    onClick={() => applyFormat("*")}
                  >
                    <Bold className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1 px-2"
                    onClick={() => applyFormat("_")}
                  >
                    <Italic className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1 px-2"
                    onClick={() => applyFormat("~")}
                  >
                    <Strikethrough className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1 px-2"
                    onClick={() => applyFormat("`")}
                  >
                    <Code2 className="w-3 h-3" />
                  </Button>
                  <div className="w-px h-4 bg-border mx-1" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={handleInsertVar}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Variable
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Textarea
                ref={(el) => setBodyRef(el)}
                className="w-full min-h-[160px] max-h-[320px] resize-y font-mono text-sm"
                placeholder="Type your message body…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              {/* Variable placeholders editor: helps user name slots for mapping */}
              {varCount(body) > 0 && (
                <div className="mt-2 p-2 rounded border border-border bg-background/50">
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: varCount(body) }, (_, i) => {
                      const idx = i + 1;
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="font-mono text-xs w-20">{`{{${idx}}}`}</div>
                          <input
                            className="flex-1 h-8 rounded border border-border px-2 text-xs bg-white"
                            placeholder={`placeholder for {{${idx}}}`}
                            value={placeholders[idx] ?? ""}
                            onChange={(e) =>
                              setPlaceholders((prev) => ({
                                ...prev,
                                [idx]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                <span>
                  {varCount(body)} variable{varCount(body) !== 1 ? "s" : ""}{" "}
                  detected
                </span>
                <span
                  className={
                    body.length > 950 ? "text-warning font-medium" : ""
                  }
                >
                  {body.length}/1024
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Footer Section */}
          <Card className="shadow-none border-border shrink-0 overflow-visible">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                Footer{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <Input
                placeholder="e.g. Reply STOP to unsubscribe"
                value={footer}
                onChange={(e) => setFooter(e.target.value.slice(0, 60))}
                maxLength={60}
              />
              <p className="text-[10px] text-muted-foreground text-right">
                {footer.length}/60
              </p>
            </CardContent>
          </Card>

          {/* Buttons Section */}
          <Card className="shadow-none border-border shrink-0 overflow-visible">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">
                    Buttons{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional, max 3)
                    </span>
                  </CardTitle>
                  <CardDescription className="text-[11px] mt-0.5">
                    Add quick replies, phone numbers or URLs.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={addButton}
                  disabled={buttons.length >= 3}
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Button
                </Button>
              </div>
            </CardHeader>
            {buttons.length > 0 && (
              <CardContent className="space-y-3">
                {buttons.map((btn, idx) => (
                  <div
                    key={btn.id}
                    className="flex items-start gap-2 p-3 rounded-lg border border-border bg-muted/20"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium w-4">
                          {idx + 1}.
                        </span>
                        <Select
                          value={btn.type}
                          onValueChange={(v) =>
                            v && updateButton(btn.id, { type: v as ButtonType })
                          }
                        >
                          <SelectTrigger className="h-7 text-xs w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="QUICK_REPLY">
                              <span className="flex items-center gap-1.5">
                                <MousePointerClick className="w-3 h-3" />
                                Quick Reply
                              </span>
                            </SelectItem>
                            <SelectItem value="PHONE">
                              <span className="flex items-center gap-1.5">
                                <Phone className="w-3 h-3" />
                                Phone Number
                              </span>
                            </SelectItem>
                            <SelectItem value="URL">
                              <span className="flex items-center gap-1.5">
                                <ExternalLink className="w-3 h-3" />
                                Visit URL
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 pl-6">
                        <Input
                          placeholder="Button label"
                          value={btn.text}
                          onChange={(e) =>
                            updateButton(btn.id, { text: e.target.value })
                          }
                          className="h-7 text-xs"
                        />
                        {btn.type !== "QUICK_REPLY" && (
                          <Input
                            placeholder={
                              btn.type === "PHONE"
                                ? "+1 555 000 0000"
                                : "https://..."
                            }
                            value={btn.value}
                            onChange={(e) =>
                              updateButton(btn.id, { value: e.target.value })
                            }
                            className="h-7 text-xs"
                          />
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeButton(btn.id)}
                      className="mt-1 text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        </main>

        {/* ── Col 3: Phone Preview ── */}
        <aside className="w-80 shrink-0 border-l border-border bg-muted/10 p-5 overflow-y-auto flex flex-col items-center">
          <div className="sticky top-0 w-full flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 self-start">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Live Preview
              </span>
            </div>

            {/* Phone Frame */}
            <div
              className="w-[260px] bg-[#111B21] border-[7px] border-[#222] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
              style={{ height: 520 }}
            >
              {/* WA Header */}
              <div className="h-14 bg-[#1F2C34] flex items-center gap-3 px-3 shrink-0">
                <ArrowLeft className="w-4 h-4 text-[#8696A0]" />
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {name ? name[0].toUpperCase() : "B"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#E9EDEF] text-[13px] font-medium truncate">
                    {name || "Business"}
                  </p>
                  <p className="text-[#8696A0] text-[10px]">Business Account</p>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto bg-[#0B141A] p-3 flex flex-col gap-2 scrollbar-hide">
                {/* Bubble */}
                <div className="bg-[#1F2C34] rounded-lg rounded-tl-none p-2.5 w-[90%] relative shadow-sm mt-3">
                  {/* Tail */}
                  <svg
                    viewBox="0 0 8 13"
                    width="8"
                    height="13"
                    className="absolute -left-[7px] top-0 text-[#1F2C34]"
                  >
                    <path
                      fill="currentColor"
                      d="M1.533 2.568 8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z"
                    />
                  </svg>

                  {/* Header Preview */}
                  {headerType === "TEXT" && headerText && (
                    <p className="text-[#E9EDEF] text-[13px] font-bold mb-1">
                      {headerHasVar
                        ? headerText.replace("{{1}}", headerVarExample || "{{1}}")
                        : headerText}
                    </p>
                  )}
                  {headerType === "IMAGE" && (
                    <div className="w-full h-28 rounded-md bg-[#2A3942] flex items-center justify-center mb-2">
                      <ImageIcon className="w-8 h-8 text-[#8696A0]" />
                    </div>
                  )}
                  {headerType === "VIDEO" && (
                    <div className="w-full h-28 rounded-md bg-[#2A3942] flex items-center justify-center mb-2">
                      <FileVideo className="w-8 h-8 text-[#8696A0]" />
                    </div>
                  )}
                  {headerType === "DOCUMENT" && (
                    <div className="w-full flex items-center gap-2 bg-[#2A3942] rounded-md p-2 mb-2">
                      <FileText className="w-6 h-6 text-[#8696A0] shrink-0" />
                      <span className="text-[#E9EDEF] text-[11px] truncate">
                        document.pdf
                      </span>
                    </div>
                  )}

                  {/* Body Preview */}
                  <p
                    className="text-[#E9EDEF] text-[13px] leading-relaxed break-words"
                    dangerouslySetInnerHTML={{
                      __html:
                        previewBody || "Your message body will appear here…",
                    }}
                  />

                  {/* Footer */}
                  {footer && (
                    <p className="text-[#8696A0] text-[10px] mt-1.5">
                      {footer}
                    </p>
                  )}

                  <div className="text-right text-[#8696A0] text-[10px] mt-1">
                    12:00 PM
                  </div>
                </div>

                {/* Button Previews */}
                {buttons.length > 0 && (
                  <div className="flex flex-col gap-1 w-[90%]">
                    {buttons.map((btn) => (
                      <div
                        key={btn.id}
                        className="bg-[#1F2C34] rounded-lg px-3 py-2 text-center text-[#53BDEB] text-[12px] font-medium flex items-center justify-center gap-1.5 border border-[#2A3942]"
                      >
                        {btn.type === "PHONE" && <Phone className="w-3 h-3" />}
                        {btn.type === "URL" && (
                          <ExternalLink className="w-3 h-3" />
                        )}
                        {btn.type === "QUICK_REPLY" && (
                          <MousePointerClick className="w-3 h-3" />
                        )}
                        {btn.text || `Button ${buttons.indexOf(btn) + 1}`}
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

            {/* Variable Legend */}
            {varCount(body) > 0 && (
              <div className="mt-4 w-full p-3 rounded-lg border border-border bg-background text-xs space-y-1.5">
                <p className="font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                  Variables Detected
                </p>
                {Array.from({ length: varCount(body) }, (_, i) => {
                  const idx = i + 1;
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <code className="bg-primary/10 text-primary rounded px-1.5 py-0.5">{`{{${idx}}}`}</code>
                        <span className="text-muted-foreground text-[10px]">
                          {placeholders[idx] ?? "—"}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-[10px]">
                        → to be mapped at send time
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
