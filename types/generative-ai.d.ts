declare module "@google/generative-ai" {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);

    getGenerativeModel(options: {
      model: string;
      generationConfig?: {
        responseModalities?: string[];
        temperature?: number;
        topK?: number;
        topP?: number;
        maxOutputTokens?: number;
      };
    }): GenerativeModel;
  }

  export interface GenerativeModel {
    generateContent(
      prompt: string | GenerateContentRequest
    ): Promise<GenerateContentResult>;
    generateContentStream(
      request: GenerateContentRequest
    ): AsyncIterable<GenerateContentResponse>;
  }

  export interface GenerateContentRequest {
    contents: Content[];
    generationConfig?: GenerationConfig;
  }

  export interface Content {
    role?: string;
    parts: Part[];
  }

  export interface Part {
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }

  export interface GenerationConfig {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    responseModalities?: string[];
  }

  export interface GenerateContentResult {
    response: ContentResponse;
  }

  export interface ContentResponse {
    text(): string;
    candidates?: Candidate[];
  }

  export interface GenerateContentResponse {
    candidates?: Candidate[];
    text?: string;
  }

  export interface Candidate {
    content?: {
      parts?: Part[];
    };
  }
}
