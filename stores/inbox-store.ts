import { create } from "zustand";

interface InboxFilters {
  status: "all" | "unread" | "assigned" | "unassigned" | "resolved" | "pending";
  search: string;
  assignedTo?: string;
}

interface InboxState {
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  filters: InboxFilters;
  setFilters: (filters: Partial<InboxFilters>) => void;
  isContactDrawerOpen: boolean;
  setContactDrawerOpen: (isOpen: boolean) => void;
  toggleContactDrawer: () => void;
}

export const useInboxStore = create<InboxState>((set) => ({
  selectedConversationId: null,
  setSelectedConversationId: (id) => set({ selectedConversationId: id, isContactDrawerOpen: false }),
  filters: {
    status: "all",
    search: "",
  },
  setFilters: (newFilters) => 
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  isContactDrawerOpen: false,
  setContactDrawerOpen: (isOpen) => set({ isContactDrawerOpen: isOpen }),
  toggleContactDrawer: () => set((state) => ({ isContactDrawerOpen: !state.isContactDrawerOpen })),
}));
