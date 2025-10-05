import Papa from "papaparse";
import {
  Publication,
  PublicationSummary,
  TopicDistribution,
  YearlyStats,
  ResearchGap,
} from "../types/publication";

/**
 * Parse CSV data into Publication objects
 */
export async function parsePublicationsCSV(
  csvData: string
): Promise<Publication[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      complete: (results: {
        data: Record<string, string>[];
        errors: unknown[];
        meta: unknown;
      }) => {
        const publications = results.data.map(
          (row: Record<string, string>, index: number) => {
            // Transform CSV row into Publication object
            return {
              id: row.id || `pub-${index}`,
              title: row.title || "",
              authors: row.authors
                ? row.authors.split(";").map((a: string) => a.trim())
                : [],
              year: parseInt(row.year) || 0,
              doi: row.doi || "",
              abstract: row.abstract || "",
              keywords: row.keywords
                ? row.keywords.split(";").map((k: string) => k.trim())
                : [],
              journal: row.journal || "",
              volume: row.volume,
              issue: row.issue,
              pages: row.pages,
              citations: parseInt(row.citations) || undefined,
              url: row.url,
              pdfUrl: row.pdf_url || row.pdfUrl,
              topics: extractTopics(row.abstract || "", row.keywords || ""),
              organisms: row.organisms
                ? row.organisms.split(";").map((o: string) => o.trim())
                : [],
              experimentType: row.experiment_type
                ? row.experiment_type.split(";").map((e: string) => e.trim())
                : [],
              mission: row.mission,
              platform: row.platform,
            };
          }
        );
        // Convert to Publication type with type assertion
        // Create valid Publication objects with proper types
        const validPublications = publications.map((pub) => {
          const validPub: Publication = {
            url: String(pub.url || ""),
            originalTitle: String(pub.title || ""),
            title: String(pub.title || ""),
            authors: Array.isArray(pub.authors) ? pub.authors : [],
            correspondingAuthorEmail: "",
            journal: String(pub.journal || ""),
            publicationDate: String(pub.year || ""),
            volume: String(pub.volume || ""),
            issue: String(pub.issue || ""),
            pages: String(pub.pages || ""),
            doi: String(pub.doi || ""),
            pmcid: "",
            pmid: "",
            abstract: String(pub.abstract || ""),
            citation: "",
            fullTextAvailable: true,
            scrapingSuccess: true,
            sections: [],
            id: String(pub.id || ""),
            year: typeof pub.year === "number" ? pub.year : 0,
            keywords: Array.isArray(pub.keywords) ? pub.keywords : [],
            topics: Array.isArray(pub.topics) ? pub.topics : [],
            organisms: Array.isArray(pub.organisms) ? pub.organisms : [],
            experimentType: Array.isArray(pub.experimentType)
              ? pub.experimentType
              : [],
            mission: String(pub.mission || ""),
            platform: String(pub.platform || ""),
          };
          return validPub;
        });

        resolve(validPublications);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

/**
 * Extract topics from abstract and keywords
 */
function extractTopics(abstract: string, keywords: string): string[] {
  // This is a simple implementation
  // In a real application, this could use NLP or a predefined taxonomy
  const keywordTopics = keywords.split(";").map((k) => k.trim());

  // Common space biology research topics
  const commonTopics = [
    "microgravity",
    "radiation",
    "space flight",
    "bone loss",
    "muscle atrophy",
    "cardiovascular",
    "immune system",
    "plants",
    "microbiome",
    "neuroscience",
    "genetics",
    "cell biology",
    "physiology",
    "behavior",
    "development",
  ];

  const extractedTopics = commonTopics.filter((topic) =>
    abstract.toLowerCase().includes(topic.toLowerCase())
  );

  // Combine and deduplicate
  const allTopics = [...new Set([...keywordTopics, ...extractedTopics])];
  return allTopics.filter((t) => t.length > 0);
}

/**
 * Create a search index for publications
 */
export function createSearchIndex(
  publications: Publication[]
): Map<string, number[]> {
  const index = new Map<string, number[]>();

  publications.forEach((pub, idx) => {
    // Index title words
    const titleWords = pub.title
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2);
    // Index abstract words
    const abstractWords = pub.abstract
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2);
    // Index keywords
    const keywords = pub.keywords?.map((k) => k.toLowerCase()) || [];
    // Index authors
    const authors = pub.authors.map((a) => a.toLowerCase());

    // Combine all searchable terms
    const terms = [
      ...new Set([
        ...titleWords,
        ...abstractWords,
        ...keywords,
        ...authors,
        ...(pub.topics || []),
      ]),
    ];

    // Add to index
    terms.forEach((term) => {
      if (index.has(term)) {
        index.get(term)?.push(idx);
      } else {
        index.set(term, [idx]);
      }
    });
  });

  return index;
}

