import type { QualityRating, SenderStatus } from "./common";

export interface Sender {
  id: string;
  displayName: string;
  phoneNumber: string;
  countryCode: string;
  countryFlag: string;
  status: SenderStatus;
  qualityRating: QualityRating;
  messagingTier: number;
  dailyLimit: number;
  usedToday: number;
  isVerified: boolean;
  about: string;
  description: string;
  category: string;
  website?: string;
  email?: string;
  address?: string;
  profilePhoto?: string;
  metaPhoneNumberId: string;
  metaBusinessAccountId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SenderQualityHistory {
  date: string;
  rating: QualityRating;
  score: number;
}
