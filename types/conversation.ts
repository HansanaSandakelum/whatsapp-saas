import type { ConversationStatus, MessageStatus, OptInStatus } from "./common";

export type MessageDirection = "inbound" | "outbound";
export type MessageType =
  | "text"
  | "image"
  | "document"
  | "audio"
  | "video"
  | "location"
  | "contact"
  | "button_reply"
  | "list_reply"
  | "template";

export interface MessageMedia {
  url: string;
  mimeType: string;
  filename?: string;
  caption?: string;
}

export interface MessageLocation {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  direction: MessageDirection;
  type: MessageType;
  text?: string;
  media?: MessageMedia;
  location?: MessageLocation;
  status: MessageStatus;
  timestamp: string;
  templateName?: string;
}

export interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  contactAvatar?: string;
  senderId: string;
  senderName: string;
  status: ConversationStatus;
  optInStatus: OptInStatus;
  lastMessage?: Message;
  unreadCount: number;
  windowExpiresAt: string;
  assignedTo?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
