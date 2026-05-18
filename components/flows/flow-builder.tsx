"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Settings,
  Layers,
  Type,
  LayoutTemplate,
  Play,
  ChevronRight,
  Code,
  Save,
  CheckCircle,
  PanelRightOpen,
  Sparkles,
  CalendarDays,
  ListChecks,
  FileInput,
  Heading,
  Image as ImageIcon,
  MoveDown,
  Copy,
  Sparkle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlowPhonePreview } from "./flow-phone-preview";
import type { Flow, FlowScreen, FlowComponent } from "@/types/flow";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

interface FlowBuilderProps {
  initialFlow?: Partial<Flow>;
  onSave?: (flow: Partial<Flow>) => void;
}

const DEFAULT_FLOW: Partial<Flow> = {
  name: "My New WhatsApp Flow",
  categories: ["SURVEY"],
  version: "1.0.0",
  screens: [
    {
      id: "WELCOME_SCREEN",
      title: "Welcome",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "TextHeading",
            text: "Welcome to our Survey",
          },
          {
            type: "TextBody",
            text: "Please take a few moments to provide feedback on our services.",
          },
          {
            type: "Footer",
            label: "Start Survey",
            action: {
              name: "navigate",
              payload: {
                screen: "QUESTION_1",
              },
            },
          },
        ],
      },
    },
  ],
};

const COMPONENT_TEMPLATES = [
  {
    type: "TextHeading",
    label: "Heading Text",
    icon: <Heading className="w-4 h-4" />,
    description: "Page header or title",
    defaultProps: { text: "Welcome" },
  },
  {
    type: "TextBody",
    label: "Body Text",
    icon: <Type className="w-4 h-4" />,
    description: "Paragraph text or description",
    defaultProps: { text: "Please provide details below." },
  },
  {
    type: "TextInput",
    label: "Text Input",
    icon: <FileInput className="w-4 h-4" />,
    description: "Single-line input field",
    defaultProps: { label: "Name", name: "user_name", required: true, inputType: "text" },
  },
  {
    type: "TextArea",
    label: "Multiline Text",
    icon: <FileInput className="w-4 h-4" />,
    description: "Multi-line feedback text area",
    defaultProps: { label: "Feedback", name: "feedback", required: false },
  },
  {
    type: "Dropdown",
    label: "Dropdown",
    icon: <ChevronRight className="w-4 h-4" />,
    description: "Single selection dropdown list",
    defaultProps: {
      label: "Select Service",
      name: "service",
      required: true,
      options: [
        { id: "option_1", title: "Option 1" },
        { id: "option_2", title: "Option 2" },
      ],
    },
  },
  {
    type: "RadioButtons",
    label: "Radio Buttons",
    icon: <Sparkle className="w-4 h-4" />,
    description: "Single choice visual list",
    defaultProps: {
      label: "Experience Rating",
      name: "rating",
      required: true,
      options: [
        { id: "good", title: "Good" },
        { id: "bad", title: "Poor" },
      ],
    },
  },
  {
    type: "DatePicker",
    label: "Date Picker",
    icon: <CalendarDays className="w-4 h-4" />,
    description: "Interactive date selection",
    defaultProps: { label: "Preferred Date", name: "date", required: true },
  },
  {
    type: "CheckboxGroup",
    label: "Checkboxes",
    icon: <ListChecks className="w-4 h-4" />,
    description: "Multiple choice selection",
    defaultProps: {
      label: "Interests",
      name: "interests",
      required: false,
      options: [
        { id: "1", title: "Product A" },
        { id: "2", title: "Product B" },
      ],
    },
  },
  {
    type: "Image",
    label: "Image Banner",
    icon: <ImageIcon className="w-4 h-4" />,
    description: "Visual banner or product shot",
    defaultProps: {},
  },
];

