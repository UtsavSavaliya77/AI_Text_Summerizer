"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, FileUp, Sparkles, Layers, Loader2 } from 'lucide-react';
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
    defaultValues: { summaryType: 'short', content: '', title: '' },
  });

  const selectedType = watch('summaryType');

  const onSubmit = async (data: SummaryFormValues) => {
    setLoading(true);
    try {
      await apiClient.post('/summaries', { title: data.title, content: data.content, fileType });
      router.push('/dashboard/history');
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header + Tab Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">New Summary</h1>
          <p className="text-[#808080] mt-1 text-sm">Transform long content into actionable insights.</p>
        </div>

        {/* Tab toggle */}
        <div
          className="flex p-1 rounded-xl"
          style={{ background: '#111111', border: '1px solid #2E2E2E' }}
        >
          {(['paste', 'upload'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setFileType('text');
                setValue('content', '');
                setValue('title', '');
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab
                  ? 'bg-[#242424] text-white shadow-sm'
                  : 'text-[#808080] hover:text-[#BDBDBD]'
              )}
            >
              {tab === 'paste' ? <Type className="w-4 h-4" /> : <FileUp className="w-4 h-4" />}
              {tab === 'paste' ? 'Paste Text' : 'Upload File'}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Input */}
        <div className="lg:col-span-3">
          <div className="glass-card p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#BDBDBD] uppercase tracking-wider mb-2">
                Document Title
              </label>
              <input
                {...register('title')}
                placeholder="e.g., Annual Research Report 2024"
                className="input-dark"
              />
              {errors.title && <p className="text-[#EF4444] text-xs mt-1">{errors.title.message}</p>}
            </div>

            {/* Content tabs */}
            <AnimatePresence mode="wait">
              {activeTab === 'paste' ? (
                <motion.div key="paste" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <label className="block text-xs font-bold text-[#BDBDBD] uppercase tracking-wider mb-2">
                    Content
                  </label>
                  <textarea
                    {...register('content')}
                    placeholder="Paste your text here (min 50 characters)…"
                    className="input-dark h-60 resize-none"
                    style={{ borderRadius: 12 }}
                  />
                  {errors.content && <p className="text-[#EF4444] text-xs mt-1">{errors.content.message}</p>}
                </motion.div>
              ) : (
                <motion.div key="upload" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
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
                  {errors.content && <p className="text-[#EF4444] text-xs mt-1">{errors.content.message}</p>}
                </motion.div>
              )}
            </AnimatePresence>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 rounded-xl text-sm font-bold justify-center disabled:opacity-50"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                  : <>Generate Summary <Sparkles className="w-4 h-4" /></>
                }
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}