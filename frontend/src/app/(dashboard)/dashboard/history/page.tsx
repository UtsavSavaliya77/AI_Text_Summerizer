"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Trash2,
  FileText,
  Loader2
} from 'lucide-react';
import { summaryService } from '../../../../services/summary.service';
import { Summary, SummaryListItem } from '../../../../types/summary';
import { formatDate } from '../../../../lib/utils';
import { SummaryDetailModal } from '../../../../components/history/summary-detail-modal';

export default function HistoryPage() {
  const [summaries, setSummaries] = useState<SummaryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchSummaries();
    
    // Read search query parameter from URL
    const queryParams = new URLSearchParams(window.location.search);
    const searchVal = queryParams.get('search');
    if (searchVal) {
      setSearchQuery(searchVal);
    }
  }, []);

  useEffect(() => {
    // Check if summaryId query param is present to auto-open modal
    const queryParams = new URLSearchParams(window.location.search);
    const querySummaryId = queryParams.get('summaryId');
    if (querySummaryId && summaries.length > 0) {
      handleViewDetails(querySummaryId);
    }
  }, [summaries]);

  const fetchSummaries = async () => {
    try {
      const data = await summaryService.getAll();
      // summaryService.getAll might not always return the expected array (or could be void),
      // so guard before updating state to avoid assigning void to setSummaries.
      if (Array.isArray(data)) {
        setSummaries(data);
      } else {
        console.warn('summaryService.getAll returned unexpected data:', data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const summary = await summaryService.getById(id) as unknown as Summary | null;
      if (summary) {
        setSelectedSummary(summary);
        setIsModalOpen(true);
      } else {
        alert("Could not load summary details");
      }
    } catch (error) {
      alert("Could not load summary details");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this summary?")) return;
    try {
      await summaryService.delete(id);
      setSummaries(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      alert("Failed to delete summary");
    }
  };

  const filteredSummaries = summaries.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.mainTopic.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (dateFilter === 'all') return true;
    
    const docDate = new Date(s.createdAt);
    const now = new Date();
    
    if (dateFilter === 'today') {
      return docDate.toDateString() === now.toDateString();
    }
    
    if (dateFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return docDate >= oneWeekAgo;
    }
    
    if (dateFilter === 'month') {
      return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
    }
    
    if (dateFilter === 'year') {
      return docDate.getFullYear() === now.getFullYear();
    }
    
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">History</h1>
          <p className="text-slate-500 mt-1">Manage and revisit your AI-generated summaries.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none w-full sm:w-64 text-sm"
            />
          </div>
          
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-auto pl-3 pr-10 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm text-slate-600 font-semibold cursor-pointer appearance-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-slate-500 mt-4 font-medium">Loading your archives...</p>
        </div>
      ) : filteredSummaries.length > 0 ? (
        <div className="glass-card rounded-3xl overflow-hidden border border-white/20 shadow-xl">
          <div className="max-h-[500px] overflow-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-slate-100">
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Document</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Main Topic</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSummaries.map((summary, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={summary.id} 
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">{summary.title}</p>
                          <p className="text-xs text-slate-400 uppercase">{summary.fileType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold">
                        {summary.mainTopic}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(summary.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewDetails(summary.id)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(summary.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No summaries found</h3>
          <p className="text-slate-500 mt-1">Try adjusting your search or create your first summary.</p>
        </div>
      )}

      <SummaryDetailModal 
        isOpen={isModalOpen} 
        summary={selectedSummary} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}