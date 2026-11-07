import type { ChatMessageView, ChatPageView } from "@/shared";

export const CHAT_KEYS = {
  all: ["chat"] as const,
  own: ["chat", "own"] as const,
  inbox: ["chat", "threads"] as const,
  unread: ["chat", "unread"] as const,
  page: (threadId: string) => ["chat", "page", threadId] as const,
};

function inOrder(first: ChatMessageView, second: ChatMessageView): number {
  return first.createdAt === second.createdAt ? first.id.localeCompare(second.id) : first.createdAt.localeCompare(second.createdAt);
}

export function mergeMessages(current: readonly ChatMessageView[], incoming: readonly ChatMessageView[]): ChatMessageView[] {
  const byId = new Map(current.map((message) => [message.id, message]));
  for (const message of incoming) {
    byId.set(message.id, message);
  }
  return [...byId.values()].sort(inOrder);
}

export function withMessages(page: ChatPageView | undefined, incoming: readonly ChatMessageView[]): ChatPageView | undefined {
  return page ? { ...page, messages: mergeMessages(page.messages, incoming) } : page;
}
