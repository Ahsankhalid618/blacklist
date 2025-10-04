'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { debounce } from '../lib/utils';
import { Publication } from '../types/publication';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterSelect?: (filter: string, value: string) => void;
  onFilterRemove?: (filter: string, value: string) => void;
  suggestions?: string[];
  recentSearches?: string[];
  activeFilters?: { [key: string]: string[] };
  isLoading?: boolean;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  onFilterSelect,
  onFilterRemove,
  suggestions = [],
  recentSearches = [],
  activeFilters = {},
  isLoading = false,
  placeholder = 'Search publications, topics, or authors...'
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Debounced search function
  const debouncedSearch = useRef(
    debounce((searchQuery: string) => {
      onSearch(searchQuery);
    }, 300)
  ).current;
  
  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
    
    if (value.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };
  
  // Handle filter removal
  const handleFilterRemove = (filter: string, value: string) => {
    if (onFilterRemove) {
      onFilterRemove(filter, value);
    }
  };
  
  // Clear search
  const handleClearSearch = () => {
    setQuery('');
    onSearch('');
    setShowSuggestions(false);
  };
  
  // Get all active filter pills
  const getActiveFilterPills = () => {
    const pills = [];
    
    for (const [filter, values] of Object.entries(activeFilters)) {
      for (const value of values) {
        pills.push(
          <div 
            key={`${filter}-${value}`}
            className="inline-flex items-center bg-blue-500/20 text-blue-300 rounded-full px-3 py-1 text-sm mr-2 mb-2"
          >
            <span className="mr-1 text-xs text-gray-300">{filter}:</span>
            {value}
            <button 
              onClick={() => handleFilterRemove(filter, value)}
              className="ml-2 rounded-full hover:bg-blue-400/20 p-1"
              aria-label={`Remove ${filter} filter: ${value}`}
            >
              <X size={12} />
            </button>
          </div>
        );
      }
    }
    
    return pills;
  };

  return (
    <div className="w-full" ref={searchRef}>
      {/* Search input */}
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              setIsFocused(true);
              if (query.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={placeholder}
            className="w-full py-3 px-5 pl-12 rounded-full bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <Search 
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${isFocused ? 'text-blue-400' : 'text-gray-400'}`} 
            size={18} 
          />
          
          {query.length > 0 && (
            <button
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-14 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-400"></div>
          </div>
        )}
        
        {/* Suggestions dropdown */}
        {showSuggestions && (query.length > 0 || recentSearches.length > 0) && (
          <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-white/10 rounded-lg shadow-lg overflow-hidden">
            {query.length > 0 && suggestions.length > 0 && (
              <div className="p-2">
                <div className="text-xs text-gray-400 px-3 py-1">Suggestions</div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-white/10 cursor-pointer rounded-md"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-center">
                      <Search size={14} className="text-gray-400 mr-2" />
                      <span>{suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {recentSearches.length > 0 && (
              <div className="p-2 border-t border-white/10">
                <div className="text-xs text-gray-400 px-3 py-1">Recent Searches</div>
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-white/10 cursor-pointer rounded-md flex items-center justify-between"
                    onClick={() => handleSuggestionClick(search)}
                  >
                    <div className="flex items-center">
                      <Search size={14} className="text-gray-400 mr-2" />
                      <span>{search}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Remove from recent searches logic would go here
                      }}
                      className="text-gray-400 hover:text-white"
                      aria-label="Remove from recent searches"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Active filters */}
      <div className="mt-3 flex flex-wrap">
        {getActiveFilterPills()}
      </div>
    </div>
  );
}
