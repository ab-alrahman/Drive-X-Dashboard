import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveAssetUrl } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { localizeError } from "@/lib/errors";
import type { ChatMessage, ChatThread } from "@/lib/api-types";
import {
  getAdminChatMessages,
  getAdminChatThreads,
  getMyChatMessages,
  getMyChatThreads,
  sendAdminChatMessage,
  sendMyChatMessage,
} from "@/lib/chat-api";

type ChatMode = "customer" | "vendor" | "admin";

const THREADS_POLL_MS = 12000;
const MESSAGES_POLL_MS = 8000;

export default function ChatPanel({
  mode,
  initialThreadId,
}: {
  mode: ChatMode;
  initialThreadId?: string;
}) {
  const { t, language } = useI18n();
  const isArabic = language === "ar";
  const readOnly = mode === "admin";
  // "My" side of the conversation - which sender_type is the current user.
  const mySide = mode === "customer" ? "CUSTOMER" : "VENDOR";

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(initialThreadId ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const listThreads = useCallback(
    () => (mode === "customer" ? getMyChatThreads() : getAdminChatThreads()),
    [mode],
  );
  const loadMessages = useCallback(
    (threadId: string) =>
      mode === "customer" ? getMyChatMessages(threadId) : getAdminChatMessages(threadId),
    [mode],
  );

  const refreshThreads = useCallback(async () => {
    try {
      const data = await listThreads();
      setThreads(data);
      setActiveThreadId((current) => current ?? data[0]?.id ?? null);
    } catch (err) {
      setError(localizeError(err, t));
    } finally {
      setLoading(false);
    }
  }, [listThreads, t]);

  useEffect(() => {
    refreshThreads();
    const id = window.setInterval(refreshThreads, THREADS_POLL_MS);
    return () => window.clearInterval(id);
  }, [refreshThreads]);

  useEffect(() => {
    if (!activeThreadId) return;
    let cancelled = false;

    const pull = async () => {
      try {
        const data = await loadMessages(activeThreadId);
        if (!cancelled) setMessages(data.messages);
      } catch (err) {
        if (!cancelled) setError(localizeError(err, t));
      }
    };

    pull();
    const id = window.setInterval(pull, MESSAGES_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [activeThreadId, loadMessages, t]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const activeThread = threads.find((thread) => thread.id === activeThreadId) ?? null;

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeThreadId || !draft.trim() || readOnly) return;
    setSending(true);
    setError("");
    try {
      const sender = mode === "customer" ? sendMyChatMessage : sendAdminChatMessage;
      const message = await sender(activeThreadId, draft.trim());
      setMessages((current) => [...current, message]);
      setDraft("");
      refreshThreads();
    } catch (err) {
      setError(localizeError(err, t, "errSubmitRequest"));
    } finally {
      setSending(false);
    }
  };

  const counterpartName = (thread: ChatThread) =>
    mySide === "CUSTOMER" || mode === "admin"
      ? thread.vendorName ?? t("chatSeller")
      : thread.customerName ?? t("chatCustomer");

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 min-h-[28rem]">
      {/* Thread list */}
      <div className="rounded-xl border border-white/10 bg-[#121826] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 text-white/70 text-sm font-medium">
          {t("chatTab")}
        </div>
        <div className="max-h-[26rem] overflow-y-auto">
          {loading ? (
            <p className="p-4 text-white/40 text-sm">{t("loading")}</p>
          ) : threads.length === 0 ? (
            <p className="p-4 text-white/40 text-sm">{t("chatNoThreads")}</p>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => setActiveThreadId(thread.id)}
                className={`w-full text-start px-4 py-3 border-b border-white/5 transition-colors ${
                  thread.id === activeThreadId ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white text-sm font-medium truncate">
                    {counterpartName(thread)}
                  </span>
                  {thread.unreadCount > 0 && (
                    <span className="shrink-0 rounded-full bg-[#00D2FF] text-[#0B0F19] text-xs font-bold px-2">
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
                {thread.car && (
                  <p className="text-white/40 text-xs truncate mt-0.5">
                    {thread.car.brand} {thread.car.model} {thread.car.year}
                  </p>
                )}
                {mode === "admin" && (
                  <p className="text-white/30 text-xs truncate">
                    {thread.customerName} · {thread.vendorName}
                  </p>
                )}
                {thread.lastMessagePreview && (
                  <p className="text-white/40 text-xs truncate mt-0.5">{thread.lastMessagePreview}</p>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Conversation */}
      <div className="rounded-xl border border-white/10 bg-[#121826] flex flex-col">
        {error && (
          <div className="m-3 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
            {error}
          </div>
        )}
        {!activeThread ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/40 text-sm gap-2 p-8">
            <MessageSquare className="w-8 h-8" />
            {t("chatSelectConversation")}
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
              {activeThread.car?.imageUrl && (
                <img
                  src={resolveAssetUrl(activeThread.car.imageUrl)}
                  alt=""
                  className="w-10 h-10 rounded object-cover"
                />
              )}
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {counterpartName(activeThread)}
                </p>
                {activeThread.car && (
                  <p className="text-white/40 text-xs truncate">
                    {activeThread.car.brand} {activeThread.car.model} {activeThread.car.year}
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[22rem]">
              {messages.map((message) => {
                const mine = !readOnly && message.senderType === mySide;
                return (
                  <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                        mine
                          ? "bg-[#00D2FF] text-[#0B0F19]"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {readOnly && (
                        <p className="text-[10px] uppercase tracking-wide opacity-60 mb-0.5">
                          {message.senderType === "CUSTOMER" ? t("chatCustomer") : t("chatSeller")}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap break-words">{message.body}</p>
                      <p className={`text-[10px] mt-1 ${mine ? "text-[#0B0F19]/60" : "text-white/40"}`}>
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {readOnly ? (
              <div className="px-4 py-3 border-t border-white/10 text-white/40 text-xs">
                {t("chatAdminReadOnly")}
              </div>
            ) : (
              <form onSubmit={handleSend} className="px-4 py-3 border-t border-white/10 flex gap-2">
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={t("chatTypeMessage")}
                  className="bg-white/5 border-white/10 text-white"
                  dir={isArabic ? "rtl" : "ltr"}
                />
                <Button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="bg-[#00D2FF] hover:bg-[#00D2FF]/80 text-[#0B0F19] font-semibold"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
