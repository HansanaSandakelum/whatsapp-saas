import { randomDelay } from "@/lib/utils";

export interface Invoice {
  id: string;
  date: string;
  period: string;
  amount: number;
  status: "paid" | "open" | "failed";
}

const mockInvoices: Invoice[] = [
  { id: "INV-2025-005", date: "2025-05-01T00:00:00Z", period: "Apr 2025", amount: 450.2, status: "paid" },
  { id: "INV-2025-004", date: "2025-04-01T00:00:00Z", period: "Mar 2025", amount: 395.5, status: "paid" },
  { id: "INV-2025-003", date: "2025-03-01T00:00:00Z", period: "Feb 2025", amount: 412.8, status: "paid" },
  { id: "INV-2025-002", date: "2025-02-01T00:00:00Z", period: "Jan 2025", amount: 380.0, status: "paid" },
  { id: "INV-2025-001", date: "2025-01-01T00:00:00Z", period: "Dec 2024", amount: 520.4, status: "paid" },
];

export async function getInvoices(): Promise<Invoice[]> {
  await randomDelay();
  return mockInvoices;
}
