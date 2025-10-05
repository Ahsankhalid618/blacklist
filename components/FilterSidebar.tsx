'use client';

import { useState, useEffect } from 'react';
import { Filter, ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import { SearchFilters } from '../types/publication';

// First, ensure FilterOption interface enforces unique values
interface FilterOption {
  value: string;  // This should be unique
  label: string;
  count: number;
}

interface FilterSidebarProps {
  years: number[];
  topics: FilterOption[];
  organisms: FilterOption[];
  experimentTypes: FilterOption[];
  missions: FilterOption[];
  platforms: FilterOption[];
  activeFilters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
  className?: string;
}

export default function FilterSidebar({
  years,
  topics,
  organisms,
  experimentTypes,
  missions,
  platforms,
  activeFilters,
  onFilterChange,
  onClearFilters,
  className = ''
}: FilterSidebarProps) {
  // State for expanded filter sections
  const [expandedSections, setExpandedSections] = useState({
    years: true,
    topics: true,
    organisms: true,
    experimentTypes: false,
    missions: false,
    platforms: false
  });
  
  // Min and max years from the data
  const minYear = years.length > 0 ? Math.min(...years) : 1990;
  const maxYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear();
  
  // Local state for filters
  const [localFilters, setLocalFilters] = useState<SearchFilters>(activeFilters);
  
  // Update local filters when active filters change
  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);
  
  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };
  
  // Update year range
  const handleYearChange = (start: number, end: number) => {
    const newFilters = {
      ...localFilters,
      years: [start, end] as [number, number]
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // Toggle filter selection
  const toggleFilter = (filterType: 'topics' | 'organisms' | 'experimentTypes' | 'missions' | 'platforms', value: string) => {
    const currentValues = localFilters[filterType];
    let newValues: string[];
    
    if (currentValues.includes(value)) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    
    const newFilters = {
      ...localFilters,
      [filterType]: newValues
    };
    
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    onClearFilters();
  };
  
  // Filter section component
  const FilterSection = ({
    title,
    section,
    options,
    selectedValues,
    onToggle
  }: {
    title: string;
    section: keyof typeof expandedSections;
    options: FilterOption[];
    selectedValues: string[];
    onToggle: (value: string) => void;
  }) => (
    <div className="mb-6">
      <button
        className="flex items-center justify-between w-full text-left font-medium mb-2"
        onClick={() => toggleSection(section)}
      >
        <span>{title}</span>
        {expandedSections[section] ? (
          <ChevronUp size={18} />
        ) : (
          <ChevronDown size={18} />
        )}
      </button>
      
      {expandedSections[section] && (
        <div className="space-y-2 pl-1">
          {options.length === 0 ? (
            <p className="text-sm text-gray-400">No options available</p>
          ) : (
            options.slice(0, 10).map((option, index) => (
              <div 
                key={`${option.value}-${index}`} 
                className="flex items-center"
              >
                <button
                  className={`flex items-center justify-between w-full text-sm py-1 px-2 rounded hover:bg-white/5 ${
                    selectedValues.includes(option.value) ? 'text-blue-400' : 'text-gray-300'
                  }`}
                  onClick={() => onToggle(option.value)}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 mr-2 rounded border flex items-center justify-center ${
                      selectedValues.includes(option.value) 
                        ? 'border-blue-400 bg-blue-400/20' 
                        : 'border-gray-500'
                    }`}>
                      {selectedValues.includes(option.value) && (
                        <Check size={12} className="text-blue-400" />
                      )}
                    </div>
                    <span>{option.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">{option.count}</span>
                </button>
              </div>
            ))
          )}
          
          {options.length > 10 && (
            <button className="text-sm text-blue-400 hover:underline mt-1">
              Show more...
            </button>
          )}
        </div>
      )}
    </div>
  );
  
  return (
    <aside className={`glass-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold flex items-center">
          <Filter size={18} className="mr-2" />
          Filters
        </h2>
        
        <button
          onClick={handleClearFilters}
          className="text-sm text-gray-300 hover:text-white flex items-center"
        >
          <X size={14} className="mr-1" />
          Clear all
        </button>
      </div>
      
      {/* Year Range Filter */}
      <div className="mb-6">
        <button
          className="flex items-center justify-between w-full text-left font-medium mb-2"
          onClick={() => toggleSection('years')}
        >
          <span>Publication Year</span>
          {expandedSections.years ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>
        
        {expandedSections.years && (
          <div className="pl-1">
            <div className="flex justify-between mb-2">
              <span className="text-sm">{localFilters.years[0]}</span>
              <span className="text-sm">{localFilters.years[1]}</span>
            </div>
            
            <div className="relative h-2 bg-white/10 rounded-full mb-6">
              {/* This would be a proper range slider in a real implementation */}
              <div 
                className="absolute h-full bg-blue-500 rounded-full"
                style={{
                  left: `${((localFilters.years[0] - minYear) / (maxYear - minYear)) * 100}%`,
                  right: `${100 - ((localFilters.years[1] - minYear) / (maxYear - minYear)) * 100}%`
                }}
              ></div>
              <div
                className="absolute w-4 h-4 bg-blue-400 rounded-full -mt-1 cursor-pointer"
                style={{
                  left: `calc(${((localFilters.years[0] - minYear) / (maxYear - minYear)) * 100}% - 8px)`
                }}
              ></div>
              <div
                className="absolute w-4 h-4 bg-blue-400 rounded-full -mt-1 cursor-pointer"
                style={{
                  left: `calc(${((localFilters.years[1] - minYear) / (maxYear - minYear)) * 100}% - 8px)`
                }}
              ></div>
            </div>
            
            <div className="flex justify-between space-x-4">
              <div className="w-1/2">
                <label className="text-xs text-gray-400 block mb-1">From</label>
                <select
                  className="w-full bg-white/10 border border-white/20 rounded p-2 text-sm"
                  value={localFilters.years[0]}
                  onChange={(e) => handleYearChange(Number(e.target.value), localFilters.years[1])}
                >
                  {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="w-1/2">
                <label className="text-xs text-gray-400 block mb-1">To</label>
                <select
                  className="w-full bg-white/10 border border-white/20 rounded p-2 text-sm"
                  value={localFilters.years[1]}
                  onChange={(e) => handleYearChange(localFilters.years[0], Number(e.target.value))}
                >
                  {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Topics Filter */}
      <FilterSection
        title="Research Topics"
        section="topics"
        options={topics}
        selectedValues={localFilters.topics}
        onToggle={(value) => toggleFilter('topics', value)}
      />
      
      {/* Organisms Filter */}
      <FilterSection
        title="Organisms"
        section="organisms"
        options={organisms}
        selectedValues={localFilters.organisms}
        onToggle={(value) => toggleFilter('organisms', value)}
      />
      
      {/* Experiment Types Filter */}
      <FilterSection
        title="Experiment Types"
        section="experimentTypes"
        options={experimentTypes}
        selectedValues={localFilters.experimentTypes}
        onToggle={(value) => toggleFilter('experimentTypes', value)}
      />
      
      {/* Missions Filter */}
      <FilterSection
        title="Space Missions"
        section="missions"
        options={missions}
        selectedValues={localFilters.missions}
        onToggle={(value) => toggleFilter('missions', value)}
      />
      
      {/* Platforms Filter */}
      <FilterSection
        title="Platforms"
        section="platforms"
        options={platforms}
        selectedValues={localFilters.platforms}
        onToggle={(value) => toggleFilter('platforms', value)}
      />
    </aside>
  );
}
