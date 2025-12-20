"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string;
  model?: string;
}

export default function AISupportChat() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        provider: data.provider,
        model: data.model,
      };

      setMessages((prev) => [...prev, aiMessage]);
      
      // Auto-close chat after successful response (desktop only, mobile stays open)
      if (window.innerWidth >= 768) {
        setTimeout(() => {
          setIsOpen(false);
          // Clear messages after a delay to allow user to see response
          setTimeout(() => setMessages([]), 2000);
        }, 3000);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg = error instanceof Error ? error.message : "Connection failed";
      
      // Better error handling for mobile
      if (errorMsg.includes("Failed to fetch") || errorMsg.includes("NetworkError")) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Unable to connect to AI assistant. Please try again.");
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting right now. Please check your internet connection and try again, or contact support@echoforge.com for immediate assistance.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Ultra Premium Chat Button - Mobile Responsive */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9998] flex h-16 w-16 md:h-14 md:w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-2xl shadow-blue-500/50 hover:scale-110 active:scale-95 transition-transform group ring-4 ring-blue-500/20"
          aria-label="Open AI support chat"
        >
        <ChatBubbleLeftRightIcon className="h-7 w-7 md:h-6 md:w-6 text-white group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 flex h-6 w-6 md:h-5 md:w-5 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-xs font-black text-white shadow-lg shadow-emerald-500/50 ring-2 ring-emerald-400/30">
          AI
        </span>
        </button>
      )}

      {/* Chat Window - Responsive & Premium Design */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-4 right-4 md:bottom-24 md:right-6 z-[9999] flex flex-col rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-950/98 via-slate-900/98 to-slate-950/98 backdrop-blur-xl shadow-2xl shadow-black/60 ring-2 ring-blue-500/20 h-[calc(100vh-32px)] w-[calc(100vw-32px)] md:h-[600px] md:w-[420px] md:max-w-[420px]"
            style={{ touchAction: 'none' }}
          >
            {/* Ultra Premium Header */}
            <div className="flex items-center justify-between border-b border-slate-800/90 bg-gradient-to-r from-slate-950/98 via-slate-900/98 to-slate-950/98 px-5 py-4 backdrop-blur-xl shadow-lg shadow-blue-500/10">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-xl shadow-blue-500/40 ring-2 ring-blue-500/20">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">AI Support Assistant</h3>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Powered by GPT/Grok/Claude</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Clear messages after closing to reset state
                  setTimeout(() => setMessages([]), 300);
                }}
                className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-800/90 hover:text-white transition-all border border-transparent hover:border-slate-700/60 shadow-sm hover:shadow-lg"
                aria-label="Close chat"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Messages - Ultra Premium Enterprise Chat Layout */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-5 md:p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent bg-gradient-to-b from-slate-950/50 via-slate-900/30 to-slate-950/50" style={{ WebkitOverflowScrolling: 'touch' }}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600/30 via-purple-600/30 to-pink-600/30 mb-6 ring-2 ring-blue-500/20 shadow-xl shadow-blue-500/20">
                    <SparklesIcon className="h-10 w-10 text-blue-400" />
                  </div>
                  <h4 className="text-xl font-black bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-3">How can I assist you today?</h4>
                  <p className="text-sm text-slate-400 mb-8 font-medium max-w-md">
                    Ask me anything about EchoForge, anomaly detection, or get technical support. I'm here to help.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
                    {[
                      "How do I upload data?",
                      "What detection methods are available?",
                      "How do I upgrade my plan?",
                      "Explain anomaly detection",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setInput(suggestion);
                          setTimeout(() => handleSend(), 100);
                        }}
                        className="px-4 py-3 text-sm text-left rounded-xl border border-slate-700/80 bg-gradient-to-br from-slate-900/80 to-slate-950/80 hover:bg-slate-800/90 hover:border-blue-500/60 transition-all text-slate-200 font-medium shadow-sm hover:shadow-lg hover:shadow-blue-500/20"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white shadow-blue-500/30 ring-2 ring-blue-500/20"
                          : "bg-gradient-to-br from-slate-800/90 to-slate-900/90 text-slate-100 border border-slate-700/60 shadow-slate-900/50 ring-1 ring-slate-700/30"
                      }`}
                    >
                      <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      {message.provider && (
                        <p className="mt-2 text-xs opacity-70 font-semibold uppercase tracking-wider">
                          {message.provider} • {message.model}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-slate-800/80 border border-slate-700/50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" />
                      <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Ultra Premium Input Area - Enterprise Design */}
            <div className="border-t border-slate-800/90 bg-gradient-to-r from-slate-950/98 via-slate-900/98 to-slate-950/98 backdrop-blur-xl p-4 md:p-5 shadow-2xl shadow-black/40">
              <div className="flex items-end gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 rounded-2xl border border-slate-700/90 bg-slate-950/90 px-5 py-3.5 text-sm font-medium text-slate-200 placeholder:text-slate-500 focus:border-blue-500/70 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50 transition-all shadow-inner shadow-black/20"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white shadow-xl shadow-blue-500/40 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all ring-2 ring-blue-500/30"
                  aria-label="Send message"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-500 text-center font-semibold uppercase tracking-wider">
                Powered by Enterprise AI • GPT/Grok/Claude
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
