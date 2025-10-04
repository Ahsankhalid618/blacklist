import { AISummary, Publication, ResearchGap } from "../types/publication";

// Import the Gemini API
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as GenAI from "@google/generative-ai";

// Type for content generation request
interface ContentRequest {
  contents: Array<{
    role?: string;
    parts: Array<{
      text?: string;
      inlineData?: {
        mimeType: string;
        data: string;
      };
    }>;
  }>;
}

// Type for the GenerativeModel class
interface GenerativeModel {
  generateContent: (prompt: string | ContentRequest) => Promise<{
    response: {
      text: () => string;
      candidates?: Array<{
        content?: {
          parts?: Array<{
            inlineData?: {
              mimeType: string;
              data: string;
            };
          }>;
        };
      }>;
    };
  }>;
}

// Type for generation config
interface GenerationConfig {
  model: string;
  generationConfig?: {
    responseModalities?: string[];
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

// Use type assertion for the imported module
const { GoogleGenerativeAI } = GenAI as {
  GoogleGenerativeAI: new (apiKey: string) => {
    getGenerativeModel: (options: GenerationConfig) => GenerativeModel;
  };
};

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API || "");

/**
 * Generate a summary of a publication using Gemini API
 */
export async function generateSummaryWithGemini(
  abstract: string
): Promise<AISummary> {
  try {
    if (!process.env.NEXT_PUBLIC_GEMINI_API) {
      throw new Error("Gemini API key not found");
    }

    // Get the model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // Create the prompt
    const prompt = `Analyze this scientific abstract and provide:
    1. A one-line summary
    2. 3-5 key findings
    3. The relevance to space missions
    4. Optional: any research gap areas

    Abstract: ${abstract}`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("No text generated from Gemini API");
    }

    // Extract the summary components from the text
    const oneLineSummary =
      extractSection(text, "one-line summary") ||
      "Research investigating effects of space environment on biological systems";

    const keyFindings = extractListItems(text, "key findings") || [
      "Significant changes observed in space conditions",
      "Adaptation mechanisms identified",
      "Implications for astronaut health",
    ];

    const missionRelevance =
      extractSection(text, "relevance to space missions") ||
      "This research has implications for long-duration space missions";

    const gapAreas = extractListItems(text, "research gap areas");

    return {
      oneLineSummary,
      keyFindings,
      missionRelevance,
      gapAreas,
    };
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    // Fallback to a simple summary
    return {
      oneLineSummary: `Analysis of ${abstract.substring(0, 30)}...`,
      keyFindings: ["Unable to generate AI summary", "Please try again later"],
      missionRelevance: "Relevance to space missions could not be determined",
    };
  }
}

/**
 * Extract a section from the generated text
 */
function extractSection(text: string, sectionName: string): string | null {
  const regex = new RegExp(
    `(?:${sectionName}|${sectionName.toUpperCase()})[:\\s]+(.*?)(?:\\n\\n|$)`,
    "is"
  );
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Extract list items from the generated text
 */
function extractListItems(
  text: string,
  sectionName: string
): string[] | undefined {
  const sectionRegex = new RegExp(
    `(?:${sectionName}|${sectionName.toUpperCase()})[:\\s]+([\\s\\S]*?)(?:\\n\\n|$)`,
    "i"
  );
  const sectionMatch = text.match(sectionRegex);

  if (!sectionMatch) return undefined;

  const sectionText = sectionMatch[1];
  const listItems = sectionText
    .split(/\n\s*[-*•]\s*/)
    .filter((item) => item.trim().length > 0);

  return listItems.length > 0 ? listItems : undefined;
}

/**
 * Perform semantic search using Gemini API
 */
export async function semanticSearchWithGemini(
  query: string,
  publications: Publication[]
): Promise<Publication[]> {
  try {
    if (!process.env.NEXT_PUBLIC_GEMINI_API) {
      throw new Error("Gemini API key not found");
    }

    // Get the model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // Create a list of publication IDs and their titles/abstracts for Gemini to rank
    const publicationData = publications.map((pub) => ({
      id: pub.id,
      title: pub.title,
      abstract:
        pub.abstract.substring(0, 200) +
        (pub.abstract.length > 200 ? "..." : ""),
    }));

    // Create the prompt
    const prompt = `Given the search query: "${query}"
      
    Rank these publications by relevance to the query. Return only a comma-separated list of publication IDs in order of relevance (most relevant first).
    
    Publications:
    ${publicationData
      .map(
        (pub) => `ID: ${pub.id}
    Title: ${pub.title}
    Abstract: ${pub.abstract}`
      )
      .join("\n\n")}`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("No text generated from Gemini API");
    }

    // Extract publication IDs from the response
    const idMatches = text.match(/pub-\d+/g) || [];
    const uniqueIds = [...new Set(idMatches)] as string[];

    // Map the IDs back to publications and maintain order
    const publicationMap = new Map(publications.map((pub) => [pub.id, pub]));
    const rankedPublications = uniqueIds
      .map((id) => publicationMap.get(id))
      .filter((pub) => pub !== undefined) as Publication[];

    // Add any publications not ranked by Gemini at the end
    const rankedIds = new Set(uniqueIds);
    const unrankedPublications = publications.filter(
      (pub) => !rankedIds.has(pub.id)
    );

    return [...rankedPublications, ...unrankedPublications];
  } catch (error) {
    console.error("Error performing semantic search with Gemini:", error);
    // Fallback to basic search
    return publications.filter(
      (pub) =>
        pub.title.toLowerCase().includes(query.toLowerCase()) ||
        pub.abstract.toLowerCase().includes(query.toLowerCase())
    );
  }
}

