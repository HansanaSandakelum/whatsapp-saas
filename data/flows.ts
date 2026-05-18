import { Flow } from "@/types";

const MOCK_FLOWS: Flow[] = [
  {
    id: "flow_1",
    name: "Customer Feedback Survey",
    status: "published",
    categories: ["SURVEY"],
    version: "1.0.2",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    screenCount: 4,
  },
  {
    id: "flow_2",
    name: "Product Registration",
    status: "published",
    categories: ["SIGN_UP", "LEAD_GENERATION"],
    version: "2.1.0",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    screenCount: 6,
  },
  {
    id: "flow_3",
    name: "Booking Appointment",
    status: "draft",
    categories: ["APPOINTMENT_BOOKING"],
    version: "0.1.0",
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    screenCount: 3,
  },
  {
    id: "flow_4",
    name: "Newsletter Opt-in",
    status: "deprecated",
    categories: ["SIGN_UP"],
    version: "1.5.0",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
    screenCount: 2,
  },
];

export async function getFlows(params: {
  search?: string;
  status?: string;
  category?: string;
} = {}) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filtered = [...MOCK_FLOWS];

  if (params.search) {
    const search = params.search.toLowerCase();
    filtered = filtered.filter((f) => f.name.toLowerCase().includes(search));
  }

  if (params.status && params.status !== "all") {
    filtered = filtered.filter((f) => f.status === params.status);
  }

  if (params.category && params.category !== "all") {
    filtered = filtered.filter((f) => f.categories.includes(params.category as any));
  }

  return filtered;
}

export async function getFlowById(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_FLOWS.find((f) => f.id === id) || null;
}
