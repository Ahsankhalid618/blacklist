"use client";

import GeminiTest from "../../components/GeminiTest";
import GeminiImageTest from "../../components/GeminiImageTest";

export default function TestGeminiPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gemini API Test Page</h1>
      <p className="mb-8 text-gray-300">
        This page allows you to test the Gemini API integration for both text
        and image generation.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Text Generation</h2>
          <GeminiTest />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Image Generation</h2>
          <GeminiImageTest />
        </div>
      </div>

      <div className="p-4 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-lg">
        <h3 className="font-bold mb-2">About the Gemini Integration</h3>
        <p>
          This implementation uses the official Google Generative AI SDK
          (@google/genai) to interact with the Gemini API. The SDK provides a
          more streamlined way to work with Gemini models compared to direct API
          calls.
        </p>
        <p className="mt-2">
          For more details, check the{" "}
          <a
            href="https://github.com/google/generative-ai-js"
            className="underline hover:text-white"
          >
            official documentation
          </a>
          .
        </p>
      </div>
    </div>
  );
}
