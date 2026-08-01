"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, MessageSquare, Search } from 'lucide-react';
import apiClient from '../../../../lib/api-client';
import { SummaryListItem } from '../../../../types/summary';
import { cn } from '../../../../lib/utils';

interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  message: string;
  createdAt: string;
}

export default function AIChatPage() {
  const [summaries, setSummaries] = useState<SummaryListItem[]>([]);
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSummaries();
  }, []);

  useEffect(() => {
    if (selectedSummaryId) loadChatHistory(selectedSummaryId);
  }, [selectedSummaryId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSummaries = async () => {
    try {
      const res = await apiClient.get('/summaries');
      const data = res.data.data.summaries as SummaryListItem[];
      setSummaries(data);
      
      // Auto-select summary from URL query param if present
      const queryParams = new URLSearchParams(window.location.search);
      const querySummaryId = queryParams.get('summaryId');
      
      if (querySummaryId && data.some(s => s.id === querySummaryId)) {
        setSelectedSummaryId(querySummaryId);
      } else if (data.length > 0) {
        setSelectedSummaryId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load summaries:", err);
    }
  };

  const loadChatHistory = async (id: string) => {
    setIsFetchingHistory(true);
    try {
      const res = await apiClient.get(`/chat/${id}`);
      setMessages(res.data.data.chats);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedSummaryId || isLoading) return;

    const userMsg = input;
    setInput('');
    setIsLoading(true);

    // Optimistic Update
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempId, role: 'USER', message: userMsg, createdAt: new Date().toISOString() }]);

    try {
      const res = await apiClient.post('/chat', { summaryId: selectedSummaryId, message: userMsg });
      setMessages(prev => [...prev, res.data.data.chat]);
    } catch (err) {
      alert("Failed to get response");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex gap-6">
      {/* Sidebar - Context Selector */}
      <div className="w-80 glass-card rounded-3xl flex flex-col overflow-hidden hidden lg:flex">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> Active Contexts
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {summaries.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSummaryId(s.id)}
              className={cn(
                "w-full text-left p-4 rounded-2xl transition-all border",
                selectedSummaryId === s.id 
                  ? "bg-primary border-primary text-white shadow-lg" 
                  : "bg-white border-slate-100 text-slate-600 hover:border-primary/30"
              )}
            >
              <p className="font-semibold text-sm truncate">{s.title}</p>
              <p className={cn("text-xs mt-1", selectedSummaryId === s.id ? "text-blue-100" : "text-slate-400")}>
                {s.mainTopic}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass-card rounded-3xl flex flex-col overflow-hidden border border-white/40 shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Document Assistant</h3>
              <p className="text-xs text-emerald-500 font-medium">Ready to answer questions</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {isFetchingHistory ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-10">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="font-bold text-slate-900">No messages yet</h4>
              <p className="text-sm text-slate-500 mt-2">
                Ask anything about the selected document. The AI only uses the provided text to answer.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex items-start gap-4 max-w-[80%]",
                  msg.role === 'USER' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                  msg.role === 'USER' ? "bg-slate-900 text-white" : "bg-white text-primary border border-slate-100"
                )}>
                  {msg.role === 'USER' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'USER' 
                    ? "bg-primary text-white rounded-tr-none shadow-md" 
                    : "bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm"
                )}>
                  {msg.message}
                </div>
              </motion.div>
            ))
          )}
          <div ref={scrollRef} />
        </div>

        <div className="p-6 bg-white border-t border-slate-100">
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedSummaryId ? "Ask a question about this document..." : "Select a document first"}
              disabled={!selectedSummaryId || isLoading}
              className="w-full pl-6 pr-16 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-primary text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-3 uppercase tracking-widest font-bold">
            AI responses are based strictly on the uploaded content
          </p>
        </div>
      </div>
    </div>
  );
}