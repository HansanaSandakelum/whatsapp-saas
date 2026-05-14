import type { Sender } from "@/types/sender";
import { randomDelay } from "@/lib/utils";

let senders: Sender[] = [
  {
    id: "sender-1",
    displayName: "AcmeCorp Support",
    phoneNumber: "+14155552671",
    countryCode: "US",
    countryFlag: "🇺🇸",
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
    address: "123 Market St, San Francisco, CA 94105",
    metaPhoneNumberId: "12345678901234",
    metaBusinessAccountId: "98765432109876",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2025-03-20T14:30:00Z",
  },
  {
    id: "sender-2",
    displayName: "AcmeCorp Marketing",
    phoneNumber: "+14155552672",
    countryCode: "US",
    countryFlag: "🇺🇸",
    status: "approved",
    qualityRating: "medium",
    messagingTier: 1,
    dailyLimit: 1000,
    usedToday: 780,
    isVerified: true,
    about: "Marketing communications from AcmeCorp.",
    description: "Delivering personalized marketing experiences.",
    category: "Technology",
    website: "https://acmecorp.com",
    email: "marketing@acmecorp.com",
    metaPhoneNumberId: "23456789012345",
    metaBusinessAccountId: "98765432109876",
    createdAt: "2024-03-01T09:00:00Z",
    updatedAt: "2025-04-10T11:15:00Z",
  },
  {
    id: "sender-3",
    displayName: "AcmeCorp Transact",
    phoneNumber: "+447911123456",
    countryCode: "GB",
    countryFlag: "🇬🇧",
    status: "pending",
    qualityRating: "high",
    messagingTier: 1,
    dailyLimit: 1000,
    usedToday: 0,
    isVerified: false,
    about: "Transactional notifications from AcmeCorp UK.",
    description: "Fast and reliable transactional messaging.",
    category: "Finance",
    website: "https://acmecorp.co.uk",
    email: "transact@acmecorp.co.uk",
    metaPhoneNumberId: "34567890123456",
    metaBusinessAccountId: "98765432109876",
    createdAt: "2025-05-01T08:00:00Z",
    updatedAt: "2025-05-01T08:00:00Z",
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
