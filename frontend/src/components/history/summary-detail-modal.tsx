"use client";

import React from 'react';
import {
  X, FileText, Clock, Hash, Download, MessageSquare, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Summary } from '../../types/summary';
import { formatDate } from '../../lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { jsPDF } from 'jspdf';
import { useRouter } from 'next/navigation';

interface SummaryDetailModalProps {
  summary: Summary | null;
  isOpen:  boolean;
  onClose: () => void;
}

export function SummaryDetailModal({ summary, isOpen, onClose }: SummaryDetailModalProps) {
  const router = useRouter();
  if (!summary) return null;

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(summary.title, 20, 25);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`${formatDate(summary.createdAt)} • Topic: ${summary.mainTopic}`, 20, 33);

    doc.setDrawColor(220, 220, 220);
    doc.line(20, 38, 190, 38);

    let y = 48;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('INSIGHTS & METRICS', 20, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Reading Time: ${summary.readingTime} min`, 20, y);
    doc.text(`Word Count: ${summary.wordCount.toLocaleString()}`, 80, y);
    doc.text(`Character Count: ${summary.charCount.toLocaleString()}`, 140, y);
    y += 12;

    if (summary.keywords && summary.keywords.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('Keywords:', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const kwStr   = summary.keywords.map(k => `#${k}`).join(', ');
      const kwLines = doc.splitTextToSize(kwStr, 140);
      doc.text(kwLines, 45, y);
      y += (kwLines.length * 5) + 8;
    } else { y += 4; }

    doc.setFillColor(30, 30, 30);
    doc.rect(20, y, 170, 16, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(220, 220, 220);
    doc.text('ONE-LINE TAKEAWAY:', 24, y + 6);
    doc.setFont('helvetica', 'italic');
    const takeawayText   = `"${summary.summaryOneLine}"`;
    const wrappedTakeaway = doc.splitTextToSize(takeawayText, 160);
    doc.text(wrappedTakeaway, 24, y + 11);
    y += 26;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('EXECUTIVE SUMMARY', 20, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    const wrappedExec = doc.splitTextToSize(summary.summaryExecutive, 170);
    doc.text(wrappedExec, 20, y);
    y += (wrappedExec.length * 5) + 12;

    if (summary.summaryBullet) {
      if (y > 240) { doc.addPage(); y = 25; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text('KEY TAKEAWAYS', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      const wrappedBullets = doc.splitTextToSize(summary.summaryBullet, 170);
      doc.text(wrappedBullets, 20, y);
      y += (wrappedBullets.length * 5) + 12;
    }

    if (summary.summaryDetailed) {
      if (y > 220) { doc.addPage(); y = 25; } else { y += 4; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text('DETAILED ANALYSIS', 20, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      const wrappedDetailed = doc.splitTextToSize(summary.summaryDetailed, 170);
      let lineIndex = 0;
      while (lineIndex < wrappedDetailed.length) {
        const linesLeft = Math.floor((270 - y) / 5);
        if (linesLeft <= 0) { doc.addPage(); y = 25; continue; }
        const linesToWrite = wrappedDetailed.slice(lineIndex, lineIndex + linesLeft);
        doc.text(linesToWrite, 20, y);
        y += linesToWrite.length * 5;
        lineIndex += linesToWrite.length;
      }
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
      doc.text('AI Text Summarizer Hub', 20, 287);
    }

    const fileName = `${summary.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-summary.pdf`;
    doc.save(fileName);
  };

  const handleAskQuestions = () => router.push(`/dashboard/chat?summaryId=${summary.id}`);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-4xl max-h-[100vh] flex flex-col rounded-3xl overflow-hidden"
            style={{ background: '#141414', border: '1px solid #3D3D3D', boxShadow: '0 32px 96px rgba(0,0,0,0.8)' }}
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid #2E2E2E' }}>
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: '#242424', border: '1px solid #3D3D3D' }}
                >
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">{summary.title}</h2>
                  <p className="text-xs text-[#808080] mt-0.5">{formatDate(summary.createdAt)} · {summary.mainTopic}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full transition-colors text-[#808080] hover:text-white hover:bg-[#242424]"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Summaries */}
                <div className="lg:col-span-2 space-y-5">
                  <Tabs defaultValue="short" className="w-full">
                    <TabsList className="mb-5">
                      <TabsTrigger value="short">Short</TabsTrigger>
                      <TabsTrigger value="detailed">Detailed</TabsTrigger>
                      <TabsTrigger value="executive">Executive</TabsTrigger>
                      <TabsTrigger value="bullet">Bullets</TabsTrigger>
                    </TabsList>
                    <TabsContent value="short">
                      <p className="text-[#BDBDBD] leading-relaxed text-sm whitespace-pre-wrap">{summary.summaryShort}</p>
                    </TabsContent>
                    <TabsContent value="detailed">
                      <p className="text-[#BDBDBD] leading-relaxed text-sm whitespace-pre-wrap">{summary.summaryDetailed}</p>
                    </TabsContent>
                    <TabsContent value="executive">
                      <p className="text-[#BDBDBD] leading-relaxed text-sm whitespace-pre-wrap">{summary.summaryExecutive}</p>
                    </TabsContent>
                    <TabsContent value="bullet">
                      <p className="text-[#BDBDBD] leading-relaxed text-sm whitespace-pre-wrap">{summary.summaryBullet}</p>
                    </TabsContent>
                  </Tabs>

                  {/* One-liner */}
                  <div
                    className="p-4 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #3D3D3D' }}
                  >
                    <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> One-Line Takeaway
                    </h4>
                    <p className="text-sm text-[#BDBDBD] italic">"{summary.summaryOneLine}"</p>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                  {/* Keywords */}
                  <div className="glass-card p-5">
                    <h4 className="font-bold text-[#808080] text-[10px] uppercase tracking-widest mb-3">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {summary.keywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: '#242424', color: '#BDBDBD', border: '1px solid #3D3D3D' }}
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={handleExportPDF}
                      className="btn-primary w-full py-3 rounded-xl text-sm justify-center"
                    >
                      <Download className="w-4 h-4" /> Export as PDF
                    </button>
                    <button
                      onClick={handleAskQuestions}
                      className="btn-secondary w-full py-3 rounded-xl text-sm justify-center"
                    >
                      <MessageSquare className="w-4 h-4" /> Ask Questions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}