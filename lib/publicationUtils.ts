import { Publication, SearchFilters } from "../types/publication";

export function formatAuthors(authors: string[]): string {
  return authors.join(", ");
}

export function formatDOI(doi: string): string {
  return doi.replace("https://doi.org/", "");
}

export function filterPublications(
  publications: Publication[],
  filters: SearchFilters
): Publication[] {
  return publications.filter((pub) => {
    // Year filter
    if (
      filters.years &&
      pub.year &&
      (pub.year < filters.years[0] || pub.year > filters.years[1])
    )
      return false;

    // Topic filter
    if (
      filters.topics.length > 0 &&
      (!pub.topics || !pub.topics.some((t) => filters.topics.includes(t)))
    )
      return false;

    // Organism filter
    if (
      filters.organisms.length > 0 &&
      (!pub.organisms ||
        !pub.organisms.some((o) => filters.organisms.includes(o)))
    )
      return false;

    // Experiment type filter
    if (
      filters.experimentTypes.length > 0 &&
      (!pub.experimentType ||
        !pub.experimentType.some((e) => filters.experimentTypes.includes(e)))
    )
      return false;

    // Mission filter
    if (
      filters.missions.length > 0 &&
      (!pub.mission || !filters.missions.includes(pub.mission))
    )
      return false;

    // Platform filter
    if (
      filters.platforms.length > 0 &&
      (!pub.platform || !filters.platforms.includes(pub.platform))
    )
      return false;

    return true;
  });
}

export function searchPublications(
  publications: Publication[],
  searchQuery: string
): Publication[] {
  const query = searchQuery.toLowerCase();
  return publications.filter((pub) => {
    // Search in title
    if (pub.title.toLowerCase().includes(query)) return true;

    // Search in authors
    if (pub.authors.some((author) => author.toLowerCase().includes(query)))
      return true;

    // Search in abstract
    if (pub.abstract && pub.abstract.toLowerCase().includes(query)) return true;

    // Search in topics
    if (
      pub.topics &&
      pub.topics.some((topic) => topic.toLowerCase().includes(query))
    )
      return true;

    // Search in keywords
    if (
      pub.keywords &&
      pub.keywords.some((keyword) => keyword.toLowerCase().includes(query))
    )
      return true;

    return false;
  });
}

export function getFilterOptions(publications: Publication[]) {
  const options = {
    years: new Set<number>(),
    topics: new Set<string>(),
    organisms: new Set<string>(),
    experimentTypes: new Set<string>(),
    missions: new Set<string>(),
    platforms: new Set<string>(),
  };

  publications.forEach((pub) => {
    if (pub.year) options.years.add(pub.year);
    if (pub.topics) pub.topics.forEach((topic) => options.topics.add(topic));
    if (pub.organisms)
      pub.organisms.forEach((organism) => options.organisms.add(organism));
    if (pub.experimentType)
      pub.experimentType.forEach((type) => options.experimentTypes.add(type));
    if (pub.mission) options.missions.add(pub.mission);
    if (pub.platform) options.platforms.add(pub.platform);
  });

  return {
    years: Array.from(options.years).sort((a, b) => b - a),
    topics: Array.from(options.topics).sort(),
    organisms: Array.from(options.organisms).sort(),
    experimentTypes: Array.from(options.experimentTypes).sort(),
    missions: Array.from(options.missions).sort(),
    platforms: Array.from(options.platforms).sort(),
  };
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  waitFor: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>): Promise<ReturnType<T>> =>
    new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(
        () => resolve(func(...args) as ReturnType<T>),
        waitFor
      );
    });
}
