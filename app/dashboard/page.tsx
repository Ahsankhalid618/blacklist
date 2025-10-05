"use client";

import { useState, useEffect, useCallback } from "react";
import { Grid, List, SlidersHorizontal } from "lucide-react";
import { Publication, SearchFilters } from "../../types/publication";
import { loadPublications } from "../../lib/dataService";
import SearchBar from "../../components/SearchBar";
import PublicationCard from "../../components/PublicationCard";
import FilterSidebar from "../../components/FilterSidebar";
import PublicationModal from "../../components/PublicationModal";
import StatCard from "../../components/StatCard";

// Default filters
const defaultFilters: SearchFilters = {
  years: [1990, new Date().getFullYear()],
  topics: [],
  organisms: [],
  experimentTypes: [],
  missions: [],
  platforms: [],
};

function extractTopicsFromText(text: string): string[] {
  const commonWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "with",
    "from",
    "by",
  ]);
  const words = text
    .toLowerCase()
    .split(/\W+/)
    .filter(
      (word) =>
        word.length > 3 &&
        !commonWords.has(word) &&
        !Number.isFinite(Number(word))
    );

  return Array.from(new Set(words)).slice(0, 5);
}

function getRelevanceScore(
  publication: Publication,
  searchQuery: string
): number {
  const searchTerms = searchQuery.toLowerCase().split(" ");
  let score = 0;

  searchTerms.forEach((term) => {
    if (publication.title.toLowerCase().includes(term)) score += 3;
  });

  searchTerms.forEach((term) => {
    if (publication.abstract.toLowerCase().includes(term)) score += 2;
  });

  publication.sections.forEach((section) => {
    searchTerms.forEach((term) => {
      if (section.content.toLowerCase().includes(term)) score += 1;
    });
  });

  return score;
}

function filterPublications(
  publications: Publication[],
  filters: SearchFilters
): Publication[] {
  return publications.filter((pub) => {
    const pubYear = pub.publicationDate
      ? new Date(pub.publicationDate).getFullYear()
      : new Date().getFullYear();
    if (pubYear < filters.years[0] || pubYear > filters.years[1]) return false;

    if (filters.topics.length > 0) {
      const pubText = `${pub.title} ${pub.abstract} ${pub.sections
        .map((s) => s.content)
        .join(" ")}`.toLowerCase();
      if (!filters.topics.some((t) => pubText.includes(t.toLowerCase())))
        return false;
    }

    if (
      filters.organisms.length > 0 &&
      !filters.organisms.some((o) =>
        pub.abstract.toLowerCase().includes(o.toLowerCase())
      )
    )
      return false;

    if (
      filters.experimentTypes.length > 0 &&
      !filters.experimentTypes.some((e) =>
        pub.abstract.toLowerCase().includes(e.toLowerCase())
      )
    )
      return false;

    if (
      filters.missions.length > 0 &&
      !filters.missions.some((m) =>
        pub.abstract.toLowerCase().includes(m.toLowerCase())
      )
    )
      return false;

    if (
      filters.platforms.length > 0 &&
      !filters.platforms.some((p) =>
        pub.abstract.toLowerCase().includes(p.toLowerCase())
      )
    )
      return false;

    return true;
  });
}

function searchPublications(
  publications: Publication[],
  query: string
): Publication[] {
  const searchTerms = query
    .toLowerCase()
    .split(" ")
    .filter((term) => term.length > 0);

  return publications.filter((pub) => {
    const searchableText = [
      pub.title,
      pub.abstract,
      pub.authors.join(" "),
      pub.journal,
    ]
      .join(" ")
      .toLowerCase();

    return searchTerms.every((term) => searchableText.includes(term));
  });
}

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

function getFilterOptions(publications: Publication[]) {
  const commonWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
  ]);

  const topicCounts = new Map<string, number>();
  publications.forEach((pub) => {
    const words = pub.title
      .split(/\W+/)
      .concat(pub.abstract.split(/\W+/))
      .filter(
        (word) =>
          word.length > 3 &&
          !commonWords.has(word.toLowerCase()) &&
          !Number.isFinite(Number(word))
      );
    words.forEach((word) => {
      topicCounts.set(word, (topicCounts.get(word) || 0) + 1);
    });
  });

  const organismCounts = new Map<string, number>();
  const commonOrganisms = [
    "mouse",
    "rat",
    "cell",
    "bacteria",
    "plant",
    "human",
    "mice",
    "cells",
  ];
  publications.forEach((pub) => {
    commonOrganisms.forEach((org) => {
      if (pub.abstract.toLowerCase().includes(org)) {
        organismCounts.set(org, (organismCounts.get(org) || 0) + 1);
      }
    });
  });

  const experimentCounts = new Map<string, number>();
  const commonExperiments = [
    "analysis",
    "study",
    "experiment",
    "test",
    "trial",
    "observation",
  ];
  publications.forEach((pub) => {
    commonExperiments.forEach((exp) => {
      if (pub.abstract.toLowerCase().includes(exp)) {
        experimentCounts.set(exp, (experimentCounts.get(exp) || 0) + 1);
      }
    });
  });

  const mapToFilterOptions = (map: Map<string, number>): FilterOption[] =>
    Array.from(map.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count);

  const missionOptions: FilterOption[] = [
    "ISS",
    "Space Shuttle",
    "Ground Control",
  ].map((value) => ({ value, label: value, count: publications.length }));

  const platformOptions: FilterOption[] = [
    "Spacecraft",
    "Laboratory",
    "Space Station",
  ].map((value) => ({ value, label: value, count: publications.length }));

  return {
    years: [
      ...new Set(
        publications.map((p) =>
          p.publicationDate
            ? new Date(p.publicationDate).getFullYear()
            : new Date().getFullYear()
        )
      ),
    ].sort(),
    topics: mapToFilterOptions(topicCounts).slice(0, 100),
    organisms: mapToFilterOptions(organismCounts),
    experimentTypes: mapToFilterOptions(experimentCounts),
    missions: missionOptions,
    platforms: platformOptions,
  };
}

