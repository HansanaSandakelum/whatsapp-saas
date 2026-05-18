import type { Conversation, Message } from "@/types/conversation";
import { randomDelay } from "@/lib/utils";

const baseTime = new Date();

function hoursFromNow(h: number): string {
  return new Date(baseTime.getTime() + h * 60 * 60 * 1000).toISOString();
}

function minutesAgo(m: number): string {
  return new Date(baseTime.getTime() - m * 60 * 1000).toISOString();
}

function hoursAgo(h: number): string {
  return new Date(baseTime.getTime() - h * 60 * 60 * 1000).toISOString();
}

const conversationsData: Conversation[] = [
  {
    id: "conv-1",
    contactId: "contact-1",
    contactName: "Sarah Johnson",
    contactPhone: "+14155550101",
    senderId: "sender-1",
    senderName: "AcmeCorp Support",
    status: "open",
    optInStatus: "opted_in",
    lastMessage: {
      id: "msg-1-last",
      conversationId: "conv-1",
      direction: "inbound",
      type: "text",
      text: "Thanks for your help! When will my order arrive?",
      status: "delivered",
      timestamp: minutesAgo(5),
    },
    unreadCount: 2,
    windowExpiresAt: hoursFromNow(20),
    assignedTo: "agent-1",
    campaignId: "camp-2",
    campaignName: "January Order Confirmations",
    campaignCategory: "UTILITY",
    tags: ["vip", "support"],
    createdAt: hoursAgo(22),
    updatedAt: minutesAgo(5),
  },
  {
    id: "conv-2",
    contactId: "contact-2",
    contactName: "Marcus Williams",
    contactPhone: "+14155550102",
    senderId: "sender-1",
    senderName: "AcmeCorp Support",
    status: "open",
    optInStatus: "opted_in",
    lastMessage: {
      id: "msg-2-last",
      conversationId: "conv-2",
      direction: "outbound",
      type: "text",
      text: "Your refund has been processed. Please allow 3-5 business days.",
      status: "read",
      timestamp: minutesAgo(45),
    },
    unreadCount: 0,
    windowExpiresAt: hoursFromNow(3.5),
    assignedTo: "agent-2",
    tags: ["refund"],
    createdAt: hoursAgo(20),
    updatedAt: minutesAgo(45),
  },
  {
    id: "conv-3",
    contactId: "contact-3",
    contactName: "Priya Sharma",
    contactPhone: "+919876543210",
    senderId: "sender-2",
    senderName: "AcmeCorp Marketing",
    status: "open",
    optInStatus: "opted_in",
    lastMessage: {
      id: "msg-3-last",
      conversationId: "conv-3",
      direction: "inbound",
      type: "button_reply",
      text: "Learn More",
      status: "delivered",
      timestamp: minutesAgo(12),
    },
    unreadCount: 1,
    windowExpiresAt: hoursFromNow(0.5),
    campaignId: "camp-1",
    campaignName: "Black Friday Flash Sale",
    campaignCategory: "MARKETING",
    tags: ["marketing"],
    createdAt: hoursAgo(23),
    updatedAt: minutesAgo(12),
  },
  {
    id: "conv-4",
    contactId: "contact-4",
    contactName: "James O'Brien",
    contactPhone: "+447700900123",
    senderId: "sender-1",
    senderName: "AcmeCorp Support",
    status: "resolved",
    optInStatus: "opted_in",
    lastMessage: {
      id: "msg-4-last",
      conversationId: "conv-4",
      direction: "outbound",
      type: "text",
      text: "Glad we could help! Have a great day, James.",
      status: "read",
      timestamp: hoursAgo(2),
    },
    unreadCount: 0,
    windowExpiresAt: hoursAgo(25),
    assignedTo: "agent-1",
    tags: ["resolved"],
    createdAt: hoursAgo(48),
    updatedAt: hoursAgo(2),
  },
  {
    id: "conv-5",
    contactId: "contact-5",
    contactName: "Ana Lima",
    contactPhone: "+5511987654321",
    senderId: "sender-2",
    senderName: "AcmeCorp Marketing",
    status: "open",
    optInStatus: "opted_in",
    lastMessage: {
      id: "msg-5-last",
      conversationId: "conv-5",
      direction: "inbound",
      type: "text",
      text: "Gostaria de saber mais sobre os produtos",
      status: "delivered",
      timestamp: minutesAgo(90),
    },
    unreadCount: 3,
    windowExpiresAt: hoursFromNow(7),
    campaignId: "camp-3",
    campaignName: "Spring Welcome Campaign",
    campaignCategory: "MARKETING",
    tags: ["brazil", "inquiry"],
    createdAt: hoursAgo(10),
    updatedAt: minutesAgo(90),
  },
  {
    id: "conv-6",
    contactId: "contact-6",
    contactName: "David Chen",
    contactPhone: "+6598765432",
    senderId: "sender-1",
    senderName: "AcmeCorp Support",
    status: "pending",
    optInStatus: "opted_in",
    lastMessage: {
      id: "msg-6-last",
      conversationId: "conv-6",
      direction: "inbound",
      type: "text",
      text: "I need urgent help with my account!",
      status: "delivered",
      timestamp: minutesAgo(3),
    },
    unreadCount: 4,
    windowExpiresAt: hoursFromNow(22),
    tags: ["urgent"],
    createdAt: minutesAgo(30),
    updatedAt: minutesAgo(3),
  },
];

