import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Use require for libraries that don't support ESM default exports
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

import { AppError } from '../middlewears/error.middleware.js';

/**
 * FileService
 * Handles text extraction from different file buffers (PDF, DOCX, TXT)
 */
export class FileService {
  /**
   * Extracts text from various file buffers based on MIME type
   */
  static async extractText(buffer: Buffer, mimetype: string): Promise<string> {
    try {
      // 1. Handle PDF
      if (mimetype === 'application/pdf') {
        const parser = new pdf.PDFParse({ data: buffer });
        const data = await parser.getText();
        return data.text;
      } 
      
      // 2. Handle DOCX
      if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const data = await mammoth.extractRawText({ buffer });
        return data.value;
      }

      // 3. Handle Plain Text
      if (mimetype === 'text/plain' || mimetype.startsWith('text/')) {
        return buffer.toString('utf-8');
      }

      throw new AppError(400, 'Unsupported file format. Please upload PDF, DOCX, or TXT.');
    } catch (error: any) {
      console.error('File Extraction Error:', error);
      throw new AppError(500, `Failed to extract text: ${error.message}`);
    }
  }
}