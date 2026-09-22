"use client";

import React, { useState, useEffect } from "react";
import { Send, MessageSquare, ShieldCheck, Lock, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Message } from "@/types";
import { getErrorMessage, formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/context/AuthContext";

interface LandChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  landId: string;
  landTitle: string;
}

export const LandChatPanel: React.FC<LandChatPanelProps> = ({
  isOpen,
  onClose,
  landId,
  landTitle,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && landId) {
      fetchMessages();
    }
  }, [isOpen, landId]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get(`/api/messages/land/${landId}`);
      if (res.data?.messages) {
        setMessages(res.data.messages);
      }
    } catch (err: any) {
      console.error("Fetch land messages error:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setError(null);
    setIsSending(true);

    try {
      await api.post("/api/messages", {
        content,
        landContextId: landId,
      });

      setContent("");
      await fetchMessages();
    } catch (err: any) {
      console.error("Send message error:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Inquire About ${landTitle}`} maxWidth="lg">
      <div className="space-y-4 flex flex-col max-h-[70vh]">
        {/* Safety Header Notice */}
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 flex items-center gap-2 text-xs text-emerald-300">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Admin Safety Routing:</strong> Inquiries are handled directly by platform admins to protect buyers from fraud.
          </span>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-950 rounded-xl border border-slate-800 min-h-[220px] max-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center text-slate-500 space-y-1">
              <MessageSquare className="w-8 h-8 text-slate-600" />
              <p className="text-xs font-medium text-slate-400">No prior messages for this land.</p>
              <p className="text-[11px] text-slate-600">Type your question below to start an inquiry ticket with Admin.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                      isMe
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none"
                    }`}
                  >
                    <div className="font-semibold text-[10px] opacity-75 mb-0.5">
                      {isMe ? "You" : msg.sender?.fullName || "Admin Support"}
                    </div>
                    <p className="leading-relaxed">{msg.content}</p>
                    <span className="text-[9px] opacity-60 mt-1 block text-right">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSend} className="flex gap-2 pt-2">
          <Input
            placeholder="Type your question regarding price, 7/12 documents, or visit details..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSending}
          />
          <Button
            type="submit"
            variant="primary"
            isLoading={isSending}
            disabled={!content.trim()}
            rightIcon={<Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </form>
      </div>
    </Modal>
  );
};
