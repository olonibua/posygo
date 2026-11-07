"use client";

import {
  CHAT_EVENTS,
  type ChatMessageInput,
  type ChatMessageView,
  type ChatPageView,
  type ChatReadEvent,
  type ChatSendAck,
  type ChatSide,
  type ChatThreadView,
  type ChatTypingEvent,
  hasPermission,
  type SessionUser,
} from "@/shared";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { apiRequest } from "@/lib/api/client";

import { CHAT_KEYS, withMessages } from "./chat-cache";
import { chatSocket } from "./chat-socket";

const ACK_TIMEOUT_MS = 8000;
const TYPING_EVERY_MS = 2500;
const TYPING_SHOWN_MS = 4000;
const UNREAD_POLL_MS = 60_000;

export function chatSideOf(user: SessionUser): ChatSide | null {
  if (user.vendorId || user.partnerId) {
    return hasPermission(user.role, "chat.use") ? "CUSTOMER" : null;
  }
  return hasPermission(user.role, "support.read") ? "TEAM" : null;
}

export function useOwnThread() {
  return useQuery({ queryKey: CHAT_KEYS.own, queryFn: () => apiRequest<ChatPageView>("/v1/chat/thread") });
}

export function useInbox() {
  return useQuery({ queryKey: CHAT_KEYS.inbox, queryFn: () => apiRequest<ChatThreadView[]>("/v1/chat/threads") });
}

export function useChatUnread(enabled: boolean) {
  return useQuery({ queryKey: CHAT_KEYS.unread, queryFn: () => apiRequest<{ count: number }>("/v1/chat/unread"), enabled, refetchInterval: UNREAD_POLL_MS });
}

export function useThreadPage(threadId: string, initial?: ChatPageView) {
  return useQuery({ queryKey: CHAT_KEYS.page(threadId), queryFn: () => apiRequest<ChatPageView>(`/v1/chat/threads/${threadId}/messages`), initialData: initial, staleTime: initial ? 5_000 : 0 });
}

export function useEarlierMessages(threadId: string) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const load = useCallback(
    async (before: string) => {
      setLoading(true);
      try {
        const older = await apiRequest<ChatPageView>(`/v1/chat/threads/${threadId}/messages?before=${encodeURIComponent(before)}`);
        queryClient.setQueryData<ChatPageView>(CHAT_KEYS.page(threadId), (page) => (page ? { ...withMessages(page, older.messages)!, hasMore: older.hasMore } : page));
      } finally {
        setLoading(false);
      }
    },
    [queryClient, threadId],
  );
  return { load, loading };
}

export class ChatSendError extends Error {}

async function deliver(threadId: string, input: ChatMessageInput): Promise<ChatMessageView> {
  const socket = chatSocket();
  if (socket.connected) {
    try {
      const ack = (await socket.timeout(ACK_TIMEOUT_MS).emitWithAck(CHAT_EVENTS.send, { threadId, ...input })) as ChatSendAck;
      if (ack.ok) {
        return ack.message;
      }
      throw new ChatSendError(ack.error);
    } catch (error) {
      if (error instanceof ChatSendError) {
        throw error;
      }
    }
  }
  const result = await apiRequest<{ message: ChatMessageView }>(`/v1/chat/threads/${threadId}/messages`, { method: "POST", body: input });
  return result.message;
}

export interface PendingMessage {
  clientId: string;
  body: string;
  replyTo: ChatMessageView | null;
  failed: string | null;
}

export function useSendMessage(threadId: string) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<PendingMessage[]>([]);

  const attempt = useCallback(
    async (message: PendingMessage) => {
      setPending((list) => list.map((entry) => (entry.clientId === message.clientId ? { ...entry, failed: null } : entry)));
      try {
        const saved = await deliver(threadId, { clientId: message.clientId, body: message.body, ...(message.replyTo ? { replyToId: message.replyTo.id } : {}) });
        queryClient.setQueryData<ChatPageView>(CHAT_KEYS.page(threadId), (page) => withMessages(page, [saved]));
        setPending((list) => list.filter((entry) => entry.clientId !== message.clientId));
      } catch (error) {
        const reason = error instanceof Error ? error.message : "Not sent.";
        setPending((list) => list.map((entry) => (entry.clientId === message.clientId ? { ...entry, failed: reason } : entry)));
      }
    },
    [queryClient, threadId],
  );

  const send = useCallback(
    (body: string, replyTo: ChatMessageView | null) => {
      const message: PendingMessage = { clientId: crypto.randomUUID(), body, replyTo, failed: null };
      setPending((list) => [...list, message]);
      void attempt(message);
    },
    [attempt],
  );

  const discard = useCallback((clientId: string) => setPending((list) => list.filter((entry) => entry.clientId !== clientId)), []);

  return { pending, send, retry: attempt, discard };
}

