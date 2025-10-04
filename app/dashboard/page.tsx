'use client';

import { useState, useEffect } from 'react';
import { Grid, List, SlidersHorizontal, Filter, ArrowDownAZ, ArrowUpZA, Calendar, TrendingUp } from 'lucide-react';
import { Publication, SearchFilters } from '../../types/publication';
import { parsePublicationsCSV, getPublicationSummaries, createSearchIndex } from '../../lib/dataProcessor';
import { filterPublications, getFilterOptions, searchPublications } from '../../lib/utils';
import SearchBar from '../../components/SearchBar';
import PublicationCard from '../../components/PublicationCard';
import FilterSidebar from '../../components/FilterSidebar';
import PublicationModal from '../../components/PublicationModal';
import StatCard from '../../components/StatCard';

// Default filters
const defaultFilters: SearchFilters = {
  years: [1990, new Date().getFullYear()],
  topics: [],
  organisms: [],
  experimentTypes: [],
  missions: [],
  platforms: []
};

export default function DashboardPage() {
  // State for publications data
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState<Map<string, number[]> | null>(null);
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [filterOptions, setFilterOptions] = useState<any>({
    years: [],
    topics: [],
    organisms: [],
    experimentTypes: [],
    missions: [],
    platforms: []
  });
  
  // State for view options
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOption, setSortOption] = useState<'relevance' | 'year-desc' | 'year-asc' | 'citations'>('year-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // State for selected publication
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for bookmarks
  const [bookmarkedPubs, setBookmarkedPubs] = useState<string[]>([]);
  
  // Load publications data
  useEffect(() => {
    async function loadPublications() {
      try {
        setIsLoading(true);
        
        // In a real application, we would fetch the CSV from the server
        // For this demo, we'll simulate loading the data
        const response = await fetch('/api/publications');
        const csvData = await response.text();
        
        // Parse CSV data
        const pubs = await parsePublicationsCSV(csvData);
        setPublications(pubs);
        setFilteredPublications(pubs);
        
        // Create search index
        const index = createSearchIndex(pubs);
        setSearchIndex(index);
        
        // Get filter options
        const options = getFilterOptions(pubs);
        setFilterOptions({
          years: options.years,
          topics: options.topics.map(t => ({ label: t, value: t, count: pubs.filter(p => p.topics.includes(t)).length })),
          organisms: options.organisms.map(o => ({ label: o, value: o, count: pubs.filter(p => p.organisms?.includes(o) || false).length })),
          experimentTypes: options.experimentTypes.map(e => ({ label: e, value: e, count: pubs.filter(p => p.experimentType?.includes(e) || false).length })),
          missions: options.missions.map(m => ({ label: m, value: m, count: pubs.filter(p => p.mission === m).length })),
          platforms: options.platforms.map(p => ({ label: p, value: p, count: pubs.filter(pub => pub.platform === p).length }))
        });
        
        // Update year range in filters
        if (options.years.length > 0) {
          setFilters(prev => ({
            ...prev,
            years: [Math.min(...options.years), Math.max(...options.years)]
          }));
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading publications:', err);
        setError('Failed to load publications data. Please try again later.');
        setIsLoading(false);
      }
    }
    
    // In a real app, we would load the actual data
    // For this demo, we'll simulate the publications
    const simulatePublications = async () => {
      setIsLoading(true);
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        // Use the sample data we created earlier
        const response = await fetch('/data/publications.csv');
        const csvData = await response.text();
        
        // Parse CSV data
        const pubs = await parsePublicationsCSV(csvData);
        setPublications(pubs);
        setFilteredPublications(pubs);
        
        // Create search index
        const index = createSearchIndex(pubs);
        setSearchIndex(index);
        
        // Get filter options
        const options = getFilterOptions(pubs);
        setFilterOptions({
          years: options.years,
          topics: options.topics.map(t => ({ label: t, value: t, count: pubs.filter(p => p.topics.includes(t)).length })),
          organisms: options.organisms.map(o => ({ label: o, value: o, count: pubs.filter(p => p.organisms?.includes(o) || false).length })),
          experimentTypes: options.experimentTypes.map(e => ({ label: e, value: e, count: pubs.filter(p => p.experimentType?.includes(e) || false).length })),
          missions: options.missions.map(m => ({ label: m, value: m, count: pubs.filter(p => p.mission === m).length })),
          platforms: options.platforms.map(p => ({ label: p, value: p, count: pubs.filter(pub => pub.platform === p).length }))
        });
        
        // Update year range in filters
        if (options.years.length > 0) {
          setFilters(prev => ({
            ...prev,
            years: [Math.min(...options.years), Math.max(...options.years)]
          }));
        }
      } catch (err) {
        console.error('Error simulating publications:', err);
        setError('Failed to load publications data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    simulatePublications();
  }, []);
  
  // Apply search and filters
  useEffect(() => {
    if (publications.length === 0) return;
    
    let results = [...publications];
    
    // Apply filters
    results = filterPublications(results, filters);
    
    // Apply search
    if (searchQuery.trim()) {
      results = searchPublications(results, searchQuery, searchIndex || undefined);
    }
    
    // Apply sorting
    results = sortPublications(results, sortOption);
    
    setFilteredPublications(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, filters, publications, sortOption, searchIndex]);
  
  // Sort publications
  const sortPublications = (pubs: Publication[], sort: string): Publication[] => {
    const sorted = [...pubs];
    
    switch (sort) {
      case 'year-desc':
        return sorted.sort((a, b) => b.year - a.year);
      case 'year-asc':
        return sorted.sort((a, b) => a.year - b.year);
      case 'citations':
        return sorted.sort((a, b) => (b.citations || 0) - (a.citations || 0));
      default:
        return sorted;
    }
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  // Handle filter change
  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };
  
  // Handle filter clear
  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };
  
  // Handle view publication details
  const handleViewPublication = (publication: Publication) => {
    setSelectedPublication(publication);
    setIsModalOpen(true);
  };
  
  // Handle bookmark toggle
  const handleBookmarkToggle = (publication: Publication, isBookmarked: boolean) => {
    if (isBookmarked) {
      setBookmarkedPubs(prev => [...prev, publication.id]);
    } else {
      setBookmarkedPubs(prev => prev.filter(id => id !== publication.id));
    }
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredPublications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPublications = filteredPublications.slice(startIndex, endIndex);
  
  // Get stats
  const totalResults = filteredPublications.length;
  const yearRange = publications.length > 0 
    ? `${Math.min(...publications.map(p => p.year))} - ${Math.max(...publications.map(p => p.year))}`
    : 'N/A';
  const topTopics = publications.length > 0
    ? [...new Set(publications.flatMap(p => p.topics))]
        .map(topic => ({
          topic,
          count: publications.filter(p => p.topics.includes(topic)).length
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(t => t.topic)
        .join(', ')
    : 'N/A';
  
  return (
    <div className="min-h-screen">
      {/* Header section */}
      <div className="bg-slate-900 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Publications Dashboard</h1>
          
          {/* Search bar */}
          <SearchBar
            onSearch={handleSearch}
            isLoading={isLoading}
            placeholder="Search publications by title, author, keywords..."
          />
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <StatCard
              title="Publications"
              value={totalResults}
              description={`${totalResults === publications.length ? 'All' : totalResults} publications ${totalResults !== publications.length ? 'matching your filters' : ''}`}
            />
            <StatCard
              title="Year Range"
              value={yearRange}
              description="Publication years span"
            />
            <StatCard
              title="Top Topics"
              value={topTopics}
              description="Most frequent research topics"
            />
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <FilterSidebar
              years={filterOptions.years}
              topics={filterOptions.topics}
              organisms={filterOptions.organisms}
              experimentTypes={filterOptions.experimentTypes}
              missions={filterOptions.missions}
              platforms={filterOptions.platforms}
              activeFilters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>
          
          {/* Results */}
          <div className="lg:w-3/4">
            {/* Results header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  {isLoading ? 'Loading publications...' : `${totalResults} Publications`}
                </h2>
                <p className="text-sm text-gray-400">
                  {searchQuery ? `Search results for "${searchQuery}"` : 'All publications'}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* View toggle */}
                <div className="flex items-center bg-slate-800 rounded-lg overflow-hidden">
                  <button
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                  >
                    <List size={18} />
                  </button>
                </div>
                
                {/* Sort dropdown */}
                <div className="relative">
                  <select
                    className="appearance-none bg-slate-800 border border-slate-700 rounded-lg py-2 pl-3 pr-10 text-sm"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as any)}
                  >
                    <option value="year-desc">Newest first</option>
                    <option value="year-asc">Oldest first</option>
                    <option value="citations">Most cited</option>
                    <option value="relevance">Relevance</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <SlidersHorizontal size={14} className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            {/* Loading state */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-400">Loading publications...</p>
              </div>
            ) : (
              <>
                {/* No results */}
                {filteredPublications.length === 0 ? (
                  <div className="glass-card p-8 text-center">
                    <h3 className="text-xl font-bold mb-2">No publications found</h3>
                    <p className="text-gray-400 mb-4">
                      {searchQuery 
                        ? `No results match your search "${searchQuery}"` 
                        : 'No publications match your filter criteria'}
                    </p>
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      onClick={handleClearFilters}
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Publications grid/list */}
                    <div className={viewMode === 'grid' 
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                      : 'space-y-4'
                    }>
                      {currentPublications.map((pub) => (
                        <PublicationCard
                          key={pub.id}
                          publication={pub}
                          onViewDetails={handleViewPublication}
                          onBookmarkToggle={handleBookmarkToggle}
                          isBookmarked={bookmarkedPubs.includes(pub.id)}
                          showAbstract={viewMode === 'grid'}
                          className={viewMode === 'list' ? 'flex flex-col' : ''}
                        />
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-8">
                        <div className="flex items-center space-x-2">
                          <button
                            className="px-3 py-1 rounded-md bg-slate-800 text-gray-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>
                          
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // Show 5 pages max with current page in the middle when possible
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                className={`w-8 h-8 rounded-md flex items-center justify-center ${
                                  currentPage === pageNum 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                                }`}
                                onClick={() => setCurrentPage(pageNum)}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          
                          {totalPages > 5 && currentPage < totalPages - 2 && (
                            <>
                              {currentPage < totalPages - 3 && <span className="text-gray-500">...</span>}
                              <button
                                className="w-8 h-8 rounded-md flex items-center justify-center bg-slate-800 text-gray-300 hover:bg-slate-700"
                                onClick={() => setCurrentPage(totalPages)}
                              >
                                {totalPages}
                              </button>
                            </>
                          )}
                          
                          <button
                            className="px-3 py-1 rounded-md bg-slate-800 text-gray-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Publication modal */}
      {selectedPublication && (
        <PublicationModal
          publication={selectedPublication}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onBookmarkToggle={handleBookmarkToggle}
          isBookmarked={bookmarkedPubs.includes(selectedPublication.id)}
          relatedPublications={publications
            .filter(p => 
              p.id !== selectedPublication.id && 
              p.topics.some(t => selectedPublication.topics.includes(t))
            )
            .slice(0, 3)
          }
        />
      )}
    </div>
  );
}
