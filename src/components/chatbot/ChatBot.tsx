"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
} from "lucide-react";
import type { ChatMessage } from "@/types/portfolio";

interface ChatBotProps {
  username: string;
  personName: string;
}

export default function ChatBot({ username, personName }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hi! I'm an AI assistant for ${personName}'s portfolio. Ask me anything about their experience, skills, or projects!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (directMessage?: string) => {
    const msg = directMessage || input.trim();
    if (!msg || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setIsLoading(true);
    const userMessage = msg;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, username }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "What are their skills?",
    "Tell me about their experience",
    "What projects have they built?",
    "What's their education?",
  ];

  return (
    <>
      {/* Chat toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[600px] rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-color)] bg-gradient-to-r from-purple-600/10 to-cyan-600/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Assistant</h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Ask about {personName}
                  </p>
                </div>
                <Sparkles className="w-4 h-4 text-purple-400 ml-auto" />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "user"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-cyan-500/20 text-cyan-400"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                      msg.role === "user"
                        ? "bg-purple-600/20 text-[var(--text-primary)]"
                        : "bg-[var(--bg-card)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-[var(--bg-card)] px-4 py-3 rounded-xl flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] typing-dot" />
                    <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] typing-dot" />
                    <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] typing-dot" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick questions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="px-3 py-1.5 text-xs rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-[var(--border-color)]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(undefined)}
                  placeholder="Ask about skills, experience..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-purple-500/50 transition-colors"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
