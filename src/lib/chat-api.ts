import { apiFetch } from "./api";
import type { ChatMessage, ChatThread, ChatThreadWithMessages } from "./api-types";

/* ---------- Customer ---------- */

export function getMyChatThreads() {
  return apiFetch<ChatThread[]>("/v1/public/chat/threads", { auth: "customer" });
}

export function startChatThread(carId: string) {
  return apiFetch<ChatThread>("/v1/public/chat/threads", {
    method: "POST",
    body: JSON.stringify({ carId }),
    auth: "customer",
  });
}

export function getMyChatMessages(threadId: string) {
  return apiFetch<ChatThreadWithMessages>(`/v1/public/chat/threads/${threadId}/messages`, {
    auth: "customer",
  });
}

export function sendMyChatMessage(threadId: string, body: string) {
  return apiFetch<ChatMessage>(`/v1/public/chat/threads/${threadId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
    auth: "customer",
  });
}

/* ---------- Seller / Platform Admin ---------- */

export function getAdminChatThreads() {
  return apiFetch<ChatThread[]>("/v1/admin/chat/threads", { auth: true });
}

export function getAdminChatMessages(threadId: string) {
  return apiFetch<ChatThreadWithMessages>(`/v1/admin/chat/threads/${threadId}/messages`, {
    auth: true,
  });
}

export function sendAdminChatMessage(threadId: string, body: string) {
  return apiFetch<ChatMessage>(`/v1/admin/chat/threads/${threadId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
    auth: true,
  });
}
