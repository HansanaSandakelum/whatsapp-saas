"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AddContactModal } from "@/components/contacts/add-contact-modal";
import { AddGroupModal } from "@/components/contacts/add-group-modal";
import {
  getContacts,
  getContactGroups,
  getOptInRecords,
} from "@/data/contacts";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  Plus,
  Search,
  MoreVertical,
  Users,
  UserCheck,
  UserX,
  Upload,
  MessageSquare,
  Shield,
  Megaphone,
  Trash2,
  Tag,
  Globe,
  Phone,
  Link2,
  Monitor,
  Mic,
  Store,
  FileDown,
  ExternalLink,
} from "lucide-react";
import type { Contact, ContactGroup, OptInRecord } from "@/types/contact";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/lib/constants";

// ── Helpers ──────────────────────────────────────────────────────────────────
function countryFlag(code: string) {
  return COUNTRIES.find((c) => c.code === code)?.flag ?? "🌐";
}

function OptInBadge({ status }: { status: string }) {
  if (status === "opted_in")
    return (
      <Badge
        variant="outline"
        className="bg-emerald-500/10 text-emerald-600 border-emerald-400/30 text-[10px] font-semibold px-2 py-0 h-5 gap-1"
      >
        <UserCheck className="w-3 h-3" /> Opted In
      </Badge>
    );
  if (status === "opted_out")
    return (
      <Badge
        variant="outline"
        className="bg-destructive/10 text-destructive border-destructive/30 text-[10px] font-semibold px-2 py-0 h-5 gap-1"
      >
        <UserX className="w-3 h-3" /> Opted Out
      </Badge>
    );
  return (
    <Badge
      variant="secondary"
      className="text-[10px] font-semibold px-2 py-0 h-5"
    >
      Pending
    </Badge>
  );
}

const METHOD_LABELS: Record<
  string,
  { label: string; icon: React.ElementType }
> = {
  web_form: { label: "Web Form", icon: Monitor },
  ivr: { label: "IVR / Phone", icon: Mic },
  in_store: { label: "In Store", icon: Store },
  imported: { label: "Import", icon: FileDown },
  conversation_reply: { label: "Conversation Reply", icon: MessageSquare },
  manual: { label: "Manual", icon: UserCheck },
};

