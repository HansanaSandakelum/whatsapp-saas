import type { Template } from "@/types/template";
import { randomDelay } from "@/lib/utils";

let templates: Template[] = [
  {
    id: "tmpl-1",
    name: "order_confirmation",
    category: "UTILITY",
    language: "en",
    status: "approved",
    header: { type: "TEXT", text: "Order Confirmed! 🎉" },
    body: "Hi {{1}}, your order #{{2}} has been confirmed. Total: ${{3}}. Expected delivery: {{4}}.",
    footer: "Reply STOP to unsubscribe",
    buttons: [{ id: "btn-1", type: "URL", text: "Track Order", url: "https://track.example.com/{{5}}" }],
    variableCount: 5,
    headerVariableCount: 0,
    senderId: "sender-1",
    senderName: "AcmeCorp Support",
    metaTemplateId: "meta-tmpl-001",
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2025-01-15T09:30:00Z",
  },
  {
    id: "tmpl-2",
    name: "flash_sale_promo",
    category: "MARKETING",
    language: "en",
    status: "approved",
    header: { type: "IMAGE", mediaUrl: "/placeholder-promo.jpg" },
    body: "🔥 {{1}}% OFF for the next {{2}} hours only! Use code {{3}} at checkout. Shop now!",
    footer: "Valid for new customers only",
    buttons: [
      { id: "btn-2", type: "URL", text: "Shop Now", url: "https://shop.example.com" },
      { id: "btn-3", type: "QUICK_REPLY", text: "Opt Out" },
    ],
    variableCount: 3,
    headerVariableCount: 0,
    senderId: "sender-2",
    senderName: "AcmeCorp Marketing",
    metaTemplateId: "meta-tmpl-002",
    createdAt: "2024-03-10T14:00:00Z",
    updatedAt: "2025-02-20T16:45:00Z",
  },
  {
    id: "tmpl-3",
    name: "otp_verification",
    category: "AUTHENTICATION",
    language: "en",
    status: "approved",
    header: { type: "NONE" },
    body: "Your {{1}} verification code is: *{{2}}*. Valid for {{3}} minutes. Do not share this code.",
    buttons: [{ id: "btn-4", type: "QUICK_REPLY", text: "Copy Code" }],
    variableCount: 3,
    headerVariableCount: 0,
    senderId: "sender-1",
    senderName: "AcmeCorp Support",
    metaTemplateId: "meta-tmpl-003",
    createdAt: "2024-01-20T08:00:00Z",
    updatedAt: "2024-12-01T10:00:00Z",
  },
  {
    id: "tmpl-4",
    name: "appointment_reminder",
    category: "UTILITY",
    language: "en",
    status: "approved",
    header: { type: "TEXT", text: "Appointment Reminder 📅" },
    body: "Hi {{1}}, this is a reminder for your appointment on {{2}} at {{3}} with {{4}}. Reply YES to confirm or NO to cancel.",
    footer: "Need to reschedule? Reply RESCHEDULE",
    buttons: [
      { id: "btn-5", type: "QUICK_REPLY", text: "Confirm" },
      { id: "btn-6", type: "QUICK_REPLY", text: "Cancel" },
    ],
    variableCount: 4,
    headerVariableCount: 0,
    senderId: "sender-1",
    senderName: "AcmeCorp Support",
    metaTemplateId: "meta-tmpl-004",
    createdAt: "2024-04-05T11:00:00Z",
    updatedAt: "2025-03-10T13:20:00Z",
  },
  {
    id: "tmpl-5",
    name: "abandoned_cart_recovery",
    category: "MARKETING",
    language: "en",
    status: "approved",
    header: { type: "IMAGE", mediaUrl: "/placeholder-cart.jpg" },
    body: "Hey {{1}}! 👋 You left {{2}} item(s) in your cart. Complete your purchase and save {{3}}% with code {{4}}!",
    footer: "Offer expires in 24 hours",
    buttons: [
      { id: "btn-7", type: "URL", text: "Complete Purchase", url: "https://cart.example.com/{{5}}" },
    ],
    variableCount: 5,
    headerVariableCount: 0,
    senderId: "sender-2",
    senderName: "AcmeCorp Marketing",
    metaTemplateId: "meta-tmpl-005",
    createdAt: "2024-05-15T09:00:00Z",
    updatedAt: "2025-04-01T15:00:00Z",
  },
  {
    id: "tmpl-6",
    name: "payment_failed",
    category: "UTILITY",
    language: "en",
    status: "pending",
    header: { type: "TEXT", text: "⚠️ Payment Issue" },
    body: "Hi {{1}}, your payment of ${{2}} for order #{{3}} failed. Please update your payment method to avoid delays.",
    buttons: [{ id: "btn-8", type: "URL", text: "Update Payment", url: "https://billing.example.com" }],
    variableCount: 3,
    headerVariableCount: 0,
    senderId: "sender-1",
    senderName: "AcmeCorp Support",
    createdAt: "2025-04-20T12:00:00Z",
    updatedAt: "2025-05-01T09:00:00Z",
  },
  {
    id: "tmpl-7",
    name: "welcome_new_customer",
    category: "MARKETING",
    language: "en",
    status: "approved",
    // Demo: TEXT header WITH a variable — Meta allows exactly 1 variable in text headers
    header: { type: "TEXT", text: "Welcome, {{1}}! 🎊", hasVariable: true, exampleValue: "Sarah" },
    body: "Great to have you at AcmeCorp! Here's your exclusive welcome discount: {{2}}% off your first order with code {{3}}.",
    footer: "Valid for 30 days",
    buttons: [
      { id: "btn-9", type: "URL", text: "Start Shopping", url: "https://shop.example.com" },
      { id: "btn-10", type: "QUICK_REPLY", text: "Learn More" },
    ],
    variableCount: 3,
    headerVariableCount: 1,
    senderId: "sender-2",
    senderName: "AcmeCorp Marketing",
    metaTemplateId: "meta-tmpl-007",
    createdAt: "2024-06-01T10:00:00Z",
    updatedAt: "2025-01-20T14:00:00Z",
  },
  {
    id: "tmpl-8",
    name: "delivery_update",
    category: "UTILITY",
    language: "en",
    status: "approved",
    header: { type: "TEXT", text: "Your Package is on the Way! 📦" },
    body: "Hi {{1}}, your order #{{2}} is now {{3}}. Estimated delivery: {{4}}. Track your package: {{5}}",
    buttons: [{ id: "btn-11", type: "URL", text: "Track Package", url: "https://track.example.com/{{5}}" }],
    variableCount: 5,
    headerVariableCount: 0,
    senderId: "sender-1",
    senderName: "AcmeCorp Support",
    metaTemplateId: "meta-tmpl-008",
    createdAt: "2024-02-15T08:00:00Z",
    updatedAt: "2025-02-01T11:00:00Z",
  },
  {
    id: "tmpl-9",
    name: "product_feedback_request",
    category: "UTILITY",
    language: "en",
    status: "approved",
    header: { type: "NONE" },
    body: "Hi {{1}}, how was your experience with {{2}}? Share your feedback and get {{3}}% off your next purchase!",
    footer: "Your feedback helps us improve",
    buttons: [
      { id: "btn-12", type: "QUICK_REPLY", text: "⭐⭐⭐⭐⭐ Excellent" },
      { id: "btn-13", type: "QUICK_REPLY", text: "Could Be Better" },
    ],
    variableCount: 3,
    headerVariableCount: 0,
    senderId: "sender-1",
    senderName: "AcmeCorp Support",
    metaTemplateId: "meta-tmpl-009",
    createdAt: "2024-07-10T09:00:00Z",
    updatedAt: "2025-03-05T12:00:00Z",
  },
  {
    id: "tmpl-10",
    name: "subscription_renewal",
    category: "UTILITY",
    language: "en",
    status: "rejected",
    header: { type: "TEXT", text: "Subscription Renewal Notice" },
    body: "Hi {{1}}, your {{2}} subscription expires on {{3}}. Renew now to keep your benefits. Cost: ${{4}}/month.",
    buttons: [
      { id: "btn-14", type: "URL", text: "Renew Now", url: "https://billing.example.com/renew" },
      { id: "btn-15", type: "QUICK_REPLY", text: "Cancel" },
    ],
    variableCount: 4,
    headerVariableCount: 0,
    senderId: "sender-1",
    senderName: "AcmeCorp Support",
    createdAt: "2025-02-01T10:00:00Z",
    updatedAt: "2025-03-15T09:30:00Z",
  },
  {
    id: "tmpl-11",
    name: "holiday_special_offer",
    category: "MARKETING",
    language: "en",
    status: "approved",
    header: { type: "IMAGE" },
    body: "🎄 Happy Holidays, {{1}}! Enjoy {{2}}% OFF everything this season. Use code {{3}} at checkout. Limited time!",
    footer: "Offer ends Dec 31st",
    buttons: [
      { id: "btn-16", type: "URL", text: "Shop Holiday Deals", url: "https://shop.example.com/holiday" },
    ],
    variableCount: 3,
    headerVariableCount: 0,
    senderId: "sender-2",
    senderName: "AcmeCorp Marketing",
    metaTemplateId: "meta-tmpl-011",
    createdAt: "2024-11-01T10:00:00Z",
    updatedAt: "2024-11-15T11:00:00Z",
  },
  {
    id: "tmpl-12",
    name: "account_security_alert",
    category: "AUTHENTICATION",
    language: "en",
    status: "approved",
    header: { type: "TEXT", text: "🔐 Security Alert" },
    body: "Hi {{1}}, we detected a login from {{2}} at {{3}}. If this was you, no action needed. Otherwise, secure your account immediately.",
    buttons: [
      { id: "btn-17", type: "URL", text: "Secure Account", url: "https://account.example.com/security" },
      { id: "btn-18", type: "QUICK_REPLY", text: "This Was Me" },
    ],
    variableCount: 3,
    headerVariableCount: 0,
    senderId: "sender-1",
    senderName: "AcmeCorp Support",
    metaTemplateId: "meta-tmpl-012",
    createdAt: "2024-03-20T08:00:00Z",
    updatedAt: "2025-01-10T10:00:00Z",
  },
];