const messagesData: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "msg-1-1",
      conversationId: "conv-1",
      direction: "outbound",
      type: "template",
      text: "Hi Sarah! Your order #ORD-12345 has been confirmed. Total: $89.99. Expected delivery: May 18th.",
      status: "read",
      timestamp: hoursAgo(22),
      templateName: "order_confirmation",
    },
    {
      id: "msg-1-2",
      conversationId: "conv-1",
      direction: "inbound",
      type: "text",
      text: "Hi! I was wondering if I can change my delivery address?",
      status: "delivered",
      timestamp: hoursAgo(21),
    },
    {
      id: "msg-1-3",
      conversationId: "conv-1",
      direction: "outbound",
      type: "text",
      text: "Of course! Please provide your new address and I'll update it right away.",
      status: "read",
      timestamp: hoursAgo(20.5),
    },
    {
      id: "msg-1-4",
      conversationId: "conv-1",
      direction: "inbound",
      type: "text",
      text: "Great, it's 456 Oak Ave, San Francisco, CA 94107. Thank you!",
      status: "delivered",
      timestamp: hoursAgo(20),
    },
    {
      id: "msg-1-5",
      conversationId: "conv-1",
      direction: "outbound",
      type: "text",
      text: "Done! I've updated your delivery address to 456 Oak Ave. Your order is on track for May 18th delivery.",
      status: "read",
      timestamp: hoursAgo(19.5),
    },
    {
      id: "msg-1-last",
      conversationId: "conv-1",
      direction: "inbound",
      type: "text",
      text: "Thanks for your help! When will my order arrive?",
      status: "delivered",
      timestamp: minutesAgo(5),
    },
  ],
  "conv-2": [
    {
      id: "msg-2-1",
      conversationId: "conv-2",
      direction: "inbound",
      type: "text",
      text: "Hello, I want to return my purchase",
      status: "read",
      timestamp: hoursAgo(20),
    },
    {
      id: "msg-2-2",
      conversationId: "conv-2",
      direction: "outbound",
      type: "text",
      text: "I'd be happy to help with your return. Could you please provide your order number?",
      status: "read",
      timestamp: hoursAgo(19.5),
    },
    {
      id: "msg-2-3",
      conversationId: "conv-2",
      direction: "inbound",
      type: "text",
      text: "Order #ORD-98765",
      status: "read",
      timestamp: hoursAgo(19),
    },
    {
      id: "msg-2-last",
      conversationId: "conv-2",
      direction: "outbound",
      type: "text",
      text: "Your refund has been processed. Please allow 3-5 business days.",
      status: "read",
      timestamp: minutesAgo(45),
    },
  ],
  "conv-3": [
    {
      id: "msg-3-1",
      conversationId: "conv-3",
      direction: "outbound",
      type: "template",
      text: "🔥 40% OFF for the next 48 hours only! Use code SALE40 at checkout. Shop now!",
      status: "read",
      timestamp: hoursAgo(23),
      templateName: "flash_sale_promo",
    },
    {
      id: "msg-3-last",
      conversationId: "conv-3",
      direction: "inbound",
      type: "button_reply",
      text: "Learn More",
      status: "delivered",
      timestamp: minutesAgo(12),
    },
  ],
  "conv-5": [
    {
      id: "msg-5-1",
      conversationId: "conv-5",
      direction: "outbound",
      type: "template",
      text: "🎊 Welcome! Here's your 20% off with code SPRING2025.",
      status: "delivered",
      timestamp: hoursAgo(10),
      templateName: "welcome_new_customer",
    },
    {
      id: "msg-5-last",
      conversationId: "conv-5",
      direction: "inbound",
      type: "text",
      text: "Gostaria de saber mais sobre os produtos",
      status: "delivered",
      timestamp: minutesAgo(90),
    },
  ],
  "conv-6": [
    {
      id: "msg-6-1",
      conversationId: "conv-6",
      direction: "inbound",
      type: "text",
      text: "I need urgent help with my account!",
      status: "delivered",
      timestamp: minutesAgo(3),
    },
  ],
};

