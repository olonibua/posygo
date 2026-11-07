"use client";

import { CHAT_NAMESPACE } from "@/shared";
import { io, type Socket } from "socket.io-client";

import { apiOrigin, currentAccessToken, onSessionChange, refreshSession } from "@/lib/api/client";

const UNAUTHORISED = "unauthorised";

let socket: Socket | null = null;
let refreshing = false;

function create(): Socket {
  const created = io(`${apiOrigin()}${CHAT_NAMESPACE}`, {
    auth: (send) => send({ token: currentAccessToken() }),
    transports: ["websocket", "polling"],
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
  });
  created.on("connect_error", (error) => {
    if (error.message !== UNAUTHORISED || refreshing) {
      return;
    }
    refreshing = true;
    void refreshSession()
      .then((session) => {
        if (session && socket === created) {
          created.connect();
        }
      })
      .finally(() => {
        refreshing = false;
      });
  });
  return created;
}

export function chatSocket(): Socket {
  socket ??= create();
  return socket;
}

onSessionChange((session) => {
  if (!session && socket) {
    socket.disconnect();
    socket = null;
  }
});
