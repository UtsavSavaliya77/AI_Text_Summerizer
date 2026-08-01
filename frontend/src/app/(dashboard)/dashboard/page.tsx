"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  Zap,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { StatsCard } from '../../../components/dashboard/stats-card';
import Link from 'next/link';
import { summaryService } from '../../../services/summary.service';
import { SummaryListItem } from '../../../types/summary';
import { useAuthStore } from '../../../store/auth-store';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [summaries, setSummaries] = useState<SummaryListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await summaryService.getAll();
        if (Array.isArray(data)) {
          setSummaries(data);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute metrics
  const totalSummaries = summaries.length;
  const totalWords = summaries.reduce((acc, curr) => acc + (curr.wordCount || 0), 0);
  const totalReadingTime = Math.round(totalWords / 200);
  const timeSavedText = totalReadingTime > 60
    ? `${(totalReadingTime / 60).toFixed(1)}h`
    : `${totalReadingTime}m`;
  const wordsText = totalWords > 1000
    ? `${(totalWords / 1000).toFixed(1)}k`
    : `${totalWords}`;

  const recentSummaries = summaries.slice(0, 3);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-slate-500 mt-4 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-slate-900"
        >
          Welcome back, {user?.fullName || 'Explorer'}! 👋
        </motion.h1>
        <p className="text-slate-500 mt-2">Here is what's happening with your summaries today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Summaries"
          value={totalSummaries.toString()}
          icon={FileText}
          color="bg-blue-600"
          delay={0.1}
        />
        <StatsCard
          title="Time Saved"
          value={timeSavedText}
          icon={Clock}
          color="bg-purple-600"
          delay={0.2}
        />
        <StatsCard
          title="Words Processed"
          value={wordsText}
          icon={Zap}
          color="bg-amber-500"
          delay={0.3}
        />
        <StatsCard
          title="Accuracy Rate"
          value="99.9%"
          icon={TrendingUp}
          color="bg-emerald-500"
          delay={0.4}
        />
      </div>

      {/* Quick Actions / Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 glass-card p-8 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Summaries</h2>
            <Link href="/dashboard/history" className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentSummaries.length > 0 ? (
            <div className="overflow-auto max-h-[350px] pr-2">
              <div className="min-w-[600px] space-y-4">
                {/* Table Header */}
                <div className="grid grid-cols-4 pb-4 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                  <div className="col-span-2">Document Name</div>
                  <div>Topic</div>
                  <div className="text-right">Action</div>
                </div>

                {recentSummaries.map((summary) => (
                  <div key={summary.id} className="grid grid-cols-4 items-center py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors rounded-lg px-2">
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-semibold text-slate-700 truncate max-w-xs">{summary.title}</span>
                    </div>
                    <div className="text-sm text-slate-500 truncate">{summary.mainTopic}</div>
                    <div className="text-right">
                      <Link
                        href={`/dashboard/history?summaryId=${summary.id}`}
                        className="text-primary font-semibold text-sm hover:text-blue-700"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="w-12 h-12 text-slate-300 mb-4" />
              <p className="font-medium text-slate-600">No summaries generated yet.</p>
              <p className="text-slate-400 text-sm mt-1">Upload a document to start summarizing!</p>
              <Link
                href="/dashboard/summarize"
                className="mt-4 px-4 py-2 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-blue-600 transition-colors"
              >
                Create Summary
              </Link>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4 relative overflow-hidden flex flex-col justify-between"
        >
          <div className="relative z-10  bg-gradient-to-br from-blue-600 to-blue-700 p-4 px-6 rounded-3xl text-white shadow-xl shadow-blue-200 ">
            <h2 className="text-2xl font-bold">Try New Summary</h2>
            <p className="mt-4 text-blue-100 leading-relaxed text-sm">
              Want to summarize a new document? Upload it and let our AI generate a concise summary for you in seconds.
            </p>
            <div className="relative z-10 mt-8">
              <Link
                href="/dashboard/summarize"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg text-sm w-full justify-center"
              >
                Start Summary <PlusCircle className="w-5 h-5" />
              </Link>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          {/* Decorative Circle */}

          <div className="relative z-10  bg-gradient-to-br from-blue-600 to-blue-700 px-6 p-4 rounded-3xl text-white shadow-xl shadow-blue-200 ">
            <h2 className="text-2xl font-bold">Try AI Chat</h2>
            <p className="mt-4 text-blue-100 leading-relaxed text-sm">
              Have questions about your documents? Chat with our AI to extract specific details instantly.
            </p>
            <div className="relative z-10 mt-8">
            <Link
              href="/dashboard/chat"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg text-sm w-full justify-center"
            >
              Start Chat <PlusCircle className="w-5 h-5" />
            </Link>
          </div>
          {/* Decorative Circle */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}