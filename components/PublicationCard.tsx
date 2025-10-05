'use client';

import { useState } from 'react';
import { BookOpen, Calendar, Users, Tag, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';
import { Publication } from '../types/publication';
import { formatAuthors, formatDOI } from '../lib/publicationUtils';

interface PublicationCardProps {
  publication: Publication;
  onViewDetails: (publication: Publication) => void;
  isBookmarked?: boolean;
  onBookmarkToggle?: (publication: Publication, isBookmarked: boolean) => void;
  showAbstract?: boolean;
  className?: string;
}

export default function PublicationCard({
  publication,
  onViewDetails,
  isBookmarked = false,
  onBookmarkToggle,
  showAbstract = true,
  className = ''
}: PublicationCardProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  
  // Handle bookmark toggle
  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newBookmarkedState = !bookmarked;
    setBookmarked(newBookmarkedState);
    
    if (onBookmarkToggle) {
      onBookmarkToggle(publication, newBookmarkedState);
    }
  };
  
  // Extract topics
  const extractTopics = (publication: Publication): string[] => {
    const text = [
      publication.title,
      publication.abstract,
      ...publication.sections.map(s => s.content)
    ].join(' ');
    
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to']);
    const words = text.toLowerCase()
      .split(/\W+/)
      .filter(word => 
        word.length > 3 && 
        !commonWords.has(word) &&
        !Number.isFinite(Number(word))
      );
      
    return Array.from(new Set(words)).slice(0, 4);
  };
  
  return (
    <div 
      className={`glass-card p-6 hover:bg-white/5 transition-all cursor-pointer ${className}`}
      onClick={() => onViewDetails(publication)}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold mb-2 flex-1">{publication.title}</h3>
        
        {onBookmarkToggle && (
          <button 
            onClick={handleBookmarkToggle}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {bookmarked ? (
              <BookmarkCheck size={20} className="text-blue-400" />
            ) : (
              <Bookmark size={20} className="text-gray-400" />
            )}
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-300">
        <div className="flex items-center">
          <Users size={14} className="mr-1" />
          <span>{formatAuthors(publication.authors)}</span>
        </div>
        
        <div className="flex items-center">
          <Calendar size={14} className="mr-1" />
          <span>{publication.publicationDate}</span>
        </div>
        
        {publication.journal && (
          <div className="flex items-center">
            <BookOpen size={14} className="mr-1" />
            <span>{publication.journal}</span>
          </div>
        )}
      </div>
      
      {showAbstract && (
        <p className="text-gray-300 mb-4 line-clamp-3">
          {publication.abstract}
        </p>
      )}
      
      <div className="flex flex-wrap gap-2 mb-4">
        {extractTopics(publication).map((topic, index) => (
          <span 
            key={`${topic}-${index}`}
            className="inline-flex items-center bg-blue-500/10 text-blue-300 rounded-full px-2 py-1 text-xs"
          >
            {topic}
          </span>
        ))}
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <button 
          className="text-blue-400 text-sm font-medium hover:underline flex items-center"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(publication);
          }}
        >
          Read more
        </button>
        
        {publication.doi && (
          <a
            href={formatDOI(publication.doi)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white flex items-center text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={14} className="mr-1" />
            View original
          </a>
        )}
      </div>
    </div>
  );
}
