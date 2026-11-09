"use client";

import { LIVE_EVENTS } from "@/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { refreshSession } from "@/lib/api/client";

import { chatSocket } from "./chat-socket";

export function useLiveUpdates(enabled: boolean) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const socket = chatSocket();
    const onChanged = () => {
      void refreshSession().then(() => queryClient.invalidateQueries());
    };
    socket.on(LIVE_EVENTS.accountChanged, onChanged);
    return () => {
      socket.off(LIVE_EVENTS.accountChanged, onChanged);
    };
  }, [enabled, queryClient]);
}