export async function getConversations(filters?: {
  status?: string;
  search?: string;
  assignedTo?: string;
}): Promise<Conversation[]> {
  await randomDelay();
  let result = [...conversationsData];
  if (filters?.status && filters.status !== "all") {
    if (filters.status === "unread") result = result.filter((c) => c.unreadCount > 0);
    else if (filters.status === "assigned") result = result.filter((c) => c.assignedTo);
    else if (filters.status === "unassigned") result = result.filter((c) => !c.assignedTo);
    else result = result.filter((c) => c.status === filters.status);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(
      (c) => c.contactName.toLowerCase().includes(s) || c.contactPhone.includes(s)
    );
  }
  return result;
}

export async function getConversationById(id: string): Promise<Conversation | null> {
  await randomDelay();
  return conversationsData.find((c) => c.id === id) ?? null;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  await randomDelay();
  return messagesData[conversationId] ?? [];
}

export async function sendMessage(
  conversationId: string,
  message: Omit<Message, "id" | "timestamp" | "status">
): Promise<Message> {
  await randomDelay();
  const newMsg: Message = {
    ...message,
    id: `msg-${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: "sent",
  };
  if (!messagesData[conversationId]) messagesData[conversationId] = [];
  messagesData[conversationId].push(newMsg);
  return newMsg;
}

export function getRandomConversationId(): string {
  const ids = Object.keys(messagesData);
  return ids[Math.floor(Math.random() * ids.length)];
}

export function generateInboundMessage(conversationId: string): Message {
  const texts = [
    "Can you help me with my order?",
    "When will this be delivered?",
    "I love your products! 😊",
    "Is there a discount available?",
    "Thanks for the quick response!",
    "I have a question about billing",
  ];
  const msg: Message = {
    id: `msg-${Date.now()}`,
    conversationId,
    direction: "inbound",
    type: "text",
    text: texts[Math.floor(Math.random() * texts.length)],
    status: "delivered",
    timestamp: new Date().toISOString(),
  };
  if (!messagesData[conversationId]) messagesData[conversationId] = [];
  messagesData[conversationId].push(msg);
  return msg;
}
