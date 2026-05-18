import { Flow } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Clock,
  FileCode2,
  Layers,
  Edit2,
  Play,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";
import Link from "next/link";

interface FlowCardProps {
  flow: Flow;
}

const STATUS_META = {
  published: {
    label: "Published",
    icon: <CheckCircle2 className="w-3 h-3" />,
    className: "text-success bg-success/10 border-success/20",
  },
  draft: {
    label: "Draft",
    icon: <AlertCircle className="w-3 h-3" />,
    className: "text-warning bg-warning/10 border-warning/20",
  },
  deprecated: {
    label: "Deprecated",
    icon: <XCircle className="w-3 h-3" />,
    className: "text-muted-foreground bg-muted border-border",
  },
};

const CATEGORY_META: Record<string, string> = {
  SIGN_UP: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  SIGN_IN: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  APPOINTMENT_BOOKING: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  SURVEY: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  LEAD_GENERATION: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  CONTACT_US: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  PRODUCT_BROWSER: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
};

export function FlowCard({ flow }: FlowCardProps) {
  const meta = STATUS_META[flow.status] || STATUS_META.draft;

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-150 overflow-hidden">
      {/* Top section */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div className="flex flex-wrap gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full border",
              meta.className
            )}
          >
            {meta.icon}
            {meta.label}
          </span>
          <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md font-medium">
            v{flow.version}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity -mr-1 -mt-1 shrink-0"
              />
            }
          >
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem render={<Link href={`/flows/${flow.id}`} />}>
              <Play className="w-3.5 h-3.5 mr-2 text-success fill-success/20" /> Preview Flow
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit Builder
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="w-3.5 h-3.5 mr-2" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-danger">
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="px-4 pb-3 flex-1 flex flex-col">
        <Link href={`/flows/${flow.id}`} className="block group-hover:text-primary hover:underline">
          <h3 className="text-sm font-semibold truncate mb-1" title={flow.name}>
            {flow.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
          {flow.description || "No description provided. Design interactive screens for WhatsApp users."}
        </p>
        
        {/* Categories */}
        <div className="flex flex-wrap gap-1 mt-auto">
          {flow.categories.map((cat) => (
            <span
              key={cat}
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                CATEGORY_META[cat] || "bg-muted text-muted-foreground"
              )}
            >
              {cat.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/20">
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          {flow.screenCount} {flow.screenCount === 1 ? "screen" : "screens"}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          {formatRelative(flow.updatedAt)}
        </span>
      </div>
    </div>
  );
}
