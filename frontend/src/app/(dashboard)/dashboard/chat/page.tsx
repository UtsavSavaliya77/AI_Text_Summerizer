"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, MessageSquare } from 'lucide-react';
import apiClient from '../../../../lib/api-client';
import { SummaryListItem } from '../../../../types/summary';
import { cn } from '../../../../lib/utils';

interface ChatMessage {
  id:        string;
  role:      'USER' | 'ASSISTANT';
  message:   string;
  createdAt: string;
}

export default function AIChatPage() {
  const [summaries,         setSummaries]         = useState<SummaryListItem[]>([]);
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(null);
  const [messages,          setMessages]          = useState<ChatMessage[]>([]);
  const [input,             setInput]             = useState('');
  const [isLoading,         setIsLoading]         = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadSummaries(); }, []);
  useEffect(() => { if (selectedSummaryId) loadChatHistory(selectedSummaryId); }, [selectedSummaryId]);
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadSummaries = async () => {
    try {
      const res  = await apiClient.get('/summaries');
      const data = res.data.data.summaries as SummaryListItem[];
      setSummaries(data);
      const queryParams    = new URLSearchParams(window.location.search);
      const querySummaryId = queryParams.get('summaryId');
      if (querySummaryId && data.some(s => s.id === querySummaryId)) setSelectedSummaryId(querySummaryId);
      else if (data.length > 0) setSelectedSummaryId(data[0].id);
    } catch (err) { console.error('Failed to load summaries:', err); }
  };

  const loadChatHistory = async (id: string) => {
    setIsFetchingHistory(true);
    try {
      const res = await apiClient.get(`/chat/${id}`);
      setMessages(res.data.data.chats);
    } finally { setIsFetchingHistory(false); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedSummaryId || isLoading) return;
    const userMsg = input;
    setInput('');
    setIsLoading(true);
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempId, role: 'USER', message: userMsg, createdAt: new Date().toISOString() }]);
    try {
      const res = await apiClient.post('/chat', { summaryId: selectedSummaryId, message: userMsg });
      setMessages(prev => [...prev, res.data.data.chat]);
    } catch { alert('Failed to get response'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-5">
      {/* Context Sidebar */}
      <div
        className="w-72 rounded-2xl flex flex-col overflow-hidden hidden lg:flex shrink-0"
        style={{ background: '#111111', border: '1px solid #2E2E2E' }}
      >
        <div className="p-5 flex items-center gap-2" style={{ borderBottom: '1px solid #2E2E2E' }}>
          <MessageSquare className="w-4 h-4 text-[#808080]" />
          <h2 className="font-bold text-white text-sm">Active Contexts</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {summaries.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSummaryId(s.id)}
              className={cn(
                'w-full text-left p-3.5 rounded-xl transition-all text-sm font-medium',
                selectedSummaryId === s.id
                  ? 'bg-[#242424] text-white'
                  : 'text-[#808080] hover:bg-[#1A1A1A] hover:text-[#BDBDBD]'
              )}
              style={{
                border: selectedSummaryId === s.id ? '1px solid #3D3D3D' : '1px solid transparent',
              }}
            >
              <p className="font-semibold truncate">{s.title}</p>
              <p className="text-xs text-[#808080] mt-0.5 truncate">{s.mainTopic}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat */}
      <div
        className="flex-1 rounded-2xl flex flex-col overflow-hidden"
        style={{ background: '#111111', border: '1px solid #2E2E2E' }}
      >
        {/* Chat Header */}
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid #2E2E2E' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#242424', border: '1px solid #3D3D3D' }}
            >
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Document Assistant</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                <p className="text-xs text-[#22C55E] font-medium">Ready to answer questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5" style={{ background: '#0D0D0D' }}>
          {isFetchingHistory ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin text-[#808080]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-10">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: '#1A1A1A', border: '1px solid #2E2E2E' }}
              >
                <MessageSquare className="w-6 h-6 text-[#808080]" />
              </div>
              <h4 className="font-bold text-white text-sm">No messages yet</h4>
              <p className="text-xs text-[#808080] mt-2 max-w-xs leading-relaxed">
                Ask anything about the selected document. The AI only uses the provided text to answer.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex items-end gap-3 max-w-[80%]',
                  msg.role === 'USER' ? 'ml-auto flex-row-reverse' : ''
                )}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: msg.role === 'USER' ? '#E5E5E5' : '#242424',
                    border: '1px solid ' + (msg.role === 'USER' ? '#ccc' : '#3D3D3D'),
                  }}
                >
                  {msg.role === 'USER'
                    ? <User className="w-3.5 h-3.5 text-black" />
                    : <Bot  className="w-3.5 h-3.5 text-white" />
                  }
                </div>
                <div
                  className="p-4 rounded-2xl text-sm leading-relaxed"
                  style={
                    msg.role === 'USER'
                      ? { background: '#E5E5E5', color: '#000', borderBottomRightRadius: 4 }
                      : { background: '#1C1C1C', color: '#BDBDBD', border: '1px solid #2E2E2E', borderBottomLeftRadius: 4 }
                  }
                >
                  {msg.message}
                </div>
              </motion.div>
            ))
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="p-5" style={{ borderTop: '1px solid #2E2E2E', background: '#111111' }}>
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedSummaryId ? 'Ask a question about this document…' : 'Select a document first'}
              disabled={!selectedSummaryId || isLoading}
              className="w-full pl-5 pr-14 py-3.5 text-sm rounded-xl outline-none transition-all disabled:opacity-40"
              style={{
                background: '#1A1A1A',
                border: '1px solid #2E2E2E',
                color: '#fff',
              }}
              onFocus={e  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.06)'; }}
              onBlur={e   => { e.currentTarget.style.borderColor = '#2E2E2E'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all disabled:opacity-30"
              style={{ background: '#E5E5E5', color: '#000' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#ccc')}
              onMouseLeave={e => (e.currentTarget.style.background = '#E5E5E5')}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
          <p className="text-[10px] text-center text-[#808080] mt-3 uppercase tracking-widest font-bold">
            AI responses are based strictly on the uploaded content
          </p>
        </div>
      </div>
    </div>
  );
}