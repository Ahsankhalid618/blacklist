'use client';

import { useEffect, useRef, useState } from 'react';
import { Publication } from '../../types/publication';

interface NetworkGraphProps {
  publications: Publication[];
  className?: string;
  onNodeClick?: (publication: Publication) => void;
}

export default function NetworkGraph({ 
  publications, 
  className = '',
  onNodeClick 
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  useEffect(() => {
    if (!containerRef.current || publications.length === 0) return;
    
    // In a real implementation, we would use D3.js or a similar library
    // to create a force-directed graph visualization
    // For this demo, we'll just show a placeholder
    
    setMessage(
      "This component would render an interactive network graph showing relationships " +
      "between publications based on shared topics, authors, or citations. " +
      "The implementation would use D3.js force-directed graph."
    );
    
    // Cleanup function
    return () => {
      // Cleanup D3 elements if needed
    };
  }, [publications]);
  
  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Publication Network Graph</h3>
        <p className="text-sm text-gray-400">
          Visualizes connections between publications based on shared topics and citations.
        </p>
      </div>
      
      <div 
        ref={containerRef} 
        className="h-80 flex items-center justify-center border border-dashed border-gray-700 rounded-lg"
      >
        {message ? (
          <div className="text-center p-6 max-w-md">
            <p className="text-gray-400">{message}</p>
            <p className="mt-4 text-sm text-blue-400">
              Note: This is a placeholder. The actual implementation would require D3.js integration.
            </p>
          </div>
        ) : (
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        )}
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
            <span className="text-sm">Publications</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span className="text-sm">Topics</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-400">
          {publications.length} publications in dataset
        </div>
      </div>
    </div>
  );
}