/**
 * Identify research gaps using Gemini API
 */
export async function identifyGapsWithGemini(
  publications: Publication[]
): Promise<ResearchGap[]> {
  try {
    if (!process.env.NEXT_PUBLIC_GEMINI_API) {
      throw new Error("Gemini API key not found");
    }

    // Get the model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // For demo purposes, analyze a sample of publications
    const sampleSize = Math.min(publications.length, 20);
    const samplePublications = publications.slice(0, sampleSize);

    // Create the prompt
    const prompt = `Analyze these space biology research publications and identify 5 research gaps or under-researched areas. For each gap, provide:
    1. The topic name
    2. A severity score from 0.0 to 1.0 (higher means more significant gap)
    3. 2-3 related topics
    4. A brief description of the gap
    
    Format your response as JSON with this structure:
    [
      {
        "topic": "string",
        "severity": number,
        "relatedTopics": ["string", "string"],
        "description": "string"
      }
    ]
    
    Publications:
    ${samplePublications
      .map(
        (pub) => `Title: ${pub.title}
    Abstract: ${pub.abstract.substring(0, 200)}...
    Topics: ${pub.topics.join(", ")}`
      )
      .join("\n\n")}`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("No text generated from Gemini API");
    }

    // Extract JSON from the response
    const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from Gemini response");
    }

    try {
      const parsedData = JSON.parse(jsonMatch[0]);
      // Validate and transform the parsed data to ensure it matches ResearchGap structure
      const gaps: ResearchGap[] = parsedData.map(
        (item: Record<string, unknown>) => ({
          topic: String(item.topic || ""),
          severity: Number(item.severity || 0),
          relatedTopics: Array.isArray(item.relatedTopics)
            ? item.relatedTopics.map((topic: unknown) => String(topic))
            : [],
          description: String(item.description || ""),
        })
      );
      return gaps;
    } catch (parseError) {
      console.error("Error parsing JSON from Gemini response:", parseError);
      throw new Error("Invalid JSON format in Gemini response");
    }
  } catch (error) {
    console.error("Error identifying gaps with Gemini:", error);
    // Fallback to simple gap analysis
    return [
      {
        topic: "Long-term radiation effects",
        severity: 0.9,
        relatedTopics: ["radiation protection", "DNA damage", "cancer risk"],
        description:
          "Limited research on cumulative effects of cosmic radiation during multi-year missions.",
      },
      {
        topic: "Artificial gravity countermeasures",
        severity: 0.8,
        relatedTopics: ["bone loss", "muscle atrophy", "vestibular system"],
        description:
          "Insufficient studies on partial gravity and rotating habitats as countermeasures.",
      },
      {
        topic: "Closed-loop life support systems",
        severity: 0.7,
        relatedTopics: [
          "bioregenerative systems",
          "waste recycling",
          "oxygen generation",
        ],
        description:
          "More research needed on fully sustainable life support for long-duration missions.",
      },
    ];
  }
}

/**
 * Generate an image using Gemini API
 */
export async function generateImageWithGemini(
  prompt: string
): Promise<string | null> {
  try {
    if (!process.env.NEXT_PUBLIC_GEMINI_API) {
      throw new Error("Gemini API key not found");
    }

    // Get the model with image generation capability
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
      },
    });

    // Generate content
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const response = await result.response;

    // Extract the image data if available
    const candidates = response.candidates || [];
    if (
      candidates.length > 0 &&
      candidates[0].content &&
      candidates[0].content.parts
    ) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image generated");
  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    return null;
  }
}
