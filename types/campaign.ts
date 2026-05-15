import { CampaignStatus } from "./common";
export type AudienceMode = 'GROUP' | 'CSV' | 'FILTER'; export type ScheduleMode = 'SEND_NOW' | 'SCHEDULED'; export type SystemVariable = 'today' | 'tomorrow' | 'now_time' | 'sender_display_name' | 'unsubscribe_url'; export type VariableSource = { kind: 'contact_field'; field: string; fallback?: string } | { kind: 'literal'; value: string } | { kind: 'system'; name: SystemVariable } | { kind: 'campaign_field'; field: string }; export type VariableMapping = Record<string, VariableSource>; export interface ResolvedAudience { contactIds: string[]; totalIngested: number; duplicatesRemoved: number; optedOutRemoved: number; invalidPhonesRemoved: number; countryBreakdown: Record<string, number>; } export type CampaignCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'; export type Step1State = { name: string; description?: string; category?: CampaignCategory; senderId: string; templateId: string; }; export type Step2State = | { mode: 'GROUP'; groupIds: string[] } | { mode: 'CSV'; uploadId: string } | { mode: 'FILTER'; rules: any[] }; export type Step4State = | { mode: 'SEND_NOW'; quietHours?: { start: string; end: string } } | { mode: 'SCHEDULED'; scheduledAt: string; timezone: string; quietHours?: { start: string; end: string } }; export interface CampaignListType { id: string; name: string; status: CampaignStatus; scheduledAt: string | null; totalRecipients: number; sentCount: number; failedCount: number; deliveredCount: number; templateName: string; }
export interface CampaignAudience {
  source: 'group' | 'csv' | 'pasted' | 'filter';
  groupIds?: string[];
  uploadId?: string;
  phoneNumbers?: string[];
  totalRecipients: number;
  dedupCount: number;
  optedOutCount: number;
  estimatedReach: number;
}

export interface CampaignCostBreakdown {
  country: string;
  countryFlag: string;
  recipients: number;
  ratePerConversation: number;
  subtotal: number;
}

export interface CampaignSchedule {
  type: 'send_now' | 'scheduled' | 'drip';
  scheduledAt?: string;
  timezone?: string;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  ratePerMin?: number;
  dripRatePerMinute?: number;
}

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  failed: number;
  deliveryRate: number;
  readRate: number;
  replyRate: number;
}

export interface CampaignPlaceholder {
  variable: string;
  contactField: string | null;
  defaultValue: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';
  templateId: string;
  templateName: string;
  category?: CampaignCategory;
  senderId: string;
  senderName: string;
  audience: CampaignAudience;
  costBreakdown: CampaignCostBreakdown[];
  totalCost: number;
  actualCost?: number;
  placeholders: CampaignPlaceholder[];
  schedule: CampaignSchedule;
  metrics: CampaignMetrics;
  optInConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
