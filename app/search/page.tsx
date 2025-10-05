"use client";

import { useState, useEffect } from "react";
import { History, Sparkles, X, Clock, ArrowDown } from "lucide-react";
import { Publication } from "../../types/publication";
import {
  parsePublicationsCSV,
  createSearchIndex,
} from "../../lib/dataProcessor";
import { searchPublications, semanticSearch } from "../../lib/aiService";
import SearchBar from "../../components/SearchBar";
import PublicationCard from "../../components/PublicationCard";
import PublicationModal from "../../components/PublicationModal";

export default function SearchPage() {
  // State for publications data
  const [publications, setPublications] = useState<Publication[]>([]);
  const [searchResults, setSearchResults] = useState<Publication[]>([]);
  const [searchIndex, setSearchIndex] = useState<Map<string, number[]> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for search
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // State for selected publication
  const [selectedPublication, setSelectedPublication] =
    useState<Publication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load publications data
  useEffect(() => {
    const loadPublications = async () => {
      try {
        // Simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Use the sample data we created earlier
        const response = await fetch("/data/publications.csv");
        const csvData = await response.text();

        // Parse CSV data
        const pubs = await parsePublicationsCSV(csvData);
        setPublications(pubs);

        // Create search index
        const index = createSearchIndex(pubs);
        setSearchIndex(index);

        // Generate suggestions
        const topics = Array.from(
          new Set(pubs.flatMap((pub) => pub.topics || []))
        ).filter((topic) => topic !== undefined) as string[];
        setSuggestions(topics.slice(0, 10));
      } catch (err) {
        console.error("Error loading publications:", err);
        setError("Failed to load publications data. Please try again later.");
      }
    };

    loadPublications();

    // Load recent searches from localStorage
    if (typeof window !== "undefined") {
      const savedSearches = localStorage.getItem("recentSearches");
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    }
  }, []);

  // Handle search
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let results: Publication[];

      if (isSemanticSearch) {
        // Use semantic search
        results = await semanticSearch(searchQuery, publications);
      } else {
        // Use regular search
        results = searchPublications(
          publications,
          searchQuery,
          searchIndex || undefined
        );
      }

      setSearchResults(results);

      // Add to recent searches
      if (searchQuery.trim() && !recentSearches.includes(searchQuery)) {
        const updatedSearches = [searchQuery, ...recentSearches.slice(0, 4)];
        setRecentSearches(updatedSearches);

        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "recentSearches",
            JSON.stringify(updatedSearches)
          );
        }
      }
    } catch (err) {
      console.error("Error performing search:", err);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (searchQuery: string) => {
    setQuery(searchQuery);
    handleSearch(searchQuery);
  };

  // Handle view publication details
  const handleViewPublication = (publication: Publication) => {
    setSelectedPublication(publication);
    setIsModalOpen(true);
  };

  // Handle clear recent searches
  const handleClearRecentSearches = () => {
    setRecentSearches([]);

    // Clear from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("recentSearches");
    }
  };

  // Handle remove recent search
  const handleRemoveRecentSearch = (search: string) => {
    const updatedSearches = recentSearches.filter((s) => s !== search);
    setRecentSearches(updatedSearches);

    // Update localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header section */}
      <div className="bg-gradient-to-b from-slate-900 to-indigo-950 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
              Search Space Biology Publications
            </h1>
            <p className="text-gray-300 text-center mb-8">
              Search through 608 NASA space biology research publications using
              keywords or AI-powered semantic search
            </p>

            {/* Search bar */}
            <div className="relative">
              <SearchBar
                onSearch={handleSearchChange}
                suggestions={suggestions}
                recentSearches={recentSearches}
                isLoading={isLoading}
                placeholder="Search by title, author, keywords, or research topic..."
              />

              {/* Semantic search toggle */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="semanticSearch"
                    checked={isSemanticSearch}
                    onChange={() => setIsSemanticSearch(!isSemanticSearch)}
                    className="mr-2"
                  />
                  <label
                    htmlFor="semanticSearch"
                    className="flex items-center text-sm"
                  >
                    <Sparkles size={14} className="mr-1 text-blue-400" />
                    Use AI-powered semantic search
                  </label>
                </div>

                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-sm text-gray-400 hover:text-white flex items-center"
                >
                  <History size={14} className="mr-1" />
                  {showHistory ? "Hide search history" : "Show search history"}
                </button>
              </div>
            </div>

            {/* Search history */}
            {showHistory && recentSearches.length > 0 && (
              <div className="mt-6 glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium flex items-center">
                    <Clock size={14} className="mr-1 text-gray-400" />
                    Recent Searches
                  </h3>
                  <button
                    onClick={handleClearRecentSearches}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-white/10 rounded-full px-3 py-1 text-sm"
                    >
                      <button
                        onClick={() => handleSearchChange(search)}
                        className="mr-1"
                      >
                        {search}
                      </button>
                      <button
                        onClick={() => handleRemoveRecentSearch(search)}
                        className="text-gray-400 hover:text-white"
                        aria-label={`Remove ${search} from recent searches`}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search results */}
      <div className="container mx-auto px-4 py-8">
        {error ? (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6 max-w-3xl mx-auto">
            {error}
          </div>
        ) : query ? (
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {isLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                    Searching...
                  </span>
                ) : (
                  `${searchResults.length} results for "${query}"`
                )}
              </h2>

              {searchResults.length > 0 && (
                <div className="flex items-center">
                  <span className="text-sm text-gray-400 mr-2">Sort by:</span>
                  <button className="text-sm flex items-center px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20">
                    Relevance
                    <ArrowDown size={14} className="ml-1" />
                  </button>
                </div>
              )}
            </div>

            {searchResults.length === 0 && !isLoading ? (
              <div className="glass-card p-8 text-center">
                <h3 className="text-xl font-bold mb-2">No results found</h3>
                <p className="text-gray-400 mb-4">
                  No publications match your search query &quot;{query}&quot;
                </p>
                <p className="text-gray-400">
                  Try using different keywords or{" "}
                  {!isSemanticSearch && (
                    <button
                      onClick={() => setIsSemanticSearch(true)}
                      className="text-blue-400 hover:underline"
                    >
                      enable semantic search
                    </button>
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {searchResults.map((pub) => (
                  <PublicationCard
                    key={pub.id}
                    publication={pub}
                    onViewDetails={handleViewPublication}
                    showAbstract={true}
                    className="w-full"
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto text-center py-8">
            <h2 className="text-xl font-bold mb-4">
              Enter a search query to get started
            </h2>
            <p className="text-gray-400 mb-6">
              Search for publications by title, author, keywords, or research
              topics
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <p className="text-sm text-gray-400 w-full mb-2">
                Popular searches:
              </p>
              {suggestions.slice(0, 6).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchChange(suggestion)}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Publication modal */}
      {selectedPublication && (
        <PublicationModal
          publication={selectedPublication}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          relatedPublications={publications
            .filter(
              (p) =>
                p.id !== selectedPublication.id &&
                p.topics &&
                selectedPublication.topics &&
                p.topics.some((t) => selectedPublication.topics!.includes(t))
            )
            .slice(0, 3)}
          aiSummary={
            isSemanticSearch
              ? {
                  oneLineSummary: `Research on ${
                    (selectedPublication.topics &&
                      selectedPublication.topics[0]) ||
                    "space biology"
                  } investigating effects in space environment.`,
                  keyFindings: [
                    `${
                      (selectedPublication.topics &&
                        selectedPublication.topics[0]) ||
                      "Research"
                    } shows significant changes in ${
                      (selectedPublication.topics &&
                        selectedPublication.topics[1]) ||
                      "biological systems"
                    }.`,
                    `Results demonstrate important implications for ${
                      (selectedPublication.topics &&
                        selectedPublication.topics[2]) ||
                      "future space missions"
                    }.`,
                    `Findings contribute to our understanding of ${
                      (selectedPublication.topics &&
                        selectedPublication.topics[0]) ||
                      "space biology"
                    } adaptation mechanisms.`,
                  ],
                  missionRelevance: `This research is relevant to future space missions as it addresses challenges related to ${
                    (selectedPublication.topics &&
                      selectedPublication.topics[0]) ||
                    "biological systems"
                  } in the space environment.`,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
