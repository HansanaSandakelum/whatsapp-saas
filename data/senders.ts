import type { Sender } from "@/types/sender";
import { randomDelay } from "@/lib/utils";

let senders: Sender[] = [
  {
    id: "sender-1",
    displayName: "AcmeCorp Support",
    phoneNumber: "+94112345678",
    countryCode: "LK",
    countryFlag: "🇱🇰",
    status: "approved",
    qualityRating: "high",
    messagingTier: 2,
    dailyLimit: 10000,
    usedToday: 4230,
    isVerified: true,
    about: "Official support line for AcmeCorp customers.",
    description: "We help businesses grow with innovative solutions.",
    category: "Technology",
    website: "https://acmecorp.com",
    email: "support@acmecorp.com",
    address: "42 Galle Road, Colombo 03, Sri Lanka",
    metaPhoneNumberId: "12345678901234",
    metaBusinessAccountId: "98765432109876",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2025-03-20T14:30:00Z",
  },
 
];

export async function getSenders(): Promise<Sender[]> {
  await randomDelay();
  return [...senders];
}

export async function getSenderById(id: string): Promise<Sender | null> {
  await randomDelay();
  return senders.find((s) => s.id === id) ?? null;
}

export async function updateSender(
  id: string,
  updates: Partial<Sender>
): Promise<Sender> {
  await randomDelay();
  const idx = senders.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Sender not found");
  senders[idx] = { ...senders[idx], ...updates, updatedAt: new Date().toISOString() };
  return senders[idx];
}

export async function createSender(data: Omit<Sender, "id" | "createdAt" | "updatedAt">): Promise<Sender> {
  await randomDelay();
  const newSender: Sender = {
    ...data,
    id: `sender-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  senders.push(newSender);
  return newSender;
}