// Add this function near your other utility functions
function validatePublicationData(publications: Publication[]): Publication[] {
  const seen = new Set();
  return publications.filter((pub) => {
    if (!pub.pmcid || seen.has(pub.pmcid)) {
      console.warn(`Duplicate or invalid PMCID found:`, pub);
      return false;
    }
    seen.add(pub.pmcid);
    return true;
  });
}

export default function DashboardPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<
    Publication[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  interface FilterOption {
    value: string;
    label: string;
    count: number;
  }

  const [filterOptions, setFilterOptions] = useState<{
    years: number[];
    topics: FilterOption[];
    organisms: FilterOption[];
    experimentTypes: FilterOption[];
    missions: FilterOption[];
    platforms: FilterOption[];
  }>({
    years: [],
    topics: [],
    organisms: [],
    experimentTypes: [],
    missions: [],
    platforms: [],
  });

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState<
    "relevance" | "year-desc" | "year-asc" | "citations"
  >("year-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const [selectedPublication, setSelectedPublication] =
    useState<Publication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [bookmarkedPubs, setBookmarkedPubs] = useState<string[]>([]);

  useEffect(() => {
    async function fetchPublications() {
      setIsLoading(true);
      try {
        const pubs = await loadPublications();
        const validatedPubs = validatePublicationData(pubs);
        setPublications(validatedPubs);
        setFilteredPublications(validatedPubs);

        const options = getFilterOptions(validatedPubs);
        setFilterOptions(options);

        if (validatedPubs.length > 0) {
          const years = validatedPubs.map((p) =>
            p.publicationDate
              ? new Date(p.publicationDate).getFullYear()
              : new Date().getFullYear()
          );
          setFilters((prev) => ({
            ...prev,
            years: [Math.min(...years), Math.max(...years)],
          }));
        }
      } catch (err) {
        console.error("Error loading publications:", err);
        setError("Failed to load publications data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPublications();
  }, []);

  const sortPublications = useCallback(
    (pubs: Publication[], sort: string): Publication[] => {
      const sorted = [...pubs];

      switch (sort) {
        case "year-desc":
          return sorted.sort((a, b) => {
            const yearA = a.publicationDate
              ? new Date(a.publicationDate).getFullYear()
              : 0;
            const yearB = b.publicationDate
              ? new Date(b.publicationDate).getFullYear()
              : 0;
            return yearB - yearA;
          });
        case "year-asc":
          return sorted.sort((a, b) => {
            const yearA = a.publicationDate
              ? new Date(a.publicationDate).getFullYear()
              : 0;
            const yearB = b.publicationDate
              ? new Date(b.publicationDate).getFullYear()
              : 0;
            return yearA - yearB;
          });
        case "citations":
          return sorted.sort((a, b) => (b.pmcid ? 1 : 0) - (a.pmcid ? 1 : 0));
        case "relevance":
          if (!searchQuery.trim()) return sorted;
          return sorted.sort((a, b) => {
            const aScore = getRelevanceScore(a, searchQuery);
            const bScore = getRelevanceScore(b, searchQuery);
            return bScore - aScore;
          });
        default:
          return sorted;
      }
    },
    [searchQuery]
  );

  useEffect(() => {
    if (publications.length === 0) return;

    let results = [...publications];

    results = filterPublications(results, filters);

    if (searchQuery.trim()) {
      results = searchPublications(results, searchQuery);
    }

    results = sortPublications(results, sortOption);

    setFilteredPublications(results);
    setCurrentPage(1);
  }, [searchQuery, filters, publications, sortOption, sortPublications]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };

  const handleViewPublication = (publication: Publication) => {
    setSelectedPublication(publication);
    setIsModalOpen(true);
  };

  const handleBookmarkToggle = (
    publication: Publication,
    isBookmarked: boolean
  ) => {
    if (isBookmarked) {
      setBookmarkedPubs((prev) => [...prev, publication.pmcid]);
    } else {
      setBookmarkedPubs((prev) =>
        prev.filter((id) => id !== publication.pmcid)
      );
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPublications = filteredPublications.slice(startIndex, endIndex);

  const totalResults = filteredPublications.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const yearRange =
    publications.length > 0
      ? `${Math.min(
          ...publications.map((p) =>
            p.publicationDate
              ? new Date(p.publicationDate).getFullYear()
              : new Date().getFullYear()
          )
        )} - ${Math.max(
          ...publications.map((p) =>
            p.publicationDate
              ? new Date(p.publicationDate).getFullYear()
              : new Date().getFullYear()
          )
        )}`
      : "N/A";

  const topTopics =
    publications.length > 0
      ? Array.from(
          new Set(
            publications.flatMap((p) =>
              extractTopicsFromText(`${p.title} ${p.abstract}`)
            )
          )
        )
          .slice(0, 3)
          .join(", ")
      : "N/A";

  return (
    <div className="min-h-screen mx-auto max-w-7xl">
      <div className="bg-slate-900 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl text-center font-bold mb-6">
            Publications Dashboard
          </h1>
          <div className="mx-auto max-w-xl w-full">
            <SearchBar
              onSearch={handleSearch}
              isLoading={isLoading}
              placeholder="Search publications by title, author, keywords..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <StatCard
              title="Publications"
              value={totalResults}
              description={`${
                totalResults === publications.length ? "All" : totalResults
              } publications ${
                totalResults !== publications.length
                  ? "matching your filters"
                  : ""
              }`}
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

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <FilterSidebar
              years={filterOptions.years} // Change from filterOptions.publicationDate to filterOptions.years
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

          <div className="lg:w-3/4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  {isLoading
                    ? "Loading publications..."
                    : `${totalResults} Publications`}
                </h2>
                <p className="text-sm text-gray-400">
                  {searchQuery
                    ? `Search results for "${searchQuery}"`
                    : "All publications"}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center bg-slate-800 rounded-lg overflow-hidden">
                  <button
                    className={`p-2 ${
                      viewMode === "grid"
                        ? "bg-blue-500 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    className={`p-2 ${
                      viewMode === "list"
                        ? "bg-blue-500 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                  >
                    <List size={18} />
                  </button>
                </div>

                <div className="relative">
                  <select
                    className="appearance-none bg-slate-800 border border-slate-700 rounded-lg py-2 pl-3 pr-10 text-sm"
                    value={sortOption}
                    onChange={(e) =>
                      setSortOption(
                        e.target.value as
                          | "relevance"
                          | "year-desc"
                          | "year-asc"
                          | "citations"
                      )
                    }
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

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-400">Loading publications...</p>
              </div>
            ) : (
              <>
                {filteredPublications.length === 0 ? (
                  <div className="glass-card p-8 text-center">
                    <h3 className="text-xl font-bold mb-2">
                      No publications found
                    </h3>
                    <p className="text-gray-400 mb-4">
                      {searchQuery
                        ? `No results match your search "${searchQuery}"`
                        : "No publications match your filter criteria"}
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
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                          : "space-y-4"
                      }
                    >
                      {currentPublications.map((pub) => (
                        <PublicationCard
                          key={`pub-${pub.pmcid}`} // Modified key to ensure uniqueness
                          publication={pub}
                          onViewDetails={handleViewPublication}
                          onBookmarkToggle={handleBookmarkToggle}
                          isBookmarked={bookmarkedPubs.includes(pub.pmcid)}
                          showAbstract={viewMode === "grid"}
                          className={viewMode === "list" ? "flex flex-col" : ""}
                        />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex justify-center mt-8">
                        <div className="flex items-center space-x-2">
                          <button
                            className="px-3 py-1 rounded-md bg-slate-800 text-gray-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>

                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
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
                                      ? "bg-blue-500 text-white"
                                      : "bg-slate-800 text-gray-300 hover:bg-slate-700"
                                  }`}
                                  onClick={() => setCurrentPage(pageNum)}
                                >
                                  {pageNum}
                                </button>
                              );
                            }
                          )}

                          {totalPages > 5 && currentPage < totalPages - 2 && (
                            <>
                              {currentPage < totalPages - 3 && (
                                <span className="text-gray-500">...</span>
                              )}
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
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                              )
                            }
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

      {selectedPublication && (
        <PublicationModal
          publication={selectedPublication}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onBookmarkToggle={handleBookmarkToggle}
          isBookmarked={bookmarkedPubs.includes(selectedPublication.pmcid)}
          relatedPublications={publications
            .filter(
              (p) =>
                p.pmcid !== selectedPublication.pmcid &&
                p.title
                  .toLowerCase()
                  .split(" ")
                  .some(
                    (word) =>
                      selectedPublication.title.toLowerCase().includes(word) &&
                      word.length > 4
                  )
            )
            .slice(0, 3)}
        />
      )}
    </div>
  );
}
