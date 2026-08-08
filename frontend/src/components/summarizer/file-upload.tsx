"use client";

import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FileUploadProps {
  onFileSelect: (text: string, fileName: string, fileType: string) => void;
  onClear:      () => void;
}

export function FileUpload({ onFileSelect, onClear }: FileUploadProps) {
  const [file,       setFile]       = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (selectedFile: File) => {
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Invalid file type. Please upload TXT, PDF, or DOCX.');
      return;
    }
    setFile(selectedFile);
    if (selectedFile.type === 'text/plain') {
      const text = await selectedFile.text();
      onFileSelect(text, selectedFile.name, 'text');
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        onFileSelect(base64String, selectedFile.name, selectedFile.type);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-2xl p-8 transition-all duration-200 flex flex-col items-center justify-center min-h-[360px]',
        isDragging
          ? 'border-white/40 bg-white/[0.03]'
          : file
            ? 'border-[#22C55E]/40 bg-[#22C55E]/[0.03]'
            : 'border-[#2E2E2E] bg-[#0D0D0D]'
      )}
      onDragOver={(e)  => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={()  => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFile(droppedFile);
      }}
    >
      {!file ? (
        <>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: '#1A1A1A', border: '1px solid #3D3D3D' }}
          >
            <Upload className="w-7 h-7 text-[#808080]" />
          </div>
          <h3 className="text-base font-semibold text-white">Upload your document</h3>
          <p className="text-sm text-[#808080] mt-2 text-center leading-relaxed">
            Drag and drop your PDF, DOCX or TXT file here
            <br />
            <span className="text-xs text-[#808080]">(Max size: 10MB)</span>
          </p>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.docx,.txt"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <label
            htmlFor="file-upload"
            className="mt-6 px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all btn-secondary"
          >
            Select File
          </label>
        </>
      ) : (
        <div
          className="w-full flex items-center justify-between p-4 rounded-xl"
          style={{ background: '#1A1A1A', border: '1px solid #22C55E33' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
            >
              <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{file.name}</p>
              <p className="text-xs text-[#808080]">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button
            onClick={() => { setFile(null); onClear(); }}
            className="p-2 rounded-lg transition-colors text-[#808080] hover:text-[#EF4444] hover:bg-[#EF4444]/10"
            aria-label="Clear file"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}