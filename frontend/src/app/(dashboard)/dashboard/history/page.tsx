"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Trash2, FileText, Loader2 } from 'lucide-react';
import { summaryService } from '../../../../services/summary.service';
import { Summary, SummaryListItem } from '../../../../types/summary';
import { formatDate } from '../../../../lib/utils';
import { SummaryDetailModal } from '../../../../components/history/summary-detail-modal';

export default function HistoryPage() {
  const [summaries,       setSummaries]       = useState<SummaryListItem[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [searchQuery,     setSearchQuery]     = useState('');
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [isModalOpen,     setIsModalOpen]     = useState(false);
  const [dateFilter,      setDateFilter]      = useState('all');

  useEffect(() => {
    fetchSummaries();
    const queryParams = new URLSearchParams(window.location.search);
    const searchVal   = queryParams.get('search');
    if (searchVal) setSearchQuery(searchVal);
  }, []);

  useEffect(() => {
    const queryParams    = new URLSearchParams(window.location.search);
    const querySummaryId = queryParams.get('summaryId');
    if (querySummaryId && summaries.length > 0) handleViewDetails(querySummaryId);
  }, [summaries]);

  const fetchSummaries = async () => {
    try {
      const data = await summaryService.getAll();
      if (Array.isArray(data)) setSummaries(data);
      else console.warn('summaryService.getAll returned unexpected data:', data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const summary = await summaryService.getById(id) as unknown as Summary | null;
      if (summary) { setSelectedSummary(summary); setIsModalOpen(true); }
      else alert('Could not load summary details');
    } catch { alert('Could not load summary details'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this summary?')) return;
    try {
      await summaryService.delete(id);
      setSummaries(prev => prev.filter(s => s.id !== id));
    } catch { alert('Failed to delete summary'); }
  };

  const filteredSummaries = summaries.filter(s => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mainTopic.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (dateFilter === 'all') return true;
    const docDate = new Date(s.createdAt), now = new Date();
    if (dateFilter === 'today')  return docDate.toDateString() === now.toDateString();
    if (dateFilter === 'week')   { const w = new Date(); w.setDate(now.getDate() - 7); return docDate >= w; }
    if (dateFilter === 'month')  return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
    if (dateFilter === 'year')   return docDate.getFullYear() === now.getFullYear();
    return true;
  });

  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">History</h1>
          <p className="text-[#808080] mt-1 text-sm">Manage and revisit your AI-generated summaries.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808080]" />
            <input
              type="text"
              placeholder="Search history…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm rounded-xl outline-none w-full sm:w-60 transition-all"
              style={{
                background: '#181818',
                border: '1px solid #2E2E2E',
                color: '#fff',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.06)'; }}
              onBlur={e  => { e.currentTarget.style.borderColor = '#2E2E2E'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Date filter */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-auto pl-3 pr-9 py-2 text-sm rounded-xl outline-none cursor-pointer appearance-none font-semibold transition-all"
              style={{
                background: '#181818',
                border: '1px solid #2E2E2E',
                color: '#BDBDBD',
              }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#808080] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#808080]" />
          <p className="text-[#808080] mt-4 text-sm font-medium">Loading your archives…</p>
        </div>
      ) : filteredSummaries.length > 0 ? (
        <div className="glass-card overflow-hidden ">
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead className="sticky top-0 z-10" style={{ background: '#111111', borderBottom: '1px solid #2E2E2E' }}>
                <tr>
                  {['Document', 'Main Topic', 'Date', 'Actions'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-[10px] font-bold text-[#808080] uppercase tracking-widest ${i === 3 ? 'text-right' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ borderColor: '#1E1E1E' }}>
                {filteredSummaries.map((summary, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    key={summary.id}
                    className="group transition-colors"
                    style={{ borderBottom: '1px solid #1E1E1E' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#151515')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                          style={{ background: '#242424', border: '1px solid #3D3D3D' }}
                        >
                          <FileText className="w-4 h-4 text-[#808080]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#BDBDBD] text-sm">{summary.title}</p>
                          <p className="text-[10px] text-[#808080] uppercase tracking-wide mt-0.5">{summary.fileType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: 'rgba(34,197,94,0.1)',
                          color: '#22C55E',
                          border: '1px solid rgba(34,197,94,0.2)',
                        }}
                      >
                        {summary.mainTopic}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#808080]">
                      {formatDate(summary.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDetails(summary.id)}
                          className="p-2 rounded-lg transition-all text-[#808080] hover:text-white hover:bg-[#242424]"
                          aria-label="View summary"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(summary.id)}
                          className="p-2 rounded-lg transition-all text-[#808080] hover:text-[#EF4444] hover:bg-[#EF4444]/10"
                          aria-label="Delete summary"
                        >
                          <Trash2 className="w-4 h-4" />
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
        <div
          className="text-center py-20 rounded-3xl"
          style={{ border: '2px dashed #2E2E2E', background: '#0D0D0D' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: '#1A1A1A', border: '1px solid #2E2E2E' }}
          >
            <Search className="w-6 h-6 text-[#808080]" />
          </div>
          <h3 className="text-base font-bold text-white">No summaries found</h3>
          <p className="text-[#808080] text-sm mt-1">Try adjusting your search or create your first summary.</p>
        </div>
      )}

      <SummaryDetailModal isOpen={isModalOpen} summary={selectedSummary} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}