import { randomDelay } from "@/lib/utils";

export interface AnalyticsMetrics {
  totalSent: number;
  deliveryRate: number;
  readRate: number;
  replyRate: number;
  totalCost: number;
}

export interface DailyMetrics {
  date: string;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}

export interface TemplatePerformance {
  templateName: string;
  sent: number;
  readRate: number;
}

export interface CountryDelivery {
  countryCode: string;
  countryName: string;
  countryFlag: string;
  sent: number;
  deliveryRate: number;
  cost: number;
}

export interface CategorySplit {
  category: string;
  value: number;
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  dailyVolume: DailyMetrics[];
  topTemplates: TemplatePerformance[];
  deliveryByCountry: CountryDelivery[];
  categorySplit: CategorySplit[];
}

const mockAnalytics: AnalyticsData = {
  metrics: {
    totalSent: 124500,
    deliveryRate: 98.2,
    readRate: 76.5,
    replyRate: 12.4,
    totalCost: 1845.2,
  },
  dailyVolume: Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const base = 2000 + Math.random() * 5000;
    return {
      date: d.toISOString().split("T")[0],
      sent: Math.floor(base),
      delivered: Math.floor(base * 0.98),
      read: Math.floor(base * 0.75),
      failed: Math.floor(base * 0.02),
    };
  }),
  topTemplates: [
    { templateName: "welcome_new_customer", sent: 12500, readRate: 85.2 },
    { templateName: "order_confirmation", sent: 45000, readRate: 92.1 },
    { templateName: "flash_sale_promo", sent: 35000, readRate: 68.4 },
    { templateName: "abandoned_cart_recovery", sent: 8200, readRate: 81.5 },
    { templateName: "appointment_reminder", sent: 5400, readRate: 88.9 },
  ],
  deliveryByCountry: [
    { countryCode: "US", countryName: "United States", countryFlag: "🇺🇸", sent: 65000, deliveryRate: 99.1, cost: 955.5 },
    { countryCode: "GB", countryName: "United Kingdom", countryFlag: "🇬🇧", sent: 25000, deliveryRate: 98.5, cost: 797.5 },
    { countryCode: "BR", countryName: "Brazil", countryFlag: "🇧🇷", sent: 15000, deliveryRate: 96.2, cost: 937.5 },
    { countryCode: "IN", countryName: "India", countryFlag: "🇮🇳", sent: 12000, deliveryRate: 97.4, cost: 105.6 },
    { countryCode: "AU", countryName: "Australia", countryFlag: "🇦🇺", sent: 7500, deliveryRate: 98.8, cost: 239.25 },
  ],
  categorySplit: [
    { category: "Marketing", value: 55 },
    { category: "Utility", value: 35 },
    { category: "Authentication", value: 8 },
    { category: "Service", value: 2 },
  ],
};

export async function getAnalytics(filters?: { dateRange?: { from: Date; to: Date }; senderId?: string }): Promise<AnalyticsData> {
  await randomDelay();
  return mockAnalytics;
}
