// Common status types
export type TemplateStatus = "approved" | "pending" | "rejected" | "draft";
export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";
export type SenderStatus = "approved" | "pending" | "rejected";
export type MessageStatus = "sent" | "delivered" | "read" | "failed";
export type OptInStatus = "opted_in" | "opted_out";
export type FlowStatus = "draft" | "in_review" | "published" | "deprecated";
export type ConversationStatus = "open" | "resolved" | "pending";

export type QualityRating = "high" | "medium" | "low";

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}
