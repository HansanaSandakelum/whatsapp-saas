"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { ROUTES } from "@/lib/constants";
import {
  Smartphone,
  FileText,
  Workflow,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Users,
  BarChart3,
  ShieldCheck,
  CreditCard,
  Code2,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageCircleCode,
} from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  icon: any; // Using any for LucideIcon to simplify
  badge?: number;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "ENGAGE",
    items: [
      { name: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
      { name: "Campaigns", href: ROUTES.CAMPAIGNS, icon: Megaphone },
      {
        name: "Conversations",
        href: ROUTES.CONVERSATIONS,
        icon: MessageSquare,
        badge: 3,
      },
      // { name: "Contacts", href: ROUTES.CONTACTS, icon: Users },
    ],
  },
  {
    label: "SETUP",
    items: [
      { name: "Senders", href: ROUTES.SENDERS, icon: Smartphone },
      { name: "Templates", href: ROUTES.TEMPLATES, icon: FileText },
      // { name: "Flows", href: ROUTES.FLOWS, icon: Workflow },
    ],
  },
  {
    label: "OPERATE",
    items: [
      { name: "Reports", href: ROUTES.REPORTS, icon: BarChart3 },
      // { name: "Compliance", href: ROUTES.COMPLIANCE, icon: ShieldCheck },
      { name: "Billing", href: ROUTES.BILLING, icon: CreditCard },
      { name: "API", href: ROUTES.API, icon: Code2 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-[hsl(var(--sidebar-bg))] text-sidebar-fg transition-all duration-300 border-r border-sidebar-border z-20",
        sidebarCollapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex items-center h-14 px-4 border-b border-sidebar-border shrink-0">
        <Link
          href={ROUTES.DASHBOARD}
          className="flex items-center gap-2 overflow-hidden text-white hover:text-white"
        >
          <MessageCircleCode className="w-6 h-6 shrink-0 text-primary" />
          {!sidebarCollapsed && (
            <span className="font-semibold text-lg tracking-tight truncate">
              WhatsApp SaaS
            </span>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <nav className="space-y-6 px-2">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!sidebarCollapsed && (
                <div className="px-2 mb-2 text-xs font-semibold text-sidebar-fg/60 tracking-wider">
                  {group.label}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-2 py-2 rounded-md transition-colors relative group",
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "hover:bg-sidebar-accent/10 hover:text-sidebar-foreground",
                        sidebarCollapsed ? "justify-center" : "",
                      )}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      {isActive && !sidebarCollapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-md" />
                      )}
                      <item.icon
                        className={cn(
                          "w-5 h-5 shrink-0",
                          isActive ? "text-primary" : "",
                        )}
                      />
                      {!sidebarCollapsed && (
                        <span className="flex-1 truncate text-sm font-medium">
                          {item.name}
                        </span>
                      )}
                      {!sidebarCollapsed && item.badge && (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="p-2 border-t border-sidebar-border mt-auto">
        <Link
          href={ROUTES.SETTINGS}
          className={cn(
            "flex items-center gap-3 px-2 py-2 rounded-md transition-colors",
            pathname.startsWith(ROUTES.SETTINGS)
              ? "bg-primary/15 text-primary"
              : "hover:bg-sidebar-accent/10 hover:text-sidebar-foreground",
            sidebarCollapsed ? "justify-center" : "",
          )}
          title={sidebarCollapsed ? "Settings" : undefined}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!sidebarCollapsed && (
            <span className="truncate text-sm font-medium">Settings</span>
          )}
        </Link>
      </div>

      {/* ── Premium Sidebar Toggle ── */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "group absolute -right-3.5 top-[72px] z-30",
          "flex items-center justify-center",
          "w-6 h-6 rounded-full",
          "bg-gradient-to-br from-primary/90 to-primary",
          "shadow-[0_0_0_2px_hsl(var(--sidebar-bg)),0_2px_8px_rgba(0,0,0,0.35)]",
          "ring-1 ring-primary/30",
          "transition-all duration-200 ease-out",
          "hover:scale-110 hover:shadow-[0_0_0_2px_hsl(var(--sidebar-bg)),0_4px_16px_rgba(0,0,0,0.4)]",
          "hover:ring-2 hover:ring-primary/50",
          "active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2",
        )}
      >
        {/* Animated inner glow */}
        <span
          className={cn(
            "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent_70%)]",
          )}
        />
        {sidebarCollapsed ? (
          <ChevronRight className="relative w-3.5 h-3.5 text-primary-foreground transition-transform duration-200 group-hover:translate-x-px" />
        ) : (
          <ChevronLeft className="relative w-3.5 h-3.5 text-primary-foreground transition-transform duration-200 group-hover:-translate-x-px" />
        )}
      </button>
    </aside>
  );
}
