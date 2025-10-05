import { Publication, SearchFilters } from "../types/publication";

/**
 * Format author names for display
 */
export function formatAuthors(authors: string[], limit: number = 3): string {
  if (authors.length === 0) return "Unknown";
  if (authors.length === 1) return authors[0];

  const displayAuthors = authors.slice(0, limit);
  const remaining = authors.length - limit;

  return remaining > 0
    ? `${displayAuthors.join(", ")} and ${remaining} more`
    : displayAuthors.join(", ");
}

/**
 * Format DOI as URL
 */
export function formatDOI(doi: string): string {
  if (!doi) return "";
  return doi.startsWith("http") ? doi : `https://doi.org/${doi}`;
}

/**
 * Filter publications based on search filters
 */
export function filterPublications(
  publications: Publication[],
  filters: SearchFilters
): Publication[] {
  return publications.filter((pub) => {
    // Filter by year range
    const pubYear = pub.year || 0;
    if (pubYear < filters.years[0] || pubYear > filters.years[1]) {
      return false;
    }

    // Filter by topics (if any selected)
    if (
      filters.topics.length > 0 &&
      (!pub.topics ||
        !pub.topics.some((topic) => filters.topics.includes(topic)))
    ) {
      return false;
    }

    // Filter by organisms (if any selected)
    if (
      filters.organisms.length > 0 &&
      (!pub.organisms ||
        !pub.organisms.some((org) => filters.organisms.includes(org)))
    ) {
      return false;
    }

    // Filter by experiment types (if any selected)
    if (
      filters.experimentTypes.length > 0 &&
      (!pub.experimentType ||
        !pub.experimentType.some((type) =>
          filters.experimentTypes.includes(type)
        ))
    ) {
      return false;
    }

    // Filter by missions (if any selected)
    if (
      filters.missions.length > 0 &&
      (!pub.mission || !filters.missions.includes(pub.mission))
    ) {
      return false;
    }

    // Filter by platforms (if any selected)
    if (
      filters.platforms.length > 0 &&
      (!pub.platform || !filters.platforms.includes(pub.platform))
    ) {
      return false;
    }

    return true;
  });
}

/**
 * Search publications by query
 */
export function searchPublications(
  publications: Publication[],
  query: string,
  searchIndex?: Map<string, number[]>
): Publication[] {
  if (!query.trim()) {
    return publications;
  }

  const searchTerms = query
    .toLowerCase()
    .split(/\W+/)
    .filter((term) => term.length > 2);

  if (searchIndex) {
    // Use the search index for faster searching
    const matchingIndices = new Map<number, number>();

    searchTerms.forEach((term) => {
      const indices = searchIndex.get(term) || [];
      indices.forEach((idx) => {
        matchingIndices.set(idx, (matchingIndices.get(idx) || 0) + 1);
      });
    });

    return Array.from(matchingIndices.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([idx]) => publications[idx]);
  } else {
    // Fallback to direct search
    return publications
      .map((pub) => {
        const titleMatches = searchTerms.filter((term) =>
          pub.title.toLowerCase().includes(term)
        ).length;

        const abstractMatches = searchTerms.filter((term) =>
          pub.abstract.toLowerCase().includes(term)
        ).length;

        const keywordMatches = pub.keywords
          ? searchTerms.filter((term) =>
              pub.keywords!.some((k) => k.toLowerCase().includes(term))
            ).length
          : 0;

        const authorMatches = searchTerms.filter((term) =>
          pub.authors.some((a) => a.toLowerCase().includes(term))
        ).length;

        const score =
          titleMatches * 3 +
          abstractMatches +
          keywordMatches * 2 +
          authorMatches * 2;

        return { pub, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ pub }) => pub);
  }
}

/**
 * Get unique values for filter options
 */
export function getFilterOptions(publications: Publication[]) {
  const years = new Set<number>();
  const topics = new Set<string>();
  const organisms = new Set<string>();
  const experimentTypes = new Set<string>();
  const missions = new Set<string>();
  const platforms = new Set<string>();

  publications.forEach((pub) => {
    if (pub.year) years.add(pub.year);

    if (pub.topics) {
      pub.topics.forEach((topic) => topics.add(topic));
    }

    if (pub.organisms) {
      pub.organisms.forEach((org) => organisms.add(org));
    }

    if (pub.experimentType) {
      pub.experimentType.forEach((type) => experimentTypes.add(type));
    }

    if (pub.mission) {
      missions.add(pub.mission);
    }

    if (pub.platform) {
      platforms.add(pub.platform);
    }
  });

  return {
    years: Array.from(years).sort(),
    topics: Array.from(topics).sort(),
    organisms: Array.from(organisms).sort(),
    experimentTypes: Array.from(experimentTypes).sort(),
    missions: Array.from(missions).sort(),
    platforms: Array.from(platforms).sort(),
  };
}

/**
 * Debounce function for search inputs
 */
export function debounce<F extends (...args: unknown[]) => unknown>(
  func: F,
  waitFor: number
): (...args: Parameters<F>) => Promise<ReturnType<F>> {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    return new Promise<ReturnType<F>>((resolve) => {
      timeout = setTimeout(
        () => resolve(func(...args) as ReturnType<F>),
        waitFor
      );
    });
  };
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Generate a color based on a string (for consistent topic colors)
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
}
