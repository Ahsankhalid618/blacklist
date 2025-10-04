import { Publication, AISummary, ResearchGap } from "../types/publication";
import {
  generateSummaryWithGemini,
  semanticSearchWithGemini,
  identifyGapsWithGemini,
} from "./geminiService";

/**
 * Generate a summary of a publication using AI
 */
export async function generateSummary(abstract: string): Promise<AISummary> {
  try {
    // Try to use Gemini API first
    try {
      return await generateSummaryWithGemini(abstract);
    } catch (geminiError) {
      console.warn(
        "Gemini API error, falling back to simulation:",
        geminiError
      );
      // Fall back to simulated summary if Gemini fails
      return simulateSummary(abstract);
    }
  } catch (error) {
    console.error("Error generating summary:", error);
    return {
      oneLineSummary: "Failed to generate summary",
      keyFindings: ["Error processing the abstract"],
      missionRelevance: "Unknown",
    };
  }
}

/**
 * Simulate an AI-generated summary
 */
function simulateSummary(abstract: string): AISummary {
  // Extract some keywords from the abstract to make the summary seem relevant
  const keywords = extractKeywords(abstract);

  // Generate a simple one-line summary
  const oneLineSummary = `Research investigating ${
    keywords[0] || "space biology"
  } in ${keywords[1] || "microgravity"} conditions, with implications for ${
    keywords[2] || "future space missions"
  }.`;

  // Generate key findings
  const keyFindings = [
    `${capitalize(
      keywords[0] || "Biological systems"
    )} showed significant changes under ${keywords[1] || "space"} conditions.`,
    `${capitalize(
      keywords[2] || "Research"
    )} demonstrated potential adaptations to ${keywords[3] || "microgravity"}.`,
    `Results suggest important considerations for ${
      keywords[4] || "astronaut health"
    } during long-duration missions.`,
  ];

  // Generate mission relevance
  const missionRelevance = `This research is relevant to ${
    keywords[5] || "future Moon and Mars missions"
  } as it addresses ${
    keywords[0] || "biological"
  } challenges in the space environment.`;

  // Add gap areas if abstract mentions certain keywords
  const gapAreas =
    abstract.toLowerCase().includes("future") ||
    abstract.toLowerCase().includes("further")
      ? [
          "Further research needed on long-term adaptation mechanisms",
          "Additional studies required on countermeasure effectiveness",
        ]
      : undefined;

  return {
    oneLineSummary,
    keyFindings,
    missionRelevance,
    gapAreas,
  };
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
  // Common space biology keywords to look for
  const commonKeywords = [
    "microgravity",
    "radiation",
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
    "astronaut health",
    "Mars missions",
    "Moon missions",
    "ISS",
    "space station",
    "lunar habitat",
    "bioregenerative",
    "countermeasures",
    "adaptation",
    "space medicine",
  ];

  // Find keywords in the text
  const foundKeywords = commonKeywords.filter((keyword) =>
    text.toLowerCase().includes(keyword.toLowerCase())
  );

  // If we found at least some keywords, return them
  if (foundKeywords.length >= 3) {
    return foundKeywords;
  }

  // Otherwise, extract some words from the text
  const words = text
    .split(/\W+/)
    .filter((word) => word.length > 5)
    .filter(
      (word) =>
        !["research", "study", "results", "analysis", "significant"].includes(
          word.toLowerCase()
        )
    );

  return [...new Set([...foundKeywords, ...words.slice(0, 10)])];
}

/**
 * Capitalize first letter of a string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Perform semantic search on publications
 */
export async function semanticSearch(
  query: string,
  publications: Publication[]
): Promise<Publication[]> {
  try {
    // Try to use Gemini API for semantic search
    try {
      return await semanticSearchWithGemini(query, publications);
    } catch (geminiError) {
      console.warn(
        "Gemini API error for semantic search, falling back to basic search:",
        geminiError
      );

      // Fall back to keyword-based approach
      const queryWords = query
        .toLowerCase()
        .split(/\W+/)
        .filter((word) => word.length > 2);

      // Score publications based on keyword matches
      const scoredPublications = publications.map((pub) => {
        const titleWords = pub.title.toLowerCase().split(/\W+/);
        const abstractWords = pub.abstract.toLowerCase().split(/\W+/);
        const allWords = [
          ...titleWords,
          ...abstractWords,
          ...pub.topics.map((t) => t.toLowerCase()),
        ];

        // Calculate score based on word matches
        let score = 0;
        queryWords.forEach((queryWord) => {
          // Exact matches in title or topics get higher scores
          if (pub.title.toLowerCase().includes(queryWord)) {
            score += 5;
          }
          if (
            pub.topics.some((topic) => topic.toLowerCase().includes(queryWord))
          ) {
            score += 4;
          }
          // Count word matches in all text
          score += allWords.filter((word) => word.includes(queryWord)).length;
        });

        return { publication: pub, score };
      });

      // Sort by score and return publications
      return scoredPublications
        .sort((a, b) => b.score - a.score)
        .filter((item) => item.score > 0)
        .map((item) => item.publication);
    }
  } catch (error) {
    console.error("Error in semantic search:", error);
    return [];
  }
}

