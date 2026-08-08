"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  Loader2,
  Sparkles,
  MessageSquare,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { StatsCard } from '../../../components/dashboard/stats-card';
import Link from 'next/link';
import { summaryService } from '../../../services/summary.service';
import { SummaryListItem } from '../../../types/summary';
import { useAuthStore } from '../../../store/auth-store';
import Galaxy from '../../../components/ui/Galaxy';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [summaries, setSummaries] = useState<SummaryListItem[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await summaryService.getAll();
        if (Array.isArray(data)) setSummaries(data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalSummaries = summaries.length;
  const recentSummaries = summaries.slice(0, 4);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-8 h-8 animate-spin text-[#808080]" />
        <p className="text-[#808080] mt-4 text-sm font-medium">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-6rem)]">
      {/* ─── Galaxy WebGL Shader Background ─── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <Galaxy
          starSpeed={0.05}
          density={0.4}
          speed={0.8}
          glowIntensity={0.1}
          saturation={0.0}
          twinkleIntensity={0.5}
          rotationSpeed={0.05}
          mouseInteraction={false}
          mouseRepulsion={false}
          repulsionStrength={2.5}
          transparent={false}
        />
      </div>

      {/* Floating Monochrome Ambient Glow Orbs */}
      <div
        className="fixed top-[-10%] right-[-5%] w-[550px] h-[550px] rounded-full pointer-events-none animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%)',
          filter: 'blur(90px)',
          animationDuration: '8s',
          zIndex: 0,
        }}
      />
      <div
        className="fixed bottom-[-10%] left-[15%] w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
      />

      {/* ─── Main Foreground Content ─── */}
      <div className="relative z-10 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-[#333333] bg-[#1A1A1A] text-[#BDBDBD]"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>AI Intelligence Hub</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight"
            >
              Welcome back, {user?.fullName || 'Explorer'} 👋
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-[#808080] mt-2 text-sm"
            >
              Here is what's happening with your documents and summaries today.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/dashboard/summarize"
              className="btn-primary py-3 px-5 text-sm rounded-xl font-bold group transition-all"
            >
              <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90" />
              <span>New Summary</span>
            </Link>
          </motion.div>
        </div>

        {/* ─── 2 Active Stats Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <StatsCard
            title="Total Summaries"
            value={totalSummaries.toString()}
            icon={FileText}
            trend={totalSummaries > 0 ? `+${totalSummaries} generated` : 'Ready'}
            subtitle="Processed documents"
            delay={0.1}
          />
          <StatsCard
            title="Accuracy Rate"
            value="99.9%"
            icon={TrendingUp}
            trend="High Precision"
            subtitle="Groq LLaMA 3.3 Engine"
            delay={0.2}
          />
        </div>

        {/* ─── Content Row ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Summaries Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="lg:col-span-2 glass-card p-6 flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all duration-300 shadow-xl"
            style={{
              background: 'rgba(18, 18, 18, 0.45)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Subtle corner light */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.03] rounded-full blur-3xl pointer-events-none group-hover:bg-white/[0.06] transition-colors duration-500" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-[#BDBDBD]" />
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight">Recent Summaries</h2>
                </div>
                <Link
                  href="/dashboard/history"
                  className="text-xs text-[#BDBDBD] font-semibold flex items-center gap-1 hover:text-white transition-colors"
                >
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentSummaries.length > 0 ? (
                <div className="overflow-auto max-h-[340px] pr-1">
                  <div className="min-w-[520px] space-y-1">
                    {/* Table Header */}
                    <div
                      className="grid grid-cols-4 pb-3 text-[10px] font-bold text-[#808080] uppercase tracking-widest"
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
                    >
                      <div className="col-span-2">Document</div>
                      <div>Topic</div>
                      <div className="text-right">Action</div>
                    </div>

                    {recentSummaries.map((summary) => (
                      <motion.div
                        key={summary.id}
                        whileHover={{ scale: 1.008, x: 2 }}
                        transition={{ duration: 0.15 }}
                        className="grid grid-cols-4 items-center py-3.5 px-3 transition-colors rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/10"
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                      >
                        <div className="col-span-2 flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                            style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                          >
                            <FileText className="w-4 h-4 text-[#BDBDBD]" />
                          </div>
                          <span className="font-semibold text-[#E0E0E0] truncate max-w-[160px] text-sm">
                            {summary.title}
                          </span>
                        </div>
                        <div className="text-xs text-[#808080] truncate font-medium">
                          {summary.mainTopic || 'General'}
                        </div>
                        <div className="text-right">
                          <Link
                            href={`/dashboard/history?summaryId=${summary.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#D4D4D4] hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                          >
                            View →
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-inner"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                  >
                    <Sparkles className="w-6 h-6 text-[#BDBDBD] animate-pulse" />
                  </div>
                  <p className="font-bold text-[#E0E0E0] text-sm">No summaries yet</p>
                  <p className="text-[#808080] text-xs mt-1">Upload a document to start summarizing!</p>
                  <Link
                    href="/dashboard/summarize"
                    className="mt-5 btn-primary text-xs py-2.5 px-6 rounded-xl font-bold"
                  >
                    Create First Summary
                  </Link>
                </div>
              )}
            </div>

            {/* Bottom Status bar */}
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#808080]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#BDBDBD]" />
                All systems operational
              </span>
              <span>Lumina v2.0</span>
            </div>
          </motion.div>

          {/* Quick Action Interactive Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-4"
          >
            {/* New Summary CTA Card */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="group relative glass-card p-6 flex flex-col justify-between flex-1 overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
              style={{
                background: 'rgba(18, 18, 18, 0.45)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.04] rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
              <div>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-md"
                  style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)' }}
                >
                  <PlusCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">Try New Summary</h2>
                <p className="mt-2 text-[#808080] leading-relaxed text-xs">
                  Upload a PDF or Word document and let AI generate executive summaries in seconds.
                </p>
              </div>
              <Link
                href="/dashboard/summarize"
                className="btn-primary mt-5 text-xs py-2.5 rounded-xl font-bold justify-center transition-all"
              >
                Start Summary <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* AI Chat CTA Card */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="group relative glass-card p-6 flex flex-col justify-between flex-1 overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
              style={{
                background: 'rgba(18, 18, 18, 0.45)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.04] rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
              <div>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-md"
                  style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)' }}
                >
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">Interactive AI Chat</h2>
                <p className="mt-2 text-[#808080] leading-relaxed text-xs">
                  Ask deep questions, extract key takeaways, and chat with your documents directly.
                </p>
              </div>
              <Link
                href="/dashboard/chat"
                className="btn-secondary mt-5 text-xs py-2.5 rounded-xl font-bold justify-center transition-all hover:bg-white/10"
              >
                Start Chat <MessageSquare className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}