function MethodBadge({ method }: { method: string }) {
  const m = METHOD_LABELS[method] ?? { label: method, icon: Globe };
  return (
    <Badge
      variant="secondary"
      className="gap-1 text-[10px] px-2 py-0 h-5 font-medium"
    >
      <m.icon className="w-3 h-3" />
      {m.label}
    </Badge>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
// function StatCard({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: React.ElementType; sub?: string }) {
//   return (
//     <div className="rounded-xl border bg-card p-4 flex gap-3 items-center">
//       <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
//         <Icon className="w-4 h-4 text-muted-foreground" />
//       </div>
//       <div className="min-w-0">
//         <p className="text-[11px] text-muted-foreground font-medium truncate">{label}</p>
//         <p className="text-lg font-bold tabular-nums leading-tight">{value}</p>
//         {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
//       </div>
//     </div>
//   );
// }

// ── CONTACTS TABLE ────────────────────────────────────────────────────────────
function ContactsTable({ search }: { search: string }) {
  const [optInFilter, setOptInFilter] = useState<
    "all" | "opted_in" | "opted_out"
  >("all");

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: [
      "contacts",
      { search, optInStatus: optInFilter === "all" ? undefined : optInFilter },
    ],
    queryFn: () =>
      getContacts({
        search,
        optInStatus: optInFilter === "all" ? undefined : optInFilter,
      }),
  });

  const optedIn = contacts.filter((c) => c.optInStatus === "opted_in").length;
  const optedOut = contacts.filter((c) => c.optInStatus === "opted_out").length;

  const columns: ColumnDef<Contact>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "contact",
      header: "Contact",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-border shrink-0">
              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                {c.firstName[0]}
                {c.lastName?.[0] ?? ""}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-sm">
                {c.firstName} {c.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {c.email ?? "—"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm font-mono">
          <span className="text-base">
            {countryFlag(row.original.countryCode)}
          </span>
          <span>{row.original.phone}</span>
        </div>
      ),
    },
    {
      accessorKey: "optInStatus",
      header: "Opt-in Status",
      cell: ({ row }) => <OptInBadge status={row.getValue("optInStatus")} />,
    },
    {
      accessorKey: "optInSource",
      header: "Opt-in Source",
      cell: ({ row }) => {
        const src = row.getValue("optInSource") as string | undefined;
        return src ? (
          <MethodBadge method={src} />
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );
      },
    },
    {
      id: "groups",
      header: "Groups",
      cell: ({ row }) => {
        const count = row.original.groupIds.length;
        return count > 0 ? (
          <Badge
            variant="secondary"
            className="text-[11px] font-medium gap-1 h-5 px-2"
          >
            <Users className="w-3 h-3" /> {count}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );
      },
    },
    {
      id: "tags",
      header: "Tags",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[160px]">
          {row.original.tags.slice(0, 2).map((t) => (
            <Badge
              key={t}
              variant="outline"
              className="text-[10px] px-1.5 py-0"
            >
              {t}
            </Badge>
          ))}
          {row.original.tags.length > 2 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              +{row.original.tags.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "lastMessaged",
      header: "Last Messaged",
      cell: ({ row }) => {
        const d = row.getValue("lastMessaged") as string | undefined;
        return (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {d
              ? formatDistanceToNow(new Date(d), { addSuffix: true })
              : "Never"}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="h-8 w-8 p-0" />}
          >
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <MessageSquare className="w-4 h-4 mr-2" /> View Conversation
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Shield className="w-4 h-4 mr-2" /> Opt-in Record
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Tag className="w-4 h-4 mr-2" /> Edit Tags
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="w-4 h-4 mr-2" /> Add to Group
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats row */}

      {/* Filter tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["all", "opted_in", "opted_out"] as const).map((f) => (
            <Badge
              key={f}
              variant={optInFilter === f ? "default" : "secondary"}
              className={cn(
                "cursor-pointer text-[11px] px-3 py-0.5",
                optInFilter !== f &&
                  "font-normal text-muted-foreground hover:bg-muted",
              )}
              onClick={() => setOptInFilter(f)}
            >
              {f === "all"
                ? "All"
                : f === "opted_in"
                  ? "Opted In"
                  : "Opted Out"}
            </Badge>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable columns={columns} data={contacts} />
      )}
    </div>
  );
}

// ── GROUPS TABLE ──────────────────────────────────────────────────────────────
function GroupsTable() {
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["contactGroups"],
    queryFn: getContactGroups,
  });

  const columns: ColumnDef<ContactGroup>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "group",
      header: "Group",
      cell: ({ row }) => {
        const g = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{g.name}</p>
              {g.description && (
                <p className="text-xs text-muted-foreground">{g.description}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "memberCount",
      header: "Members",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 font-semibold tabular-nums text-sm">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          {row.getValue<number>("memberCount").toLocaleString()}
        </div>
      ),
    },
    {
      id: "tags",
      header: "Tags",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.tags.map((t) => (
            <Badge
              key={t}
              variant="secondary"
              className="text-[10px] px-1.5 py-0 font-medium"
            >
              {t}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDistanceToNow(new Date(row.getValue("updatedAt")), {
            addSuffix: true,
          })}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="h-8 w-8 p-0" />}
          >
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Users className="w-4 h-4 mr-2" /> View Members
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Megaphone className="w-4 h-4 mr-2" /> New Campaign to Group
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Tag className="w-4 h-4 mr-2" /> Edit Group
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Delete Group
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const totalMembers = groups.reduce((a, g) => a + g.memberCount, 0);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable columns={columns} data={groups} />
      )}
    </div>
  );
}

// ── OPT-IN RECORDS TABLE ──────────────────────────────────────────────────────
function OptInTable() {
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["optInRecords"],
    queryFn: () => getOptInRecords(),
  });

  const columns: ColumnDef<OptInRecord>[] = [
    {
      id: "contact",
      header: "Contact",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div>
            <p className="font-semibold text-sm">{r.contactName}</p>
            <p className="text-xs text-muted-foreground font-mono">{r.phone}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <OptInBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "method",
      header: "Opt-in Method",
      cell: ({ row }) => <MethodBadge method={row.getValue("method")} />,
    },
    {
      accessorKey: "sourceUrl",
      header: "Source URL",
      cell: ({ row }) => {
        const url = row.getValue("sourceUrl") as string | undefined;
        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1 max-w-[180px] truncate"
          >
            <ExternalLink className="w-3 h-3 shrink-0" />
            {url.replace(/^https?:\/\//, "")}
          </a>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );
      },
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      cell: ({ row }) => {
        const ip = row.getValue("ipAddress") as string | undefined;
        return (
          <span className="text-xs font-mono text-muted-foreground">
            {ip ?? "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "timestamp",
      header: "Timestamp",
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          <p>{format(new Date(row.getValue("timestamp")), "MMM d, yyyy")}</p>
          <p className="opacity-70">
            {format(new Date(row.getValue("timestamp")), "HH:mm:ss")}
          </p>
        </div>
      ),
    },
  ];

  const optedInCount = records.filter((r) => r.status === "opted_in").length;

  return (
    <div className="space-y-4">
      {/* Meta Compliance info */}
      <div className="rounded-xl border border-amber-400/30 bg-amber-500/5 px-5 py-3.5 flex gap-3 items-start">
        <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm space-y-0.5">
          <p className="font-semibold text-amber-600 dark:text-amber-400">
            Meta Opt-in Audit Log
          </p>
          <p className="text-xs text-muted-foreground">
            WhatsApp Business Policy requires verifiable opt-in records
            including method, source URL, IP, and timestamp. This log serves as
            your compliance record.{" "}
            <a
              href="https://developers.facebook.com/docs/whatsapp/overview/getting-opt-in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-0.5"
            >
              Meta Policy <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {records.length} records · {optedInCount} opted in ·{" "}
          {records.length - optedInCount} opted out
        </span>
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <FileDown className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable columns={columns} data={records} />
      )}
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("contacts");

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Contacts"
        description="Manage opt-in contacts, audience groups, and compliance records for WhatsApp messaging."
        actions={
          <>
            <Button variant="outline" className="gap-2 h-9">
              <Upload className="w-4 h-4" /> Import
            </Button>
            {tab === "groups" ? (
              <AddGroupModal />
            ) : (
              <AddContactModal />
            )}
          </>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="contacts" className="gap-2">
              <UserCheck className="w-4 h-4" /> Contacts
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-2">
              <Users className="w-4 h-4" /> Groups
            </TabsTrigger>
            <TabsTrigger value="opt-ins" className="gap-2">
              <Shield className="w-4 h-4" /> Opt-in Records
            </TabsTrigger>
          </TabsList>

          {tab === "contacts" && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
        </div>

        <TabsContent value="contacts" className="mt-6">
          <ContactsTable search={search} />
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          <GroupsTable />
        </TabsContent>

        <TabsContent value="opt-ins" className="mt-6">
          <OptInTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
