"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type,
  FileUp,
  Sparkles,
  Layers,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { summarySchema, SummaryFormValues } from '../../../../schemas/summary.schema';
import { FileUpload } from '../../../../components/summarizer/file-upload';
import { cn } from '../../../../lib/utils';
import { useRouter } from 'next/navigation';
import apiClient from '../../../../lib/api-client';

const SUMMARY_TYPES = [
  { id: 'one-line', label: 'One Line', desc: 'A quick single sentence' },
  { id: 'short', label: 'Short', desc: 'Roughly 100 words' },
  { id: 'detailed', label: 'Detailed', desc: 'In-depth analysis' },
  { id: 'executive', label: 'Executive', desc: 'High-level business summary' },
  { id: 'bullet', label: 'Bullets', desc: 'Key points in a list' },
];

export default function SummarizePage() {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [fileType, setFileType] = useState<string>('text');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SummaryFormValues>({
    resolver: zodResolver(summarySchema),
    defaultValues: {
      summaryType: 'short',
      content: '',
      title: ''
    }
  });

  const selectedType = watch('summaryType');

  const onSubmit = async (data: SummaryFormValues) => {
    setLoading(true);
    try {
      await apiClient.post('/summaries', {
        title: data.title,
        content: data.content,
        fileType: fileType
      });
      router.push('/dashboard/history');
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to generate summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">New Summary</h1>
          <p className="text-slate-500 mt-1">Transform long content into actionable insights.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('paste');
              setFileType('text');
              setValue('content', '');
              setValue('title', '');
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === 'paste' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Type className="w-4 h-4" /> Paste Text
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              setFileType('text');
              setValue('content', '');
              setValue('title', '');
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === 'upload' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <FileUp className="w-4 h-4" /> Upload File
          </button>
        </div>
      </div>


      <div className="p-4 bg-slate-900 rounded-2xl text-white relative overflow-hidden">
        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Pro Tip</p>
        <p className="text-sm text-slate-300 leading-relaxed">
          Use "Executive" mode for complex business documents to get high-level strategic takeaways.
        </p>
        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Input Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 rounded-2xl">
            <div className="mb-4">
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Document Title</label>
              <input
                {...register('title')}
                placeholder="e.g., Annual Research Report 2024"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'paste' ? (
                <motion.div
                  key="paste"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Content</label>
                  <textarea
                    {...register('content')}
                    placeholder="Paste your text here (min 50 characters)..."
                    className="w-full h-80 px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  />
                  {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <FileUpload
                    onFileSelect={(text, name, type) => {
                      setValue('content', text);
                      setValue('title', name);
                      setFileType(type);
                    }}
                    onClear={() => {
                      setValue('content', '');
                      setValue('title', '');
                      setFileType('text');
                    }}
                  />
                  {errors.content && <p className="text-red-500 text-xs mt-2">{errors.content.message}</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Configuration Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-slate-900">Summary Type</h2>
            </div>

            <div className="space-y-2">
              {SUMMARY_TYPES.map((type) => (
                <label
                  key={type.id}
                  className={cn(
                    "flex flex-col p-3 rounded-xl border-2 cursor-pointer transition-all",
                    selectedType === type.id
                      ? "border-primary bg-blue-50/50"
                      : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <input
                    type="radio"
                    value={type.id}
                    {...register('summaryType')}
                    className="hidden"
                  />
                  <span className="font-semibold text-sm text-slate-900">{type.label}</span>
                  <span className="text-xs text-slate-500">{type.desc}</span>
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Generate Summary <Sparkles className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}