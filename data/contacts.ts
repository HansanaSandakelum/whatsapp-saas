import type { Contact, ContactGroup, OptInRecord } from "@/types/contact";
import { randomDelay } from "@/lib/utils";

let contacts: Contact[] = [
  {
    id: "contact-1", firstName: "Sarah", lastName: "Johnson", phone: "+94771234561",
    countryCode: "LK", email: "sarah.j@email.com", tags: ["vip", "returning"],
    optInStatus: "opted_in", optInSource: "web_form", optInTimestamp: "2024-01-15T10:00:00Z",
    optInIp: "192.168.1.1", optInSourceUrl: "https://acmecorp.com/signup",
    lastMessaged: "2025-05-13T10:00:00Z", attributes: [{ key: "first_name", value: "Sarah" }],
    groupIds: ["grp-1", "grp-3"], createdAt: "2024-01-15T10:00:00Z", updatedAt: "2025-05-13T10:00:00Z",
  },
  {
    id: "contact-2", firstName: "Marcus", lastName: "Marcus", phone: "+94771234562",
    countryCode: "LK", email: "marcus.w@email.com", tags: ["returning"],
    optInStatus: "opted_in", optInSource: "conversation_reply", optInTimestamp: "2024-02-20T14:00:00Z",
    lastMessaged: "2025-05-12T09:00:00Z", attributes: [{ key: "first_name", value: "Marcus" }],
    groupIds: ["grp-1"], createdAt: "2024-02-20T14:00:00Z", updatedAt: "2025-05-12T09:00:00Z",
  },
  {
    id: "contact-3", firstName: "Priya", lastName: "Sharma", phone: "+94771234563",
    countryCode: "LK", email: "priya.s@email.com", tags: ["new", "marketing"],
    optInStatus: "opted_in", optInSource: "imported", optInTimestamp: "2025-03-01T08:00:00Z",
    lastMessaged: "2025-05-13T09:45:00Z", attributes: [{ key: "first_name", value: "Priya" }],
    groupIds: ["grp-2", "grp-4"], createdAt: "2025-03-01T08:00:00Z", updatedAt: "2025-05-13T09:45:00Z",
  },
  {
    id: "contact-4", firstName: "James", lastName: "O'Brien", phone: "+94771234564",
    countryCode: "LK", email: "james.ob@email.com", tags: ["vip"],
    optInStatus: "opted_in", optInSource: "web_form", optInTimestamp: "2024-03-10T11:00:00Z",
    optInIp: "10.0.0.5", optInSourceUrl: "https://acmecorp.co.uk/signup",
    lastMessaged: "2025-05-10T16:00:00Z", attributes: [{ key: "first_name", value: "James" }],
    groupIds: ["grp-1", "grp-3"], createdAt: "2024-03-10T11:00:00Z", updatedAt: "2025-05-10T16:00:00Z",
  },
  {
    id: "contact-5", firstName: "Ana", lastName: "Lima", phone: "+94771234565",
    countryCode: "LK", email: "ana.lima@email.com.br", tags: ["brazil", "new"],
    optInStatus: "opted_in", optInSource: "conversation_reply", optInTimestamp: "2025-04-15T13:00:00Z",
    lastMessaged: "2025-05-12T15:30:00Z", attributes: [{ key: "first_name", value: "Ana" }],
    groupIds: ["grp-2"], createdAt: "2025-04-15T13:00:00Z", updatedAt: "2025-05-12T15:30:00Z",
  },
  {
    id: "contact-6", firstName: "David", lastName: "Chen", phone: "+94771234566",
    countryCode: "LK", email: "david.c@email.sg", tags: ["enterprise"],
    optInStatus: "opted_in", optInSource: "in_store", optInTimestamp: "2024-05-20T09:00:00Z",
    lastMessaged: "2025-05-13T10:15:00Z", attributes: [{ key: "first_name", value: "David" }],
    groupIds: ["grp-1"], createdAt: "2024-05-20T09:00:00Z", updatedAt: "2025-05-13T10:15:00Z",
  },
  {
    id: "contact-7", firstName: "Maria", lastName: "Garcia", phone: "+94771234567",
    countryCode: "LK", email: "maria.g@email.es", tags: ["spain", "returning"],
    optInStatus: "opted_out", optInSource: "web_form", optInTimestamp: "2024-01-30T10:00:00Z",
    lastMessaged: "2025-03-20T11:00:00Z", attributes: [{ key: "first_name", value: "Maria" }],
    groupIds: [], createdAt: "2024-01-30T10:00:00Z", updatedAt: "2025-03-20T11:00:00Z",
  },
  {
    id: "contact-8", firstName: "Kwame", lastName: "Asante", phone: "+94771234568",
    countryCode: "LK", tags: ["new"],
    optInStatus: "opted_in", optInSource: "ivr", optInTimestamp: "2025-02-14T08:00:00Z",
    lastMessaged: "2025-04-30T14:00:00Z", attributes: [{ key: "first_name", value: "Kwame" }],
    groupIds: ["grp-2"], createdAt: "2025-02-14T08:00:00Z", updatedAt: "2025-04-30T14:00:00Z",
  },
];

