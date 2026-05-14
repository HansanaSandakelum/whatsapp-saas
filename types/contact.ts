import type { OptInStatus } from "./common";

export type ContactSource =
  | "web_form"
  | "ivr"
  | "in_store"
  | "imported"
  | "conversation_reply"
  | "manual";

export interface ContactAttribute {
  key: string;
  value: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  countryCode: string;
  email?: string;
  tags: string[];
  optInStatus: OptInStatus;
  optInSource?: ContactSource;
  optInTimestamp?: string;
  optInIp?: string;
  optInSourceUrl?: string;
  lastMessaged?: string;
  attributes: ContactAttribute[];
  groupIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactGroup {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OptInRecord {
  id: string;
  contactId: string;
  contactName: string;
  phone: string;
  method: ContactSource;
  sourceUrl?: string;
  timestamp: string;
  ipAddress?: string;
  status: OptInStatus;
}
