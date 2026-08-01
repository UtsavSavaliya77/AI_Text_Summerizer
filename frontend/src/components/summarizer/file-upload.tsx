"use client";

import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FileUploadProps {
  onFileSelect: (text: string, fileName: string, fileType: string) => void;
  onClear: () => void;
}

export function FileUpload({ onFileSelect, onClear }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (selectedFile: File) => {
    const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Invalid file type. Please upload TXT, PDF, or DOCX.");
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
        "border-2 border-dashed rounded-2xl p-8 transition-all duration-200 flex flex-col items-center justify-center min-h-[360px]",
        isDragging ? "border-primary bg-primary/5" : "border-slate-200 bg-slate-50/50",
        file ? "border-emerald-500 bg-emerald-50/30" : ""
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFile(droppedFile);
      }}
    >
      {!file ? (
        <>
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Upload your document</h3>
          <p className="text-sm text-slate-500 mt-1 text-center">
            Drag and drop your PDF, DOCX or TXT file here <br />
            <span className="text-xs">(Max size: 10MB)</span>
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
            className="mt-6 px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            Select File
          </label>
        </>
      ) : (
        <div className="w-full flex items-center justify-between bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button 
            onClick={() => { setFile(null); onClear(); }}
            className="p-2 hover:bg-red-50 rounded-lg group transition-colors"
          >
            <X className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
}