/**
 * Get publication summaries
 */
export function getPublicationSummaries(
  publications: Publication[]
): PublicationSummary[] {
  return publications.map((pub) => {
    if (!pub.id || !pub.year) {
      throw new Error("Publication missing required fields");
    }
    return {
      id: pub.id,
      title: pub.title,
      authors: pub.authors,
      year: pub.year,
      abstract:
        pub.abstract.substring(0, 200) +
        (pub.abstract.length > 200 ? "..." : ""),
      topics: pub.topics || [],
      fullTextAvailable: pub.fullTextAvailable,
    };
  });
}

/**
 * Calculate topic distribution
 */
export function calculateTopicDistribution(
  publications: Publication[]
): TopicDistribution[] {
  const topicCounts = new Map<
    string,
    { count: number; publications: string[] }
  >();

  publications.forEach((pub) => {
    if (!pub.topics) return;

    pub.topics.forEach((topic) => {
      if (topicCounts.has(topic)) {
        const current = topicCounts.get(topic)!;
        current.count += 1;
        current.publications.push(pub.id || "");
      } else {
        topicCounts.set(topic, { count: 1, publications: [pub.id || ""] });
      }
    });
  });

  return Array.from(topicCounts.entries())
    .map(([topic, data]) => ({
      topic,
      count: data.count,
      publications: data.publications,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculate yearly statistics
 */
export function calculateYearlyStats(
  publications: Publication[]
): YearlyStats[] {
  const yearMap = new Map<
    number,
    { count: number; topics: Map<string, number> }
  >();

  publications.forEach((pub) => {
    const year = pub.year || new Date().getFullYear();

    if (!yearMap.has(year)) {
      yearMap.set(year, { count: 0, topics: new Map() });
    }

    const yearData = yearMap.get(year)!;
    yearData.count += 1;

    if (pub.topics) {
      pub.topics.forEach((topic) => {
        yearData.topics.set(topic, (yearData.topics.get(topic) || 0) + 1);
      });
    }
  });

  return Array.from(yearMap.entries())
    .map(([year, data]) => {
      const topTopics = Array.from(data.topics.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([topic, count]) => ({ topic, count }));

      return {
        year,
        publicationCount: data.count,
        topTopics,
      };
    })
    .sort((a, b) => a.year - b.year);
}

/**
 * Identify research gaps
 */
export function identifyResearchGaps(
  publications: Publication[]
): ResearchGap[] {
  // This is a simplified implementation
  // In a real application, this would use more sophisticated analysis

  const topicDistribution = calculateTopicDistribution(publications);
  const yearlyStats = calculateYearlyStats(publications);

  // Find topics with low publication counts
  const lowCoverageTopics = topicDistribution
    .filter((t) => t.count < 5)
    .slice(0, 10);

  // Find topics with declining publication trends
  const decliningTopics = new Set<string>();
  const recentYears = yearlyStats.slice(-5);

  if (recentYears.length >= 3) {
    topicDistribution.forEach(({ topic }) => {
      const topicTrend = recentYears.map((year) => {
        const topicData = year.topTopics.find((t) => t.topic === topic);
        return topicData ? topicData.count : 0;
      });

      // Check if trend is declining
      let declining = true;
      for (let i = 1; i < topicTrend.length; i++) {
        if (topicTrend[i] > topicTrend[i - 1]) {
          declining = false;
          break;
        }
      }

      if (declining && Math.max(...topicTrend) > 0) {
        decliningTopics.add(topic);
      }
    });
  }

  // Create research gaps
  const gaps: ResearchGap[] = [
    ...lowCoverageTopics.map(({ topic, count }) => ({
      topic,
      severity: 1 - count / Math.max(...topicDistribution.map((t) => t.count)),
      relatedTopics: findRelatedTopics(topic, publications),
      description: `Limited research on ${topic} with only ${count} publications.`,
    })),
    ...Array.from(decliningTopics).map((topic) => {
      return {
        topic,
        severity: 0.7,
        relatedTopics: findRelatedTopics(topic, publications),
        description: `Declining research trend for ${topic} in recent years.`,
      };
    }),
  ];

  return gaps.sort((a, b) => b.severity - a.severity);
}

/**
 * Find topics that frequently appear together
 */
function findRelatedTopics(
  topic: string,
  publications: Publication[]
): string[] {
  const coOccurrence = new Map<string, number>();

  publications.forEach((pub) => {
    if (pub.topics && pub.topics.includes(topic)) {
      pub.topics.forEach((t) => {
        if (t !== topic) {
          coOccurrence.set(t, (coOccurrence.get(t) || 0) + 1);
        }
      });
    }
  });

  return Array.from(coOccurrence.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([relatedTopic]) => relatedTopic);
}
