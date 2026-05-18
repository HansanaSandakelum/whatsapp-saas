"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConversations,
  getMessages,
  sendMessage,
} from "@/data/conversations";
import {
  Search,
  MoreVertical,
  Paperclip,
  Send,
  Smile,
  Phone,
  Video,
  Tag,
  Clock,
  Check,
  CheckCheck,
  Loader2,
  MessageSquare,
  AlertCircle,
  Phone as PhoneIcon,
  SearchX,
  LayoutTemplate,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { Conversation, Message } from "@/types/conversation";
import { format, formatDistanceToNow, isAfter } from "date-fns";

export function ConversationsClient() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "resolved">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // New Message State
  const [inputText, setInputText] = useState("");

  const { data: conversations = [], isLoading: isLoadingConversations } =
    useQuery({
      queryKey: ["conversations", activeTab, search],
      queryFn: () =>
        getConversations({
          status:
            activeTab === "unread"
              ? "unread"
              : activeTab === "resolved"
                ? "resolved"
                : "open",
          search,
        }),
    });

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ["messages", activeConversationId],
    queryFn: () => getMessages(activeConversationId!),
    enabled: !!activeConversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (msg: Omit<Message, "id" | "timestamp" | "status">) =>
      sendMessage(activeConversationId!, msg),
    onSuccess: (newMsg) => {
      queryClient.setQueryData(
        ["messages", activeConversationId],
        (old: Message[] = []) => [...old, newMsg],
      );
      // Update last message in conversation list
      queryClient.setQueryData(
        ["conversations", activeTab, search],
        (old: Conversation[] = []) => {
          return old.map((c) =>
            c.id === activeConversationId ? { ...c, lastMessage: newMsg } : c,
          );
        },
      );
      setInputText("");
      scrollToBottom();
    },
  });

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );
  const is24hWindowOpen = activeConversation
    ? isAfter(new Date(activeConversation.windowExpiresAt), new Date())
    : false;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, activeConversationId]);

  const handleSend = () => {
    if (!inputText.trim() || !activeConversationId) return;
    sendMessageMutation.mutate({
      conversationId: activeConversationId,
      direction: "outbound",
      type: "text",
      text: inputText.trim(),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (dateStr: string) => {
    return format(new Date(dateStr), "HH:mm");
  };

  const groupedConversations = React.useMemo(() => {
    const categories: Record<string, Record<string, Conversation[]>> = {
      MARKETING: {},
      UTILITY: {},
      AUTHENTICATION: {},
      UNCATEGORIZED: {},
    };

    for (const chat of conversations) {
      const cat = chat.campaignCategory || "UNCATEGORIZED";
      const campName = chat.campaignName || "General / Support";
      if (!categories[cat]) categories[cat] = {};
      if (!categories[cat][campName]) categories[cat][campName] = [];
      categories[cat][campName].push(chat);
    }
    
    const result = [];
    for (const [catName, camps] of Object.entries(categories)) {
      const campEntries = Object.entries(camps);
      if (campEntries.length > 0) {
        result.push({
          category: catName,
          campaigns: campEntries.map(([name, chats]) => ({ name, chats }))
        });
      }
    }
    return result;
  }, [conversations]);

  return (
    <div className="flex flex-1 h-full overflow-hidden bg-background divide-x divide-border">
      {/* ── LEFT PANEL: Chat List ── */}
      <div className="w-80 shrink-0 flex flex-col h-full bg-card">
        {/* Header & Search */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            {selectedCategory ? (
              <div className="flex items-center gap-2 min-w-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 -ml-2 shrink-0" 
                  onClick={() => { setSelectedCategory(null); setActiveConversationId(null); }}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-xl font-bold tracking-tight truncate">{selectedCategory}</h2>
              </div>
            ) : (
              <h2 className="text-xl font-bold tracking-tight">Categories</h2>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:border-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Tabs */}
          <div className="flex gap-2">
            {(["all", "unread", "resolved"] as const).map((tab) => (
              <Badge
                key={tab}
                variant={activeTab === tab ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer capitalize text-[11px] px-3 py-0.5",
                  activeTab !== tab &&
                    "hover:bg-muted font-normal text-muted-foreground",
                )}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Badge>
            ))}
          </div>
        </div>

        {/* List */}
        <ScrollArea className="flex-1">
          {isLoadingConversations ? (
            <div className="p-8 flex justify-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
              <SearchX className="w-10 h-10 opacity-20" />
              <p className="text-sm">No conversations found.</p>
            </div>
          ) : !selectedCategory ? (
            <div className="divide-y divide-border">
              {groupedConversations.map((group) => {
                const totalChats = group.campaigns.reduce((sum, camp) => sum + camp.chats.length, 0);
                return (
                  <div
                    key={group.category}
                    onClick={() => setSelectedCategory(group.category)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        {group.category === "MARKETING" && <Tag className="w-5 h-5" />}
                        {group.category === "UTILITY" && <Clock className="w-5 h-5" />}
                        {group.category === "UNCATEGORIZED" && <MessageSquare className="w-5 h-5" />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm truncate">{group.category}</span>
                        <span className="text-xs text-muted-foreground">{group.campaigns.length} Campaigns</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{totalChats}</Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="pb-4">
              {(() => {
                const group = groupedConversations.find(g => g.category === selectedCategory);
                if (!group) return null;
                return group.campaigns.map((camp) => (
                  <div key={camp.name} className="mb-0">
                    <div className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm px-4 py-1.5 border-y border-border flex items-center justify-between">
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                        {camp.name}
                      </span>
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                        {camp.chats.length}
                      </Badge>
                    </div>
                    <div className="divide-y divide-border">
                      {camp.chats.map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => setActiveConversationId(chat.id)}
                          className={cn(
                            "p-4 flex gap-3 cursor-pointer transition-colors relative",
                            activeConversationId === chat.id
                              ? "bg-primary/5"
                              : "hover:bg-muted/30",
                          )}
                        >
                          {/* Active Indicator */}
                          {activeConversationId === chat.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                          )}

                          <Avatar className="h-10 w-10 border border-border shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {chat.contactName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm truncate pr-2">
                                {chat.contactName}
                              </span>
                              {chat.lastMessage && (
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                                  {formatDistanceToNow(
                                    new Date(chat.lastMessage.timestamp),
                                    { addSuffix: true },
                                  )}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs text-muted-foreground truncate flex-1">
                                {chat.lastMessage?.text || "Started conversation"}
                              </p>
                              {chat.unreadCount > 0 && (
                                <Badge className="h-5 min-w-[20px] rounded-full flex items-center justify-center px-1.5 bg-primary text-primary-foreground text-[10px]">
                                  {chat.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* ── CENTER PANEL: Main Chat Window ── */}
      <div className="flex-1 flex flex-col h-full bg-[#f0f2f5] dark:bg-[#0b141a] relative">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 border-b flex items-center justify-between bg-card z-10 shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {activeConversation.contactName
                      .substring(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">
                    {activeConversation.contactName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {activeConversation.contactPhone}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!is24hWindowOpen && (
                  <Badge
                    variant="destructive"
                    className="text-[10px] uppercase font-bold py-0 h-5"
                  >
                    24h Window Closed
                  </Badge>
                )}
                {is24hWindowOpen && (
                  <Badge
                    variant="outline"
                    className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 text-[10px] uppercase font-bold py-0 h-5"
                  >
                    24h Window Active
                  </Badge>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:px-12 pattern-dots relative flex flex-col">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

              <div className="flex flex-col gap-4 z-10 min-h-full">
                {isLoadingMessages ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm flex-col gap-2">
                    <MessageSquare className="w-8 h-8 opacity-20" />
                    No messages yet
                  </div>
                ) : (
                  <>
                    <div className="flex justify-center mb-4">
                      <span className="bg-card text-muted-foreground text-[10px] font-medium px-3 py-1 rounded-full shadow-sm border">
                        Conversation started
                      </span>
                    </div>
                    {messages.map((msg) => {
                      const isOutbound = msg.direction === "outbound";
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex w-full",
                            isOutbound ? "justify-end" : "justify-start",
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2 shadow-sm relative group",
                              isOutbound
                                ? "bg-emerald-100 dark:bg-[#005c4b] text-emerald-950 dark:text-[#e9edef] rounded-tr-sm"
                                : "bg-white dark:bg-[#202c33] text-gray-900 dark:text-[#e9edef] border border-border/50 rounded-tl-sm",
                            )}
                          >
                            {/* Template Tag */}
                            {msg.type === "template" && (
                              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-1.5 opacity-60">
                                <LayoutTemplate className="w-3 h-3" />
                                Template Message
                              </div>
                            )}

                            {/* Message Content */}
                            <div className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">
                              {msg.text}
                            </div>

                            {/* Metadata */}
                            <div className="flex items-center justify-end gap-1 mt-1 shrink-0">
                              <span
                                className={cn(
                                  "text-[9px]",
                                  isOutbound
                                    ? "text-emerald-700/60 dark:text-white/50"
                                    : "text-muted-foreground/60",
                                )}
                              >
                                {formatMessageTime(msg.timestamp)}
                              </span>
                              {isOutbound && (
                                <span>
                                  {msg.status === "sent" && (
                                    <Check className="w-3 h-3 text-emerald-700/60 dark:text-white/50" />
                                  )}
                                  {msg.status === "delivered" && (
                                    <CheckCheck className="w-3 h-3 text-emerald-700/60 dark:text-white/50" />
                                  )}
                                  {msg.status === "read" && (
                                    <CheckCheck className="w-3 h-3 text-blue-500" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-card border-t shrink-0 z-10 flex flex-col gap-2">
              {!is24hWindowOpen ? (
                <div className="flex flex-col items-center justify-center py-2 px-4 bg-muted/30 rounded-xl border border-dashed gap-3 text-center">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <AlertCircle className="w-4 h-4 text-warning" />
                    <span className="font-medium">
                      The 24-hour customer service window has closed.
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/80 max-w-sm">
                    Meta requires using an approved WhatsApp template to
                    initiate a conversation outside of the 24-hour window.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 h-8 text-xs font-semibold bg-background"
                  >
                    <LayoutTemplate className="w-3.5 h-3.5" /> Send Template
                    Message
                  </Button>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground rounded-full"
                  >
                    <Smile className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground rounded-full"
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>

                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      className="w-full bg-muted/50 border-transparent focus-visible:ring-1 min-h-[44px] rounded-xl pr-10"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={sendMessageMutation.isPending}
                    />
                  </div>

                  <Button
                    className="h-11 w-11 shrink-0 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all"
                    onClick={handleSend}
                    disabled={
                      !inputText.trim() || sendMessageMutation.isPending
                    }
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 ml-0.5" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-[#f0f2f5] dark:bg-[#0b141a]">
            <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-primary/40" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">
              WhatsApp Web
            </h3>
            <p className="text-sm max-w-sm">
              Select a conversation from the left to view messages, or start a
              new chat using an approved template.
            </p>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL: Contact Info ── */}
      {activeConversation && (
        <div className="w-80 shrink-0 flex flex-col h-full bg-card overflow-y-auto">
          <div className="h-16 border-b flex items-center px-4 font-semibold text-sm shrink-0">
            Contact Details
          </div>
          <div className="p-6 flex flex-col items-center border-b">
            <Avatar className="h-20 w-20 mb-4 border-2 border-background shadow-sm">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {activeConversation.contactName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-bold text-lg">
              {activeConversation.contactName}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <PhoneIcon className="w-3.5 h-3.5" />{" "}
              {activeConversation.contactPhone}
            </p>
          </div>

          <div className="p-4 space-y-6">
            {/* Status & Attributes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                Status
              </h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Opt-in</span>
                {activeConversation.optInStatus === "opted_in" ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 px-2 py-0"
                  >
                    Opted In
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-muted text-muted-foreground px-2 py-0"
                  >
                    Pending
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">24h Window</span>
                <span
                  className={cn(
                    "font-medium text-xs",
                    is24hWindowOpen ? "text-emerald-500" : "text-destructive",
                  )}
                >
                  {is24hWindowOpen ? "Active" : "Closed"}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Labels
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeConversation.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[10px] px-2 py-0 font-medium"
                  >
                    {tag}
                  </Badge>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-5 px-2 text-[10px] rounded-full border-dashed"
                >
                  + Add
                </Button>
              </div>
            </div>

            {/* Meta Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                Conversation Info
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono text-[10px]">
                    {activeConversation.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned to</span>
                  <span className="font-medium">
                    {activeConversation.assignedTo || "Unassigned"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Started</span>
                  <span>
                    {format(
                      new Date(activeConversation.createdAt),
                      "MMM d, yyyy",
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full text-xs h-9 justify-start gap-2"
              >
                <LayoutTemplate className="w-4 h-4 text-muted-foreground" />
                Send Template
              </Button>
              <Button
                variant="outline"
                className="w-full text-xs h-9 justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/5"
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Resolved
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Temporary icon to avoid large imports
function CheckCircle(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