let groups: ContactGroup[] = [
  { id: "grp-1", name: "All Subscribers", description: "Complete mailing list", memberCount: 24500, tags: ["master"], createdAt: "2024-01-01T00:00:00Z", updatedAt: "2025-05-13T00:00:00Z" },
  { id: "grp-2", name: "International", description: "Non-US contacts", memberCount: 8200, tags: ["international"], createdAt: "2024-02-01T00:00:00Z", updatedAt: "2025-05-10T00:00:00Z" },
  { id: "grp-3", name: "VIP Customers", description: "High-value loyal customers", memberCount: 1800, tags: ["vip", "priority"], createdAt: "2024-03-01T00:00:00Z", updatedAt: "2025-05-08T00:00:00Z" },
  { id: "grp-4", name: "New Signups 2025", description: "Customers who signed up this year", memberCount: 5100, tags: ["new", "2025"], createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-05-12T00:00:00Z" },
  { id: "grp-5", name: "Cart Abandoners", description: "Recent cart abandonments", memberCount: 3400, tags: ["retargeting"], createdAt: "2025-02-01T00:00:00Z", updatedAt: "2025-04-20T00:00:00Z" },
];

let optInRecords: OptInRecord[] = [
  { id: "opt-1", contactId: "contact-1", contactName: "Sarah Johnson", phone: "+94771234561", method: "web_form", sourceUrl: "https://acmecorp.com/signup", timestamp: "2024-01-15T10:00:00Z", ipAddress: "192.168.1.1", status: "opted_in" },
  { id: "opt-2", contactId: "contact-2", contactName: "Marcus Williams", phone: "+94771234562", method: "conversation_reply", timestamp: "2024-02-20T14:00:00Z", status: "opted_in" },
  { id: "opt-3", contactId: "contact-3", contactName: "Priya Sharma", phone: "+94771234563", method: "imported", timestamp: "2025-03-01T08:00:00Z", status: "opted_in" },
  { id: "opt-4", contactId: "contact-4", contactName: "James O'Brien", phone: "+94771234564", method: "web_form", sourceUrl: "https://acmecorp.co.uk/signup", timestamp: "2024-03-10T11:00:00Z", ipAddress: "10.0.0.5", status: "opted_in" },
  { id: "opt-5", contactId: "contact-7", contactName: "Maria Garcia", phone: "+94771234567", method: "web_form", sourceUrl: "https://acmecorp.es/signup", timestamp: "2024-01-30T10:00:00Z", ipAddress: "172.16.0.1", status: "opted_out" },
  { id: "opt-6", contactId: "contact-8", contactName: "Kwame Asante", phone: "+94771234568", method: "ivr", timestamp: "2025-02-14T08:00:00Z", status: "opted_in" },
];

export async function getContacts(filters?: { search?: string; optInStatus?: string }): Promise<Contact[]> {
  await randomDelay();
  let result = [...contacts];
  if (filters?.optInStatus) result = result.filter((c) => c.optInStatus === filters.optInStatus);
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    result = result.filter((c) => `${c.firstName} ${c.lastName}`.toLowerCase().includes(s) || c.phone.includes(s));
  }
  return result;
}

export async function getContactGroups(): Promise<ContactGroup[]> {
  await randomDelay();
  return [...groups];
}

export async function getOptInRecords(filters?: { method?: string }): Promise<OptInRecord[]> {
  await randomDelay();
  let result = [...optInRecords];
  if (filters?.method) result = result.filter((r) => r.method === filters.method);
  return result;
}
