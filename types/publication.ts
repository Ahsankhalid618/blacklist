/**
 * TypeScript interfaces for NASA Space Biology Publications
 */

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  year: number;
  doi: string;
  abstract: string;
  keywords: string[];
  journal: string;
  volume?: string;
  issue?: string;
  pages?: string;
  citations?: number;
  url?: string;
  pdfUrl?: string;
  topics: string[];
  organisms?: string[];
  experimentType?: string[];
  mission?: string;
  platform?: string;
}

export interface PublicationSummary {
  id: string;
  title: string;
  authors: string[];
  year: number;
  abstract: string;
  topics: string[];
  aiSummary?: AISummary;
}

export interface AISummary {
  oneLineSummary: string;
  keyFindings: string[];
  missionRelevance: string;
  gapAreas?: string[];
}

export interface SearchFilters {
  years: [number, number]; // [startYear, endYear]
  topics: string[];
  organisms: string[];
  experimentTypes: string[];
  missions: string[];
  platforms: string[];
}

export interface SearchResult {
  publication: Publication;
  score: number; // Relevance score
  highlights?: {
    title?: string;
    abstract?: string;
    keywords?: string[];
  };
}

export interface TopicDistribution {
  topic: string;
  count: number;
  publications: string[]; // Publication IDs
}

export interface YearlyStats {
  year: number;
  publicationCount: number;
  topTopics: { topic: string; count: number }[];
}

export interface ResearchGap {
  topic: string;
  severity: number; // 0-1 scale indicating how significant the gap is
  relatedTopics: string[];
  description: string;
}
