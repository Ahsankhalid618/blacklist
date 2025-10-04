"use client";

import { useState } from "react";
import {
  X,
  BookOpen,
  Calendar,
  Users,
  Tag,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
} from "lucide-react";
import { Publication, AISummary } from "../types/publication";
import { formatAuthors, formatDOI } from "../lib/utils";

interface PublicationModalProps {
  publication: Publication;
  isOpen: boolean;
  onClose: () => void;
  onBookmarkToggle?: (publication: Publication, isBookmarked: boolean) => void;
  isBookmarked?: boolean;
  aiSummary?: AISummary;
  relatedPublications?: Publication[];
}

export default function PublicationModal({
  publication,
  isOpen,
  onClose,
  onBookmarkToggle,
  isBookmarked = false,
  aiSummary,
  relatedPublications = [],
}: PublicationModalProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [activeTab, setActiveTab] = useState<
    "details" | "ai-summary" | "related"
  >("details");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Handle bookmark toggle
  const handleBookmarkToggle = () => {
    const newBookmarkedState = !bookmarked;
    setBookmarked(newBookmarkedState);

    if (onBookmarkToggle) {
      onBookmarkToggle(publication, newBookmarkedState);
    }
  };

  // Handle citation copy
  const handleCopyCitation = () => {
    // Format citation in APA style
    const citation = `${publication.authors.join(", ")} (${
      publication.year
    }). ${publication.title}. ${publication.journal}${
      publication.volume ? `, ${publication.volume}` : ""
    }${publication.issue ? `(${publication.issue})` : ""}${
      publication.pages ? `, ${publication.pages}` : ""
    }. ${publication.doi ? `https://doi.org/${publication.doi}` : ""}`;

    navigator.clipboard.writeText(citation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-slate-900 border border-white/10 shadow-xl">
        {/* Modal header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-slate-900">
          <h2 className="text-xl font-bold truncate">{publication.title}</h2>
          <div className="flex items-center gap-2">
            {onBookmarkToggle && (
              <button
                onClick={handleBookmarkToggle}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
              >
                {bookmarked ? (
                  <BookmarkCheck size={20} className="text-blue-400" />
                ) : (
                  <Bookmark size={20} className="text-gray-400" />
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal tabs */}
        <div className="flex border-b border-white/10">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "details"
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("details")}
          >
            Publication Details
          </button>
          {aiSummary && (
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "ai-summary"
                  ? "border-b-2 border-blue-500 text-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("ai-summary")}
            >
              AI Summary
            </button>
          )}
          {relatedPublications.length > 0 && (
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "related"
                  ? "border-b-2 border-blue-500 text-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("related")}
            >
              Related Publications
            </button>
          )}
        </div>

        {/* Modal content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === "details" && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                <div className="flex items-center">
                  <Users size={16} className="mr-2" />
                  <span>{publication.authors.join(", ")}</span>
                </div>

                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  <span>{publication.year}</span>
                </div>

                {publication.journal && (
                  <div className="flex items-center">
                    <BookOpen size={16} className="mr-2" />
                    <span>
                      {publication.journal}
                      {publication.volume && `, ${publication.volume}`}
                      {publication.issue && `(${publication.issue})`}
                      {publication.pages && `, ${publication.pages}`}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Abstract
                </h3>
                <p className="text-gray-200 whitespace-pre-line">
                  {publication.abstract}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {publication.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center bg-blue-500/10 text-blue-300 rounded-full px-3 py-1 text-sm"
                    >
                      <Tag size={12} className="mr-1" />
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {publication.organisms && publication.organisms.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Organisms
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {publication.organisms.map((organism, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center bg-green-500/10 text-green-300 rounded-full px-3 py-1 text-sm"
                      >
                        {organism}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {publication.experimentType &&
                publication.experimentType.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      Experiment Types
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {publication.experimentType.map((type, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center bg-purple-500/10 text-purple-300 rounded-full px-3 py-1 text-sm"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {(publication.mission || publication.platform) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Mission Information
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {publication.mission && (
                      <div>
                        <span className="text-gray-400">Mission:</span>{" "}
                        {publication.mission}
                      </div>
                    )}
                    {publication.platform && (
                      <div>
                        <span className="text-gray-400">Platform:</span>{" "}
                        {publication.platform}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
                {publication.doi && (
                  <a
                    href={formatDOI(publication.doi)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-400 hover:underline"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    View original publication
                  </a>
                )}

                <button
                  onClick={handleCopyCitation}
                  className="flex items-center text-gray-300 hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="mr-2 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="mr-2" />
                      Copy citation
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === "ai-summary" && aiSummary && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-medium text-blue-300 mb-4">
                  One-Line Summary
                </h3>
                <p className="text-lg">{aiSummary.oneLineSummary}</p>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-medium text-blue-300 mb-4">
                  Key Findings
                </h3>
                <ul className="space-y-2">
                  {aiSummary.keyFindings.map((finding, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex-shrink-0 flex items-center justify-center mr-2 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-medium text-blue-300 mb-4">
                  Mission Relevance
                </h3>
                <p>{aiSummary.missionRelevance}</p>
              </div>

              {aiSummary.gapAreas && aiSummary.gapAreas.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-lg font-medium text-blue-300 mb-4">
                    Research Gap Areas
                  </h3>
                  <ul className="space-y-2">
                    {aiSummary.gapAreas.map((gap, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex-shrink-0 flex items-center justify-center mr-2 mt-0.5">
                          !
                        </span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-center text-sm text-gray-400">
                <p>
                  AI-generated summary based on the publication abstract. May
                  contain inaccuracies.
                </p>
              </div>
            </div>
          )}

          {activeTab === "related" && (
            <div className="space-y-6">
              <p className="text-sm text-gray-400">
                Publications related by topic or citation:
              </p>

              <div className="space-y-4">
                {relatedPublications.map((pub) => (
                  <div
                    key={pub.id}
                    className="glass-card p-4 hover:bg-white/5 cursor-pointer"
                  >
                    <h3 className="font-medium mb-1">{pub.title}</h3>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-300">
                      <span>{formatAuthors(pub.authors, 2)}</span>
                      <span>•</span>
                      <span>{pub.year}</span>
                      {pub.journal && (
                        <>
                          <span>•</span>
                          <span>{pub.journal}</span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {pub.topics.slice(0, 3).map((topic, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center bg-blue-500/10 text-blue-300 rounded-full px-2 py-0.5 text-xs"
                        >
                          {topic}
                        </span>
                      ))}
                      {pub.topics.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{pub.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {relatedPublications.length === 0 && (
                  <p className="text-center text-gray-400 py-8">
                    No related publications found.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
