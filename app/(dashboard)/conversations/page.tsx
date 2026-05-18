import { ConversationsClient } from "@/components/conversations/conversations-client";

export default function ConversationsPage() {
  return (
    <div className="h-[calc(100vh-3.5rem)] w-full flex flex-col overflow-hidden bg-background">
      <ConversationsClient />
    </div>
  );
}
