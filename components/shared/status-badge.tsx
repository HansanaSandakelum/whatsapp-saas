import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS } from "@/lib/constants";
import { CheckCircle2, Clock, XCircle, AlertCircle, PlayCircle, Send, CheckCircle, Info } from "lucide-react";

interface StatusBadgeProps {
  status: keyof typeof STATUS_COLORS;
  className?: string;
}

const statusIcons = {
  approved: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
  pending: <Clock className="w-3.5 h-3.5 mr-1" />,
  rejected: <XCircle className="w-3.5 h-3.5 mr-1" />,
  draft: <AlertCircle className="w-3.5 h-3.5 mr-1" />,
  active: <PlayCircle className="w-3.5 h-3.5 mr-1" />,
  paused: <Clock className="w-3.5 h-3.5 mr-1" />,
  completed: <CheckCircle className="w-3.5 h-3.5 mr-1" />,
  scheduled: <Clock className="w-3.5 h-3.5 mr-1" />,
  failed: <XCircle className="w-3.5 h-3.5 mr-1" />,
  sent: <Send className="w-3.5 h-3.5 mr-1" />,
  delivered: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
  read: <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-blue-500" />,
  live: <PlayCircle className="w-3.5 h-3.5 mr-1" />,
  deprecated: <Info className="w-3.5 h-3.5 mr-1" />,
  in_review: <Clock className="w-3.5 h-3.5 mr-1" />,
  published: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
  cancelled: <XCircle className="w-3.5 h-3.5 mr-1" />,
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorKey = STATUS_COLORS[status];
  
  const variants: Record<string, string> = {
    success: "bg-success/15 text-success hover:bg-success/25 border-success/20",
    warning: "bg-warning/15 text-warning hover:bg-warning/25 border-warning/20",
    danger: "bg-danger/15 text-danger hover:bg-danger/25 border-danger/20",
    info: "bg-info/15 text-info hover:bg-info/25 border-info/20",
    muted: "bg-muted text-muted-foreground hover:bg-muted/80 border-border",
  };

  const variantClass = variants[colorKey] || variants.muted;

  return (
    <Badge variant="outline" className={`capitalize font-medium ${variantClass} ${className}`}>
      {statusIcons[status]}
      {status.replace("_", " ")}
    </Badge>
  );
}