export function FlowBuilder({ initialFlow = DEFAULT_FLOW, onSave }: FlowBuilderProps) {
  const [flowName, setFlowName] = useState(initialFlow.name || "Untitled Flow");
  const [screens, setScreens] = useState<FlowScreen[]>(initialFlow.screens || []);
  const [activeScreenId, setActiveScreenId] = useState<string>(screens[0]?.id || "");
  const [activeComponentIdx, setActiveComponentIdx] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const activeScreen = screens.find((s) => s.id === activeScreenId) || screens[0];

  const addScreen = () => {
    const id = `SCREEN_${screens.length + 1}`;
    const newScr: FlowScreen = {
      id,
      title: `New Screen ${screens.length + 1}`,
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "TextHeading",
            text: "Screen Title",
          },
          {
            type: "Footer",
            label: "Continue",
            action: {
              name: "complete",
            },
          },
        ],
      },
    };
    setScreens([...screens, newScr]);
    setActiveScreenId(id);
    setActiveComponentIdx(null);
  };

  const deleteScreen = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (screens.length <= 1) {
      alert("A Flow must contain at least one screen.");
      return;
    }
    const filtered = screens.filter((s) => s.id !== id);
    setScreens(filtered);
    if (activeScreenId === id) {
      setActiveScreenId(filtered[0].id);
      setActiveComponentIdx(null);
    }
  };

  const addComponentToActiveScreen = (compTemplate: typeof COMPONENT_TEMPLATES[number]) => {
    if (!activeScreen) return;
    
    const newComponent: FlowComponent = {
      type: compTemplate.type as any,
      ...compTemplate.defaultProps,
    };

    const updatedScreens = screens.map((s) => {
      if (s.id === activeScreen.id) {
        // Inject before footer if footer exists, otherwise at the end
        const children = [...s.layout.children];
        const footerIdx = children.findIndex((c) => c.type === "Footer");
        if (footerIdx !== -1) {
          children.splice(footerIdx, 0, newComponent);
        } else {
          children.push(newComponent);
        }
        return {
          ...s,
          layout: {
            ...s.layout,
            children,
          },
        };
      }
      return s;
    });

    setScreens(updatedScreens);
    // Set active component to the newly added index
    const activeIdx = updatedScreens
      .find((s) => s.id === activeScreen.id)
      ?.layout.children.findIndex((c) => c === newComponent);
    
    if (activeIdx !== undefined && activeIdx !== -1) {
      setActiveComponentIdx(activeIdx);
    }
  };

  const updateActiveComponent = (updatedProps: Partial<FlowComponent>) => {
    if (!activeScreen || activeComponentIdx === null) return;

    setScreens(
      screens.map((s) => {
        if (s.id === activeScreen.id) {
          const children = [...s.layout.children];
          children[activeComponentIdx] = {
            ...children[activeComponentIdx],
            ...updatedProps,
          };
          return {
            ...s,
            layout: { ...s.layout, children },
          };
        }
        return s;
      })
    );
  };

  const deleteActiveComponent = () => {
    if (!activeScreen || activeComponentIdx === null) return;

    setScreens(
      screens.map((s) => {
        if (s.id === activeScreen.id) {
          const children = s.layout.children.filter((_, idx) => idx !== activeComponentIdx);
          return {
            ...s,
            layout: { ...s.layout, children },
          };
        }
        return s;
      })
    );
    setActiveComponentIdx(null);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onSave?.({
        name: flowName,
        screens,
        screenCount: screens.length,
      });
    }, 1000);
  };

  const selectedComponent = activeScreen?.layout.children[activeComponentIdx ?? -1];

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden border-t border-border">
      {/* Sub-Header Toolbar */}
      <div className="h-14 border-b bg-card px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/flows">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Input
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              className="h-8 text-sm font-semibold w-64 bg-transparent border-transparent hover:border-border focus:border-primary py-0 px-2"
              placeholder="Enter flow name..."
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Play className="w-3.5 h-3.5 mr-1.5 text-success fill-success/20" />
            Preview
          </Button>
          <Button variant="outline" size="sm">
            <Code className="w-3.5 h-3.5 mr-1.5" />
            Flow JSON
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="shadow-sm">
            {isSaving ? (
              <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin mr-1.5" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-1.5" />
            )}
            Save Flow
          </Button>
        </div>
      </div>

      {/* Workspace split view */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ── LEFT PANEL: SCREENS EXPLORER ── */}
        <div className="w-64 shrink-0 border-r bg-card flex flex-col h-full overflow-y-auto">
          <div className="p-4 border-b flex items-center justify-between shrink-0 bg-muted/20">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
              <Layers className="w-4 h-4" />
              Flow Screens
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={addScreen} title="Add Screen">
              <Plus className="w-4 h-4 text-primary" />
            </Button>
          </div>
          <div className="p-3 flex flex-col gap-1 flex-1">
            {screens.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  setActiveScreenId(s.id);
                  setActiveComponentIdx(null);
                }}
                className={cn(
                  "group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer border transition-all",
                  activeScreenId === s.id
                    ? "bg-primary/10 border-primary/30 text-primary font-medium"
                    : "hover:bg-muted/50 border-transparent text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <LayoutTemplate className={cn("w-4 h-4 shrink-0", activeScreenId === s.id ? "text-primary" : "text-muted-foreground/60")} />
                  <span className="truncate leading-none">{s.title}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={(e) => deleteScreen(s.id, e)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            
            <button
              onClick={addScreen}
              className="mt-2 flex items-center justify-center gap-1.5 py-2 border border-dashed border-border rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted/30 transition-all"
            >
              <Plus className="w-3 h-3" />
              Add New Screen
            </button>
          </div>
        </div>

        {/* ── CENTER CANVAS: PREVIEW ── */}
        <div className="flex-1 bg-[#f3f4f6] dark:bg-[#121212] overflow-auto relative pattern-dots">
          {/* Decorative background texture */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="min-h-full min-w-full flex items-center justify-center p-8">
            {activeScreen ? (
              <div className="flex flex-col gap-3 items-center relative z-10">
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full border shadow-sm">
                  <span className="font-semibold text-foreground">{activeScreen.title}</span>
                  <span className="opacity-40">|</span>
                  <span>ID: {activeScreen.id}</span>
                </div>
                <FlowPhonePreview
                  screen={activeScreen}
                  activeComponentIndex={activeComponentIdx}
                  onComponentClick={(idx) => setActiveComponentIdx(idx)}
                />
              </div>
            ) : (
              <div className="text-center text-muted-foreground relative z-10">
                <LayoutTemplate className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">Select or create a screen</p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: COMPONENT LIBRARY & INSPECTOR ── */}
        <div className="w-80 shrink-0 border-l bg-card flex flex-col h-full">
          <Tabs defaultValue="library" className="flex-1 flex flex-col">
            <div className="px-4 pt-2 shrink-0 border-b bg-muted/10">
              <TabsList className="grid w-full grid-cols-2 h-9 bg-muted/50">
                <TabsTrigger value="library" className="text-xs">Components</TabsTrigger>
                <TabsTrigger value="inspector" className="text-xs" disabled={!selectedComponent && !activeScreen}>
                  Inspector
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Library Tab */}
              <TabsContent value="library" className="p-4 m-0 space-y-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">
                    Input Elements
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {COMPONENT_TEMPLATES.filter(c => ["TextInput", "TextArea", "Dropdown", "DatePicker", "RadioButtons", "CheckboxGroup"].includes(c.type)).map((comp) => (
                      <div
                        key={comp.type}
                        onClick={() => addComponentToActiveScreen(comp)}
                        className="flex flex-col gap-1 p-2.5 border border-border hover:border-primary/50 hover:bg-primary/5 rounded-lg cursor-pointer transition-all group"
                      >
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                          {comp.icon}
                        </div>
                        <span className="text-xs font-semibold text-card-foreground leading-tight mt-1">{comp.label}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight overflow-hidden truncate">{comp.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3 mt-2">
                    Presentation
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {COMPONENT_TEMPLATES.filter(c => ["TextHeading", "TextBody", "Image"].includes(c.type)).map((comp) => (
                      <div
                        key={comp.type}
                        onClick={() => addComponentToActiveScreen(comp)}
                        className="flex flex-col gap-1 p-2.5 border border-border hover:border-primary/50 hover:bg-primary/5 rounded-lg cursor-pointer transition-all group"
                      >
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                          {comp.icon}
                        </div>
                        <span className="text-xs font-semibold text-card-foreground leading-tight mt-1">{comp.label}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight overflow-hidden truncate">{comp.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {!activeScreen?.layout.children.some(c => c.type === "Footer") && (
                  <div className="pt-3 border-t">
                    <Button
                      variant="outline"
                      className="w-full text-xs font-medium border-dashed flex items-center gap-1.5 h-9"
                      onClick={() => {
                        if (activeScreen) {
                          setScreens(screens.map(s => s.id === activeScreen.id ? {
                            ...s,
                            layout: {
                              ...s.layout,
                              children: [...s.layout.children, { type: "Footer", label: "Continue", action: { name: "complete" } }]
                            }
                          } : s));
                        }
                      }}
                    >
                      <MoveDown className="w-3.5 h-3.5" /> Add Footer Button
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Inspector Tab */}
              <TabsContent value="inspector" className="m-0">
                {selectedComponent ? (
                  <div className="p-4 space-y-5">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Component</span>
                        <span className="text-sm font-semibold text-primary flex items-center gap-1">
                          {selectedComponent.type}
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={deleteActiveComponent} title="Delete Component">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Dynamic inputs depending on type */}
                    {("text" in selectedComponent) && (
                      <div className="space-y-2">
                        <Label className="text-xs">Text Content</Label>
                        <Textarea
                          value={selectedComponent.text || ""}
                          onChange={(e) => updateActiveComponent({ text: e.target.value })}
                          className="text-xs leading-relaxed"
                          rows={3}
                        />
                      </div>
                    )}

                    {("label" in selectedComponent) && (
                      <div className="space-y-2">
                        <Label className="text-xs">Label Text</Label>
                        <Input
                          value={selectedComponent.label || ""}
                          onChange={(e) => updateActiveComponent({ label: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                    )}

                    {("name" in selectedComponent) && (
                      <div className="space-y-2">
                        <Label className="text-xs">Key Name (Flow Data)</Label>
                        <Input
                          value={selectedComponent.name || ""}
                          onChange={(e) => updateActiveComponent({ name: e.target.value })}
                          className="h-8 text-xs font-mono"
                          placeholder="e.g. user_feedback"
                        />
                      </div>
                    )}

                    {("required" in selectedComponent) && (
                      <div className="flex items-center justify-between py-1">
                        <Label className="text-xs cursor-pointer">Required Field</Label>
                        <Switch
                          checked={!!selectedComponent.required}
                          onCheckedChange={(checked) => updateActiveComponent({ required: checked })}
                        />
                      </div>
                    )}

                    {/* Options block for Radios / Dropdowns */}
                    {("options" in selectedComponent) && (
                      <div className="space-y-2 border-t pt-3 mt-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Selection Options</Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              const opts = [...(selectedComponent.options || [])];
                              opts.push({ id: `opt_${opts.length + 1}`, title: `New Option ${opts.length + 1}` });
                              updateActiveComponent({ options: opts });
                            }}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {(selectedComponent.options || []).map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-1.5">
                              <Input
                                value={opt.title}
                                onChange={(e) => {
                                  const opts = [...(selectedComponent.options || [])];
                                  opts[oIdx] = { ...opt, title: e.target.value };
                                  updateActiveComponent({ options: opts });
                                }}
                                className="h-7 text-xs"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                                onClick={() => {
                                  const opts = (selectedComponent.options || []).filter((_, idx) => idx !== oIdx);
                                  updateActiveComponent({ options: opts });
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action / Navigation for Footer */}
                    {selectedComponent.type === "Footer" && (
                      <div className="space-y-3 border-t pt-3">
                        <Label className="text-xs">Button Action</Label>
                        <Select
                          value={selectedComponent.action?.name || "complete"}
                          onValueChange={(val) => {
                            const act: any = { name: val };
                            if (val === "navigate") act.payload = { screen: "" };
                            updateActiveComponent({ action: act });
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="navigate">Navigate to Screen</SelectItem>
                            <SelectItem value="data_exchange">External Endpoint (API)</SelectItem>
                            <SelectItem value="complete">Complete Flow (Submit)</SelectItem>
                          </SelectContent>
                        </Select>

                        {selectedComponent.action?.name === "navigate" && (
                          <div className="space-y-1.5 mt-2">
                            <Label className="text-[11px] text-muted-foreground">Target Screen</Label>
                            <Select
                              value={selectedComponent.action.payload?.screen || ""}
                              onValueChange={(val) => {
                                updateActiveComponent({
                                  action: {
                                    name: "navigate",
                                    payload: { screen: val },
                                  },
                                });
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select Screen" />
                              </SelectTrigger>
                              <SelectContent>
                                {screens
                                  .filter((s) => s.id !== activeScreen.id)
                                  .map((s) => (
                                    <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : activeScreen ? (
                  <div className="p-4 space-y-4">
                    <div className="border-b pb-3 flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Screen Config</span>
                      <span className="text-sm font-semibold text-foreground">{activeScreen.title}</span>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Screen Title (visible to user)</Label>
                      <Input
                        value={activeScreen.title}
                        onChange={(e) => {
                          setScreens(
                            screens.map((s) => (s.id === activeScreen.id ? { ...s, title: e.target.value } : s))
                          );
                        }}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Unique Screen ID</Label>
                      <Input
                        value={activeScreen.id}
                        onChange={(e) => {
                          setScreens(
                            screens.map((s) => (s.id === activeScreen.id ? { ...s, id: e.target.value.toUpperCase().replace(/\s+/g, "_") } : s))
                          );
                          setActiveScreenId(e.target.value.toUpperCase().replace(/\s+/g, "_"));
                        }}
                        className="h-8 text-xs font-mono uppercase"
                      />
                    </div>

                    <div className="flex items-center justify-between border-t pt-3 mt-2">
                      <Label className="text-xs flex flex-col gap-0.5 cursor-pointer">
                        <span>Terminal Screen</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Last screen in flow</span>
                      </Label>
                      <Switch
                        checked={!!activeScreen.terminal}
                        onCheckedChange={(checked) => {
                          setScreens(
                            screens.map((s) => (s.id === activeScreen.id ? { ...s, terminal: checked } : s))
                          );
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2 mt-20">
                    <Info className="w-6 h-6 opacity-30" />
                    <p className="text-xs">Select a component on the phone mockup to edit its properties here.</p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