/**
 * Identify research gaps in the dataset
 */
export async function identifyGaps(
  publications: Publication[]
): Promise<ResearchGap[]> {
  try {
    // Try to use Gemini API for gap analysis
    try {
      return await identifyGapsWithGemini(publications);
    } catch (geminiError) {
      console.warn(
        "Gemini API error for gap analysis, falling back to basic analysis:",
        geminiError
      );

      // Fall back to simple approach based on topic frequency
      // Get all topics
      const allTopics = Array.from(
        new Set(publications.flatMap((pub) => pub.topics))
      );

      // Count publications per topic
      const topicCounts = new Map<string, number>();
      allTopics.forEach((topic) => {
        const count = publications.filter((pub) =>
          pub.topics.includes(topic)
        ).length;
        topicCounts.set(topic, count);
      });

      // Find topics with low coverage
      const lowCoverageTopics = Array.from(topicCounts.entries())
        .filter(([, count]) => count < 3)
        .map(([topic]) => topic);

      // Generate research gaps
      const gaps: ResearchGap[] = lowCoverageTopics.map((topic) => {
        // Find related topics
        const relatedTopics = allTopics
          .filter(
            (t) =>
              t !== topic &&
              publications.some(
                (pub) => pub.topics.includes(topic) && pub.topics.includes(t)
              )
          )
          .slice(0, 3);

        return {
          topic,
          severity:
            1 -
            (topicCounts.get(topic) || 0) /
              Math.max(...Array.from(topicCounts.values())),
          relatedTopics,
          description: `Limited research on ${topic} with only ${topicCounts.get(
            topic
          )} publications.`,
        };
      });

      return gaps.sort((a, b) => b.severity - a.severity);
    }
  } catch (error) {
    console.error("Error identifying gaps:", error);
    return [];
  }
}

/**
 * Extract high-level insights from the dataset
 */
export async function extractInsights(
  publications: Publication[]
): Promise<Record<string, string>> {
  try {
    // In a real application, this would use AI to analyze the dataset
    // For this demo, we'll generate some simple insights

    // Get publication years
    const years = publications.map((pub) => pub.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const yearRange = maxYear - minYear;

    // Get all topics and their counts
    const topicCounts = new Map<string, number>();
    publications.forEach((pub) => {
      pub.topics.forEach((topic) => {
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      });
    });

    // Get top topics
    const topTopics = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);

    // Get all organisms
    const organisms = new Set<string>();
    publications.forEach((pub) => {
      if (pub.organisms) {
        pub.organisms.forEach((org) => organisms.add(org));
      }
    });

    // Most studied organism
    let mostStudiedOrganism = "humans";
    let mostStudiedCount = 0;

    organisms.forEach((org) => {
      const count = publications.filter((pub) =>
        pub.organisms?.includes(org)
      ).length;
      if (count > mostStudiedCount) {
        mostStudiedOrganism = org;
        mostStudiedCount = count;
      }
    });

    // Generate insights
    return {
      timespan: `The dataset spans ${yearRange} years of research from ${minYear} to ${maxYear}.`,
      topicFocus: `The most studied topics are ${topTopics.join(", ")}.`,
      organisms: `Research covers ${organisms.size} different organisms, with ${mostStudiedOrganism} being the most studied.`,
      trends: `Research has shown increasing focus on ${topTopics[0]} and ${topTopics[1]} in recent years.`,
      gaps: `There are significant research gaps in topics related to long-duration space missions and radiation protection.`,
      recommendations: `Future research should focus on closing gaps in under-researched areas.`,
    };
  } catch (error) {
    console.error("Error extracting insights:", error);
    return {
      error: "Failed to extract insights from the dataset.",
    };
  }
}
