import type { TemplateStatus } from "./common";

export type TemplateCategory = "MARKETING" | "UTILITY" | "AUTHENTICATION";
export type TemplateHeaderType = "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "NONE";
export type ButtonType = "QUICK_REPLY" | "CALL_TO_ACTION" | "URL" | "PHONE";

export interface TemplateButton {
  id: string;
  type: ButtonType;
  text: string;
  url?: string;
  phoneNumber?: string;
}

export interface TemplateHeader {
  type: TemplateHeaderType;
  text?: string;
  mediaUrl?: string;
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  language: string;
  status: TemplateStatus;
  header?: TemplateHeader;
  body: string;
  footer?: string;
  buttons: TemplateButton[];
  variableCount: number;
  senderId: string;
  senderName: string;
  metaTemplateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceIssue {
  severity: "error" | "warning" | "info";
  message: string;
  field?: string;
}