export async function getTemplates(filters?: {
  category?: string;
  status?: string;
  language?: string;
  search?: string;
}): Promise<Template[]> {
  await randomDelay();
  let result = [...templates];
  if (filters?.category) result = result.filter((t) => t.category === filters.category);
  if (filters?.status) result = result.filter((t) => t.status === filters.status);
  if (filters?.language) result = result.filter((t) => t.language === filters.language);
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    result = result.filter((t) => t.name.toLowerCase().includes(s) || t.body.toLowerCase().includes(s));
  }
  return result;
}

export async function getTemplateById(id: string): Promise<Template | null> {
  await randomDelay();
  return templates.find((t) => t.id === id) ?? null;
}

export async function createTemplate(data: Omit<Template, "id" | "createdAt" | "updatedAt">): Promise<Template> {
  await randomDelay();
  const tmpl: Template = {
    ...data,
    id: `tmpl-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  templates.push(tmpl);
  return tmpl;
}

export async function updateTemplate(id: string, data: Partial<Template>): Promise<Template> {
  await randomDelay();
  const idx = templates.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error("Template not found");
  templates[idx] = { ...templates[idx], ...data, updatedAt: new Date().toISOString() };
  return templates[idx];
}

export async function deleteTemplate(id: string): Promise<void> {
  await randomDelay();
  templates = templates.filter((t) => t.id !== id);
}
