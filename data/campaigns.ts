import type { Campaign } from "@/types/campaign";
import { randomDelay } from "@/lib/utils";

let campaigns: Campaign[] = [
  {
    id: "camp-1",
    name: "Black Friday Flash Sale",
    description: "48-hour exclusive offers for all subscribers",
    status: "completed",
    templateId: "tmpl-2",
    templateName: "flash_sale_promo",
    senderId: "sender-2",
    senderName: "AcmeCorp Marketing",
    audience: {
      source: "group",
      groupIds: ["grp-1", "grp-2"],
      totalRecipients: 24500,
      dedupCount: 312,
      optedOutCount: 145,
      estimatedReach: 24043,
    },
    costBreakdown: [
      { country: "United States", countryFlag: "🇺🇸", recipients: 14000, ratePerConversation: 0.0147, subtotal: 205.8 },
      { country: "United Kingdom", countryFlag: "🇬🇧", recipients: 5200, ratePerConversation: 0.0319, subtotal: 165.88 },
      { country: "Canada", countryFlag: "🇨🇦", recipients: 4843, ratePerConversation: 0.0147, subtotal: 71.19 },
    ],
    totalCost: 442.87,
    actualCost: 435.2,
    placeholders: [
      { variable: "{{1}}", contactField: "first_name", defaultValue: "Valued Customer" },
      { variable: "{{2}}", contactField: null, defaultValue: "40" },
      { variable: "{{3}}", contactField: null, defaultValue: "48" },
      { variable: "{{4}}", contactField: null, defaultValue: "BLACKFRIDAY" },
    ],
    schedule: {
      type: "scheduled",
      scheduledAt: "2024-11-29T08:00:00Z",
      timezone: "America/New_York",
      quietHoursEnabled: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
    },
    metrics: {
      sent: 24043,
      delivered: 23100,
      read: 18200,
      replied: 2100,
      failed: 943,
      deliveryRate: 96.1,
      readRate: 78.8,
      replyRate: 8.7,
    },
    optInConfirmed: true,
    createdAt: "2024-11-25T10:00:00Z",
    updatedAt: "2024-11-30T18:00:00Z",
    completedAt: "2024-11-30T18:00:00Z",
  },
  {
    id: "camp-2",
    name: "January Order Confirmations",
    description: "Transactional confirmations for January orders",
    status: "completed",
    templateId: "tmpl-1",
    templateName: "order_confirmation",
    senderId: "sender-1",
    senderName: "AcmeCorp Support",
    audience: {
      source: "group",
      groupIds: ["grp-3"],
      totalRecipients: 8900,
      dedupCount: 45,
      optedOutCount: 23,
      estimatedReach: 8832,
    },
    costBreakdown: [
      { country: "United States", countryFlag: "🇺🇸", recipients: 6200, ratePerConversation: 0.0147, subtotal: 91.14 },
      { country: "United Kingdom", countryFlag: "🇬🇧", recipients: 2632, ratePerConversation: 0.0319, subtotal: 83.96 },
    ],
    totalCost: 175.1,
    actualCost: 174.2,
    placeholders: [
      { variable: "{{1}}", contactField: "first_name", defaultValue: "Customer" },
      { variable: "{{2}}", contactField: "order_id", defaultValue: "ORD-00000" },
      { variable: "{{3}}", contactField: "order_total", defaultValue: "$0.00" },
      { variable: "{{4}}", contactField: "delivery_date", defaultValue: "TBD" },
      { variable: "{{5}}", contactField: "tracking_number", defaultValue: "" },
    ],
    schedule: {
      type: "drip",
      dripRatePerMinute: 50,
      timezone: "UTC",
      quietHoursEnabled: false,
    },
    metrics: {
      sent: 8832,
      delivered: 8740,
      read: 7950,
      replied: 210,
      failed: 92,
      deliveryRate: 98.96,
      readRate: 90.97,
      replyRate: 2.38,
    },
    optInConfirmed: true,
    createdAt: "2025-01-02T08:00:00Z",
    updatedAt: "2025-01-31T23:59:00Z",
    completedAt: "2025-01-31T23:59:00Z",
  },
  {
    id: "camp-3",
    name: "Spring Welcome Campaign",
    description: "Welcome new subscribers with exclusive spring offers",
    status: "active",
    templateId: "tmpl-7",
    templateName: "welcome_new_customer",
    senderId: "sender-2",
    senderName: "AcmeCorp Marketing",
    audience: {
      source: "group",
      groupIds: ["grp-4"],
      totalRecipients: 5200,
      dedupCount: 87,
      optedOutCount: 42,
      estimatedReach: 5071,
    },
    costBreakdown: [
      { country: "United States", countryFlag: "🇺🇸", recipients: 3500, ratePerConversation: 0.0147, subtotal: 51.45 },
      { country: "Canada", countryFlag: "🇨🇦", recipients: 1571, ratePerConversation: 0.0147, subtotal: 23.09 },
    ],
    totalCost: 74.54,
    placeholders: [
      { variable: "{{1}}", contactField: "first_name", defaultValue: "Friend" },
      { variable: "{{2}}", contactField: null, defaultValue: "20" },
      { variable: "{{3}}", contactField: null, defaultValue: "SPRING2025" },
    ],
    schedule: {
      type: "scheduled",
      scheduledAt: "2025-03-20T09:00:00Z",
      timezone: "America/New_York",
      quietHoursEnabled: true,
      quietHoursStart: "21:00",
      quietHoursEnd: "09:00",
    },
    metrics: {
      sent: 3800,
      delivered: 3720,
      read: 2890,
      replied: 420,
      failed: 80,
      deliveryRate: 97.9,
      readRate: 77.7,
      replyRate: 11.05,
    },
    optInConfirmed: true,
    createdAt: "2025-03-15T14:00:00Z",
    updatedAt: "2025-05-13T10:00:00Z",
  },
  {
    id: "camp-4",
    name: "Mother's Day Special",
    description: "Exclusive gifts and offers for Mother's Day",
    status: "scheduled",
    templateId: "tmpl-11",
    templateName: "holiday_special_offer",
    senderId: "sender-2",
    senderName: "AcmeCorp Marketing",
    audience: {
      source: "group",
      groupIds: ["grp-1"],
      totalRecipients: 18000,
      dedupCount: 210,
      optedOutCount: 98,
      estimatedReach: 17692,
    },
    costBreakdown: [
      { country: "United States", countryFlag: "🇺🇸", recipients: 10000, ratePerConversation: 0.0147, subtotal: 147.0 },
      { country: "United Kingdom", countryFlag: "🇬🇧", recipients: 4200, ratePerConversation: 0.0319, subtotal: 133.98 },
      { country: "Australia", countryFlag: "🇦🇺", recipients: 3492, ratePerConversation: 0.0319, subtotal: 111.39 },
    ],
    totalCost: 392.37,
    placeholders: [
      { variable: "{{1}}", contactField: "first_name", defaultValue: "Valued Customer" },
      { variable: "{{2}}", contactField: null, defaultValue: "25" },
      { variable: "{{3}}", contactField: null, defaultValue: "MOMDAY25" },
    ],
    schedule: {
      type: "scheduled",
      scheduledAt: "2025-05-11T08:00:00Z",
      timezone: "America/New_York",
      quietHoursEnabled: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
    },
    metrics: {
      sent: 0,
      delivered: 0,
      read: 0,
      replied: 0,
      failed: 0,
      deliveryRate: 0,
      readRate: 0,
      replyRate: 0,
    },
    optInConfirmed: true,
    createdAt: "2025-05-08T11:00:00Z",
    updatedAt: "2025-05-08T11:00:00Z",
  },
  {
    id: "camp-5",
    name: "Cart Recovery Q1",
    description: "Re-engage customers who abandoned cart",
    status: "paused",
    templateId: "tmpl-5",
    templateName: "abandoned_cart_recovery",
    senderId: "sender-2",
    senderName: "AcmeCorp Marketing",
    audience: {
      source: "csv",
      totalRecipients: 3400,
      dedupCount: 120,
      optedOutCount: 65,
      estimatedReach: 3215,
    },
    costBreakdown: [
      { country: "United States", countryFlag: "🇺🇸", recipients: 2100, ratePerConversation: 0.0147, subtotal: 30.87 },
      { country: "United Kingdom", countryFlag: "🇬🇧", recipients: 1115, ratePerConversation: 0.0319, subtotal: 35.57 },
    ],
    totalCost: 66.44,
    placeholders: [
      { variable: "{{1}}", contactField: "first_name", defaultValue: "there" },
      { variable: "{{2}}", contactField: "cart_items", defaultValue: "some" },
      { variable: "{{3}}", contactField: null, defaultValue: "15" },
      { variable: "{{4}}", contactField: null, defaultValue: "COMEBACK15" },
      { variable: "{{5}}", contactField: "cart_id", defaultValue: "" },
    ],
    schedule: {
      type: "drip",
      dripRatePerMinute: 20,
      timezone: "America/Chicago",
      quietHoursEnabled: true,
      quietHoursStart: "21:00",
      quietHoursEnd: "09:00",
    },
    metrics: {
      sent: 1200,
      delivered: 1175,
      read: 890,
      replied: 145,
      failed: 25,
      deliveryRate: 97.9,
      readRate: 75.7,
      replyRate: 12.1,
    },
    optInConfirmed: true,
    createdAt: "2025-02-15T09:00:00Z",
    updatedAt: "2025-04-20T14:30:00Z",
  },
];

export async function getCampaigns(filters?: {
  status?: string;
  search?: string;
}): Promise<Campaign[]> {
  await randomDelay();
  let result = [...campaigns];
  if (filters?.status && filters.status !== "all") {
    result = result.filter((c) => c.status === filters.status);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    result = result.filter((c) => c.name.toLowerCase().includes(s));
  }
  return result;
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  await randomDelay();
  return campaigns.find((c) => c.id === id) ?? null;
}

export async function createCampaign(data: Omit<Campaign, "id" | "createdAt" | "updatedAt">): Promise<Campaign> {
  await randomDelay();
  const camp: Campaign = {
    ...data,
    id: `camp-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  campaigns.push(camp);
  return camp;
}

export async function updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
  await randomDelay();
  const idx = campaigns.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Campaign not found");
  campaigns[idx] = { ...campaigns[idx], ...data, updatedAt: new Date().toISOString() };
  return campaigns[idx];
}
