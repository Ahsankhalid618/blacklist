'use client';

import { useState, useEffect } from 'react';
import { RefreshCcw, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { AISummary as AISummaryType } from '../types/publication';
import { generateSummary } from '../lib/aiService';

interface AISummaryProps {
  abstract: string;
  initialSummary?: AISummaryType;
  className?: string;
  onSummaryGenerated?: (summary: AISummaryType) => void;
}

export default function AISummary({
  abstract,
  initialSummary,
  className = '',
  onSummaryGenerated
}: AISummaryProps) {
  const [summary, setSummary] = useState<AISummaryType | null>(initialSummary || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Generate summary if not provided
  useEffect(() => {
    if (!initialSummary && abstract) {
      generateSummaryForAbstract();
    }
  }, [abstract, initialSummary]);
  
  // Generate summary for the abstract
  const generateSummaryForAbstract = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newSummary = await generateSummary(abstract);
      setSummary(newSummary);
      
      if (onSummaryGenerated) {
        onSummaryGenerated(newSummary);
      }
    } catch (err) {
      console.error('Error generating summary:', err);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Regenerate summary
  const handleRegenerate = () => {
    generateSummaryForAbstract();
  };
  
  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Sparkles size={20} className="text-blue-400 mr-2" />
          <h3 className="text-xl font-bold">AI Summary</h3>
        </div>
        
        <button
          onClick={handleRegenerate}
          disabled={isLoading}
          className="flex items-center text-sm px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
        >
          <RefreshCcw size={14} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Generating...' : 'Regenerate'}
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Analyzing abstract with AI...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-start">
          <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Error generating summary</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={handleRegenerate}
              className="text-sm text-red-300 hover:text-red-200 mt-2 underline"
            >
              Try again
            </button>
          </div>
        </div>
      ) : summary ? (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">One-Line Summary</h4>
            <p className="text-lg">{summary.oneLineSummary}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Key Findings</h4>
            <ul className="space-y-2">
              {summary.keyFindings.map((finding, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex-shrink-0 flex items-center justify-center mr-2 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Mission Relevance</h4>
            <p>{summary.missionRelevance}</p>
          </div>
          
          {summary.gapAreas && summary.gapAreas.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Research Gap Areas</h4>
              <ul className="space-y-2">
                {summary.gapAreas.map((gap, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex-shrink-0 flex items-center justify-center mr-2 mt-0.5">
                      !
                    </span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center text-green-400 text-sm">
              <CheckCircle size={16} className="mr-1" />
              AI summary generated
            </div>
            
            <p className="text-xs text-gray-500">
              This is an AI-generated summary and may contain inaccuracies.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          No summary available
        </div>
      )}
    </div>
  );
}
