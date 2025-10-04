# Gemini API Integration Guide

This document explains how to use the Google Gemini API integration in the NASA Space Biology Publications Dashboard.

## Setup

1. **Get a Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Create an account if you don't have one
   - Create a new API key in the API section

2. **Set Environment Variable**
   - Create a `.env.local` file in the project root
   - Add your API key: `NEXT_PUBLIC_GEMINI_API=your_api_key_here`
   - Restart the development server if it's running

3. **Required Dependencies**
   - The project uses the official Google Generative AI SDK
   - Dependencies are already installed:
     - `@google/genai` - Official Gemini SDK
     - `mime` - For handling MIME types in image generation

4. **Next.js Configuration**
   - The project requires special configuration for the Gemini SDK
   - In `next.config.js`, we've added:
     ```js
     transpilePackages: ["@google/generative-ai"]
     ```
   - This ensures Next.js properly transpiles the SDK for browser compatibility

## Testing the Integration

Visit `/test-gemini` in your browser to test the Gemini API integration. This page allows you to:

- **Text Generation**:
  - Enter a scientific abstract
  - Generate an AI summary using Gemini
  - See the results including one-line summary, key findings, and mission relevance

- **Image Generation**:
  - Enter a prompt describing an image
  - Generate an image using Gemini's image generation capabilities
  - View and save the generated image

## Features Using Gemini

The Gemini API is used for four main features:

1. **AI-Powered Summaries**
   - Generates concise summaries of scientific abstracts
   - Extracts key findings and mission relevance
   - Identifies potential research gaps

2. **Semantic Search**
   - Provides more intelligent search results beyond keyword matching
   - Ranks publications based on semantic relevance to the query

3. **Research Gap Analysis**
   - Analyzes the dataset to identify under-researched areas
   - Provides severity scores and related topics for each gap

4. **Image Generation**
   - Creates space-themed visualizations based on text prompts
   - Useful for generating concept art for research topics

## Implementation Details

- `lib/geminiService.ts` contains the Gemini API integration using the official SDK
- `lib/aiService.ts` uses the Gemini service with fallbacks to simulated responses
- All API calls include error handling and fallbacks for robustness
- The implementation uses the latest Gemini 1.5 Flash model

## SDK vs Direct API

This implementation uses the official Google Generative AI SDK (`@google/genai`) rather than direct API calls. Benefits include:

- Simpler authentication and request handling
- Built-in streaming support
- Type safety and better error handling
- Official support from Google

## Troubleshooting

If you encounter issues with the Gemini API:

1. Check that your API key is correctly set in `.env.local`
2. Verify you have internet connectivity
3. Check the browser console for specific error messages
4. The application will fall back to simulated responses if the API fails
5. For image generation issues, try simpler prompts or check if your API key has image generation permissions
6. If you get "Module not found: Can't resolve '@google/generative-ai'" error:
   - Ensure the package is installed: `npm install @google/generative-ai`
   - Verify `transpilePackages: ["@google/generative-ai"]` is in your `next.config.js`
   - Clear the Next.js cache: `rm -rf .next` and rebuild

## API Usage Considerations

- The Gemini API has rate limits and usage quotas
- For production use, implement proper caching and rate limiting
- Consider pre-generating summaries for frequently accessed publications
- Image generation may have additional usage restrictions