async function markThreadRead(threadId: string): Promise<void> {
  const socket = chatSocket();
  if (socket.connected) {
    try {
      await socket.timeout(ACK_TIMEOUT_MS).emitWithAck(CHAT_EVENTS.read, { threadId });
      return;
    } catch {}
  }
  await apiRequest(`/v1/chat/threads/${threadId}/read`, { method: "POST" });
}

export function useMarkRead(threadId: string, latestFromOtherSide: string | null) {
  const queryClient = useQueryClient();
  const marked = useRef<string | null>(null);
  useEffect(() => {
    const mark = () => {
      if (!latestFromOtherSide || marked.current === latestFromOtherSide || document.visibilityState !== "visible") {
        return;
      }
      marked.current = latestFromOtherSide;
      void markThreadRead(threadId).then(() => {
        void queryClient.invalidateQueries({ queryKey: CHAT_KEYS.unread });
        void queryClient.invalidateQueries({ queryKey: CHAT_KEYS.inbox });
      });
    };
    mark();
    document.addEventListener("visibilitychange", mark);
    return () => document.removeEventListener("visibilitychange", mark);
  }, [latestFromOtherSide, queryClient, threadId]);
}

export function useTyping(threadId: string, otherSide: ChatSide) {
  const [typing, setTyping] = useState(false);
  const lastSent = useRef(0);
  useEffect(() => {
    const socket = chatSocket();
    let timer: number | undefined;
    const onTyping = (event: ChatTypingEvent) => {
      if (event.threadId !== threadId || event.side !== otherSide) {
        return;
      }
      setTyping(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setTyping(false), TYPING_SHOWN_MS);
    };
    const onMessage = (message: ChatMessageView) => {
      if (message.threadId === threadId && message.side === otherSide) {
        setTyping(false);
      }
    };
    socket.on(CHAT_EVENTS.typing, onTyping);
    socket.on(CHAT_EVENTS.message, onMessage);
    return () => {
      window.clearTimeout(timer);
      socket.off(CHAT_EVENTS.typing, onTyping);
      socket.off(CHAT_EVENTS.message, onMessage);
    };
  }, [otherSide, threadId]);

  const announce = useCallback(() => {
    const socket = chatSocket();
    if (socket.connected && Date.now() - lastSent.current > TYPING_EVERY_MS) {
      lastSent.current = Date.now();
      socket.emit(CHAT_EVENTS.typing, { threadId });
    }
  }, [threadId]);

  return { typing, announce };
}

function subscribeConnection(onChange: () => void): () => void {
  const socket = chatSocket();
  socket.on("connect", onChange);
  socket.on("disconnect", onChange);
  return () => {
    socket.off("connect", onChange);
    socket.off("disconnect", onChange);
  };
}

export function useChatConnected(): boolean {
  return useSyncExternalStore(
    subscribeConnection,
    () => chatSocket().connected,
    () => false,
  );
}

export function useChatLive(side: ChatSide | null) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!side) {
      return;
    }
    const socket = chatSocket();
    const onMessage = (message: ChatMessageView) => {
      queryClient.setQueryData<ChatPageView>(CHAT_KEYS.page(message.threadId), (page) => withMessages(page, [message]));
      if (message.side !== side) {
        void queryClient.invalidateQueries({ queryKey: CHAT_KEYS.unread });
      }
      void queryClient.invalidateQueries({ queryKey: CHAT_KEYS.inbox });
    };
    const onRead = (event: ChatReadEvent) => {
      if (event.side === side) {
        return;
      }
      queryClient.setQueryData<ChatPageView>(CHAT_KEYS.page(event.threadId), (page) =>
        page && (!page.thread.otherSideReadAt || page.thread.otherSideReadAt < event.readAt) ? { ...page, thread: { ...page.thread, otherSideReadAt: event.readAt } } : page,
      );
    };
    const onConnect = () => void queryClient.invalidateQueries({ queryKey: CHAT_KEYS.all });
    socket.on(CHAT_EVENTS.message, onMessage);
    socket.on(CHAT_EVENTS.read, onRead);
    socket.io.on("reconnect", onConnect);
    return () => {
      socket.off(CHAT_EVENTS.message, onMessage);
      socket.off(CHAT_EVENTS.read, onRead);
      socket.io.off("reconnect", onConnect);
    };
  }, [queryClient, side]);
}
