"use client";

import React from 'react';
import { 
  X, 
  FileText, 
  Clock, 
  Hash, 
  Download, 
  MessageSquare,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Summary } from '../../types/summary';
import { formatDate } from '../../lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { jsPDF } from 'jspdf';
import { useRouter } from 'next/navigation';

interface SummaryDetailModalProps {
  summary: Summary | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SummaryDetailModal({ summary, isOpen, onClose }: SummaryDetailModalProps) {
  const router = useRouter();

  if (!summary) return null;

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(summary.title, 20, 25);
    
    // Metadata
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const dateStr = formatDate(summary.createdAt);
    doc.text(`${dateStr} • Topic: ${summary.mainTopic}`, 20, 33);
    
    // Divider Line
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 38, 190, 38);
    
    let y = 48;
    
    // Insights Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("INSIGHTS & METRICS", 20, y);
    y += 8;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Reading Time: ${summary.readingTime} min`, 20, y);
    doc.text(`Word Count: ${summary.wordCount.toLocaleString()}`, 80, y);
    doc.text(`Character Count: ${summary.charCount.toLocaleString()}`, 140, y);
    y += 12;
    
    // Keywords
    if (summary.keywords && summary.keywords.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text("Keywords:", 20, y);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      const kwStr = summary.keywords.map(k => `#${k}`).join(", ");
      
      const kwLines = doc.splitTextToSize(kwStr, 140);
      doc.text(kwLines, 45, y);
      y += (kwLines.length * 5) + 8;
    } else {
      y += 4;
    }
    
    // One-Line Takeaway
    doc.setFillColor(239, 246, 255);
    doc.rect(20, y, 170, 16, "F");
    doc.setDrawColor(191, 219, 254);
    doc.rect(20, y, 170, 16, "S");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    doc.text("ONE-LINE TAKEAWAY:", 24, y + 6);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    const takeawayText = `"${summary.summaryOneLine}"`;
    const wrappedTakeaway = doc.splitTextToSize(takeawayText, 160);
    doc.text(wrappedTakeaway, 24, y + 11);
    y += 26;
    
    // Executive Summary
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("EXECUTIVE SUMMARY", 20, y);
    y += 7;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    const wrappedExec = doc.splitTextToSize(summary.summaryExecutive, 170);
    doc.text(wrappedExec, 20, y);
    y += (wrappedExec.length * 5) + 12;
    
    // Bullet Points
    if (summary.summaryBullet) {
      if (y > 240) {
        doc.addPage();
        y = 25;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text("KEY TAKEAWAYS", 20, y);
      y += 7;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      const wrappedBullets = doc.splitTextToSize(summary.summaryBullet, 170);
      doc.text(wrappedBullets, 20, y);
      y += (wrappedBullets.length * 5) + 12;
    }
    
    // Detailed Summary
    if (summary.summaryDetailed) {
      if (y > 220) {
        doc.addPage();
        y = 25;
      } else {
        y += 4;
      }
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text("DETAILED ANALYSIS", 20, y);
      y += 7;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      
      const wrappedDetailed = doc.splitTextToSize(summary.summaryDetailed, 170);
      
      let lineIndex = 0;
      while (lineIndex < wrappedDetailed.length) {
        const linesLeftOnPage = Math.floor((270 - y) / 5);
        if (linesLeftOnPage <= 0) {
          doc.addPage();
          y = 25;
          continue;
        }
        const linesToWrite = wrappedDetailed.slice(lineIndex, lineIndex + linesLeftOnPage);
        doc.text(linesToWrite, 20, y);
        y += linesToWrite.length * 5;
        lineIndex += linesToWrite.length;
      }
    }
    
    // Footer / Page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: "center" });
      doc.text("AI Text Summarizer Hub", 20, 287);
    }
    
    const fileName = `${summary.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-summary.pdf`;
    doc.save(fileName);
  };

  const handleAskQuestions = () => {
    router.push(`/dashboard/chat?summaryId=${summary.id}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">{summary.title}</h2>
                  <p className="text-sm text-slate-500">{formatDate(summary.createdAt)} • {summary.mainTopic}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Summaries */}
                <div className="lg:col-span-2 space-y-6">
                  <Tabs defaultValue="short" className="w-full">
                    <TabsList className="bg-slate-100 p-1 rounded-xl mb-6">
                      <TabsTrigger value="short" className="rounded-lg text-xs">Short</TabsTrigger>
                      <TabsTrigger value="detailed" className="rounded-lg text-xs">Detailed</TabsTrigger>
                      <TabsTrigger value="executive" className="rounded-lg text-xs">Executive</TabsTrigger>
                      <TabsTrigger value="bullet" className="rounded-lg text-xs">Bullets</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="short" className="prose prose-slate max-w-none">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{summary.summaryShort}</p>
                    </TabsContent>
                    <TabsContent value="detailed" className="prose prose-slate max-w-none">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{summary.summaryDetailed}</p>
                    </TabsContent>
                    <TabsContent value="executive" className="prose prose-slate max-w-none">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{summary.summaryExecutive}</p>
                    </TabsContent>
                    <TabsContent value="bullet" className="prose prose-slate max-w-none">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{summary.summaryBullet}</p>
                    </TabsContent>
                  </Tabs>

                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> One-Line Takeaway
                    </h4>
                    <p className="text-sm text-blue-800 italic">"{summary.summaryOneLine}"</p>
                  </div>
                </div>

                {/* Sidebar Insights */}
                <div className="space-y-6">
                  <div className="glass-card p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Insights</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <Clock className="w-4 h-4" /> Reading Time
                        </div>
                        <span className="font-semibold text-slate-900 text-sm">{summary.readingTime} min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <Hash className="w-4 h-4" /> Words
                        </div>
                        <span className="font-semibold text-slate-900 text-sm">{summary.wordCount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {summary.keywords.map((kw, idx) => (
                        <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <button 
                      onClick={handleExportPDF}
                      className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-black transition-all"
                    >
                      <Download className="w-4 h-4" /> Export as PDF
                    </button>
                    <button 
                      onClick={handleAskQuestions}
                      className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
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