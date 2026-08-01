export interface Summary {
  id: string;
  userId: string;
  title: string;
  originalContent: string;
  summaryOneLine: string;
  summaryShort: string;
  summaryDetailed: string;
  summaryExecutive: string;
  summaryBullet: string;
  keywords: string[];
  mainTopic: string;
  readingTime: number;
  wordCount: number;
  charCount: number;
  fileType: string;
  createdAt: string;
}

export type SummaryListItem = Pick<Summary, 'id' | 'title' | 'mainTopic' | 'createdAt' | 'wordCount' | 'fileType'>;