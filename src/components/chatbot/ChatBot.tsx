"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, MessageCircle, Loader2 } from "lucide-react";
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
      content: `Hey! I'm a digital version of ${personName} — ask me anything about my work, skills, or experience. I'm basically ${personName.split(" ")[0]} but I never need coffee.`,
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
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, username }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.ok ? data.response : "Hmm, something went wrong — try again?",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Lost my connection for a sec — try again!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "What's your strongest skill?",
    "Tell me about your best project",
    "Are you open to new roles?",
    "How can I reach you?",
  ];

  const initials = personName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes typingBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }
        .chat-window { animation: chatSlideUp 0.22s cubic-bezier(0.22,1,0.36,1) both; }
        .typing-dot-chat { animation: typingBounce 1.1s ease-in-out infinite; }
        .typing-dot-chat:nth-child(2) { animation-delay: 0.18s; }
        .typing-dot-chat:nth-child(3) { animation-delay: 0.36s; }
        .chat-toggle { transition: transform 0.15s ease, background 0.25s ease, box-shadow 0.25s ease; }
        .chat-toggle:hover { transform: scale(1.08); box-shadow: 0 12px 36px rgba(232,197,71,0.5) !important; }
        .chat-toggle:active { transform: scale(0.93); }
        .send-btn { transition: opacity 0.2s, transform 0.15s; }
        .send-btn:hover:not(:disabled) { opacity: 0.85; transform: scale(1.05); }
        .quick-q { transition: border-color 0.2s, color 0.2s; }
        .quick-q:hover { border-color: var(--accent) !important; color: var(--accent) !important; }
        .msg-input:focus { border-color: var(--accent) !important; outline: none; }
        .close-btn { transition: color 0.2s, background 0.2s; }
        .close-btn:hover { color: var(--text) !important; background: rgba(240,236,226,0.07) !important; }
      `}</style>

      {/* ─── Toggle Button ─── */}
      <button
        className="chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 60,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: isOpen ? "#1a1a1a" : "var(--accent)",
          border: isOpen ? "1px solid rgba(240,236,226,0.12)" : "none",
          color: isOpen ? "var(--text)" : "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: isOpen ? "none" : "0 8px 28px rgba(232,197,71,0.4)",
        }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {/* ─── Chat Window ─── */}
      {isOpen && (
        <div
          className="chat-window"
          style={{
            position: "fixed",
            bottom: 84,
            right: 24,
            zIndex: 60,
            width: 380,
            maxHeight: 560,
            display: "flex",
            flexDirection: "column",
            background: "#0d0d0d",
            border: "1px solid rgba(240,236,226,0.08)",
            borderTop: "2px solid var(--accent)",
            borderRadius: "16px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.65)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.875rem 1rem",
              borderBottom: "1px solid rgba(240,236,226,0.06)",
              background: "#111",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                background: "var(--accent)",
                color: "#0a0a0a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Playfair Display', var(--serif), serif",
                fontWeight: 700,
                fontSize: "0.75rem",
                flexShrink: 0,
                borderRadius: "8px",
              }}
            >
              {initials}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'DM Sans', var(--sans), sans-serif",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "var(--text)",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {personName}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', var(--mono), monospace",
                  fontSize: "0.62rem",
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                Ask me anything · Always on
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.62rem",
                  color: "#47c8b0",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#47c8b0",
                    flexShrink: 0,
                  }}
                />
                Online
              </span>
              <button
                className="close-btn"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px",
                  borderRadius: "6px",
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              minHeight: 260,
              maxHeight: 340,
              background: "#0a0a0a",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  gap: "0.5rem",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: msg.role === "assistant" ? "7px" : "50%",
                    background: msg.role === "assistant" ? "var(--accent)" : "#1a1a1a",
                    border: msg.role === "user" ? "1px solid rgba(240,236,226,0.1)" : "none",
                    color: msg.role === "assistant" ? "#0a0a0a" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    fontSize: "0.58rem",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {msg.role === "assistant" ? initials : "U"}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "82%",
                  }}
                >
                  <div
                    style={
                      msg.role === "assistant"
                        ? {
                            background: "#161616",
                            borderLeft: "2px solid var(--accent)",
                            padding: "0.6rem 0.85rem",
                            fontSize: "0.85rem",
                            lineHeight: 1.6,
                            color: "var(--text)",
                            borderRadius: "0 10px 10px 10px",
                          }
                        : {
                            background: "var(--accent)",
                            color: "#0a0a0a",
                            padding: "0.6rem 0.85rem",
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            lineHeight: 1.6,
                            borderRadius: "10px 0 10px 10px",
                          }
                    }
                  >
                    {msg.content}
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.58rem",
                      color: "var(--text-muted)",
                      marginTop: "0.2rem",
                    }}
                  >
                    {formatTime()}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "7px",
                    background: "var(--accent)",
                    color: "#0a0a0a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    fontSize: "0.58rem",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {initials}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 5,
                    alignItems: "center",
                    padding: "0.65rem 0.85rem",
                    background: "#161616",
                    borderLeft: "2px solid var(--accent)",
                    borderRadius: "0 10px 10px 10px",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="typing-dot-chat"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--accent)",
                        display: "inline-block",
                        animationDelay: `${i * 0.18}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && (
            <div
              style={{
                padding: "0 1rem 0.75rem",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.4rem",
                background: "#0a0a0a",
              }}
            >
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  className="quick-q"
                  onClick={() => sendMessage(q)}
                  style={{
                    padding: "0.3rem 0.7rem",
                    background: "transparent",
                    border: "1px solid rgba(232,197,71,0.25)",
                    color: "var(--text-muted)",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.62rem",
                    letterSpacing: "0.04em",
                    cursor: "pointer",
                    borderRadius: "20px",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            style={{
              padding: "0.75rem",
              borderTop: "1px solid rgba(240,236,226,0.06)",
              background: "#111",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(undefined)}
              placeholder="Ask me anything..."
              className="msg-input"
              style={{
                background: "#0a0a0a",
                border: "1px solid rgba(240,236,226,0.08)",
                color: "var(--text)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.875rem",
                padding: "0.6rem 0.9rem",
                flex: 1,
                outline: "none",
                borderRadius: "10px",
                transition: "border-color 0.2s",
              }}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              style={{
                width: 40,
                height: 40,
                background: "var(--accent)",
                color: "#0a0a0a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                opacity: isLoading || !input.trim() ? 0.4 : 1,
                borderRadius: "10px",
                flexShrink: 0,
              }}
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>

          <div
            style={{
              padding: "0.4rem",
              textAlign: "center",
              background: "#111",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.58rem",
              color: "var(--text-muted)",
              letterSpacing: "0.08em",
              borderTop: "1px solid rgba(240,236,226,0.04)",
            }}
          >
            Powered by PortfolioAI · AI trained on resume
          </div>
        </div>
      )}
    </>
  );
}
