"use client";

import { useState } from "react";
import { generateSummary } from "../lib/aiService";
import { AISummary } from "../types/publication";

export default function GeminiTest() {
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateSummary(input);
      setSummary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold mb-4">Gemini API Test</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="abstract" className="block text-sm font-medium mb-2">
            Enter abstract text:
          </label>
          <textarea
            id="abstract"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-3 bg-slate-800 border border-white/20 rounded-lg"
            rows={5}
            placeholder="Enter a scientific abstract to summarize..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {isLoading ? "Generating..." : "Generate Summary"}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg mb-4">
          {error}
        </div>
      )}

      {summary && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">
              One-Line Summary
            </h3>
            <p className="text-lg">{summary.oneLineSummary}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">
              Key Findings
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              {summary.keyFindings.map((finding, index) => (
                <li key={index}>{finding}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">
              Mission Relevance
            </h3>
            <p>{summary.missionRelevance}</p>
          </div>

          {summary.gapAreas && summary.gapAreas.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">
                Research Gap Areas
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                {summary.gapAreas.map((gap, index) => (
                  <li key={index}>{gap}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>
          Note: Make sure you have set the GEMINI_API_KEY environment
          variable in your .env.local file.
        </p>
        <p>
          Current API key status:{" "}
          {process.env.GEMINI_API_KEY ? "Set ✅" : "Not set ❌"}
        </p>
      </div>
    </div>
  );
}
