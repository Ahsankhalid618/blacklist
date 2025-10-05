"use client";

import { useState, useEffect } from "react";
import { BarChart2, PieChart, Network, TrendingDown } from "lucide-react";
import {
  Publication,
  YearlyStats,
  TopicDistribution as TopicDistributionType,
  ResearchGap,
} from "../../types/publication";
import {
  parsePublicationsCSV,
  calculateYearlyStats,
  calculateTopicDistribution,
  identifyResearchGaps,
} from "../../lib/dataProcessor";
import TimelineChart from "../../components/charts/TimelineChart";
import TopicDistribution from "../../components/charts/TopicDistribution";
import ResearchGaps from "../../components/charts/ResearchGaps";
import NetworkGraph from "../../components/charts/NetworkGraph";
import PublicationModal from "../../components/PublicationModal";

export default function VisualizationsPage() {
  // State for data
  const [publications, setPublications] = useState<Publication[]>([]);
  const [yearlyStats, setYearlyStats] = useState<YearlyStats[]>([]);
  const [topicDistribution, setTopicDistribution] = useState<
    TopicDistributionType[]
  >([]);
  const [researchGaps, setResearchGaps] = useState<ResearchGap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for selected publication
  const [selectedPublication, setSelectedPublication] =
    useState<Publication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for selected topic
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Load publications data
  useEffect(() => {
    const simulatePublications = async () => {
      setIsLoading(true);

      // Simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        // Use the sample data we created earlier
        const response = await fetch("/data/publications.csv");
        const csvData = await response.text();

        // Parse CSV data
        const pubs = await parsePublicationsCSV(csvData);
        setPublications(pubs);

        // Calculate stats
        const stats = calculateYearlyStats(pubs);
        setYearlyStats(stats);

        // Calculate topic distribution
        const topics = calculateTopicDistribution(pubs);
        setTopicDistribution(topics);

        // Identify research gaps
        const gaps = identifyResearchGaps(pubs);
        setResearchGaps(gaps);
      } catch (err) {
        console.error("Error simulating publications:", err);
        setError("Failed to load publications data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    simulatePublications();
  }, []);

  // Handle topic selection
  const handleTopicClick = (topic: string) => {
    setSelectedTopic(topic);

    // Find publications related to this topic
    const relatedPubs = publications.filter(
      (pub) => pub.topics && pub.topics.includes(topic)
    );

    if (relatedPubs.length > 0) {
      // Show the first related publication
      setSelectedPublication(relatedPubs[0]);
      setIsModalOpen(true);
    }
  };

  // Handle gap click
  const handleGapClick = (gap: ResearchGap) => {
    setSelectedTopic(gap.topic);

    // Find publications related to this gap
    const relatedPubs = publications.filter(
      (pub) => pub.topics && pub.topics.includes(gap.topic)
    );

    if (relatedPubs.length > 0) {
      // Show the first related publication
      setSelectedPublication(relatedPubs[0]);
      setIsModalOpen(true);
    }
  };

  // Handle publication selection
  const handlePublicationClick = (publication: Publication) => {
    setSelectedPublication(publication);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* Header section */}
      <div className="bg-slate-900 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Data Visualizations</h1>
          <p className="text-gray-400 mb-6">
            Interactive visualizations of NASA space biology research
            publications data.
          </p>

          {/* Visualization nav */}
          <div className="flex flex-wrap gap-4">
            <a
              href="#timeline"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
            >
              <BarChart2 size={18} />
              <span>Timeline</span>
            </a>
            <a
              href="#topics"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
            >
              <PieChart size={18} />
              <span>Topic Distribution</span>
            </a>
            <a
              href="#gaps"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
            >
              <TrendingDown size={18} />
              <span>Research Gaps</span>
            </a>
            <a
              href="#network"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
            >
              <Network size={18} />
              <span>Network Graph</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-400">Loading visualizations...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Timeline Chart */}
            <section id="timeline">
              <h2 className="text-2xl font-bold mb-6">Publication Timeline</h2>
              <TimelineChart data={yearlyStats} />

              <div className="mt-6 glass-card p-6">
                <h3 className="text-lg font-bold mb-4">Timeline Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Publication Trends</h4>
                    <p className="text-gray-300">
                      {yearlyStats.length > 0
                        ? `Publication output has ${
                            yearlyStats[yearlyStats.length - 1]
                              .publicationCount >
                            yearlyStats[0].publicationCount
                              ? "increased"
                              : "decreased"
                          } over time, with the highest number of publications (${Math.max(
                            ...yearlyStats.map((stat) => stat.publicationCount)
                          )}) in ${
                            yearlyStats.find(
                              (stat) =>
                                stat.publicationCount ===
                                Math.max(
                                  ...yearlyStats.map((s) => s.publicationCount)
                                )
                            )?.year
                          }.`
                        : "No timeline data available."}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Topic Evolution</h4>
                    <p className="text-gray-300">
                      The focus of research has evolved over time, with recent
                      years showing increased interest in
                      {yearlyStats.length > 0 &&
                      yearlyStats[yearlyStats.length - 1].topTopics.length > 0
                        ? ` ${yearlyStats[yearlyStats.length - 1].topTopics
                            .slice(0, 3)
                            .map((t) => t.topic)
                            .join(", ")}.`
                        : " various emerging topics."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Topic Distribution */}
            <section id="topics">
              <h2 className="text-2xl font-bold mb-6">Topic Distribution</h2>
              <TopicDistribution
                data={topicDistribution}
                onTopicClick={handleTopicClick}
              />

              <div className="mt-6 glass-card p-6">
                <h3 className="text-lg font-bold mb-4">Topic Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">
                      Dominant Research Areas
                    </h4>
                    <p className="text-gray-300">
                      {topicDistribution.length > 0
                        ? `The most researched topics are ${topicDistribution
                            .slice(0, 3)
                            .map((t) => t.topic)
                            .join(", ")}, accounting for ${Math.round(
                            (topicDistribution
                              .slice(0, 3)
                              .reduce((sum, t) => sum + t.count, 0) /
                              topicDistribution.reduce(
                                (sum, t) => sum + t.count,
                                0
                              )) *
                              100
                          )}% of all publications.`
                        : "No topic distribution data available."}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Topic Diversity</h4>
                    <p className="text-gray-300">
                      {topicDistribution.length > 0
                        ? `Research spans ${
                            topicDistribution.length
                          } distinct topics, with ${
                            topicDistribution.filter((t) => t.count === 1)
                              .length
                          } topics appearing in only a single publication.`
                        : "No topic diversity data available."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Research Gaps */}
            <section id="gaps">
              <h2 className="text-2xl font-bold mb-6">Research Gap Analysis</h2>
              <ResearchGaps data={researchGaps} onGapClick={handleGapClick} />

              <div className="mt-6 glass-card p-6">
                <h3 className="text-lg font-bold mb-4">
                  Gap Analysis Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">
                      Critical Research Needs
                    </h4>
                    <p className="text-gray-300">
                      {researchGaps.length > 0
                        ? `The most significant research gaps are in ${researchGaps
                            .slice(0, 2)
                            .map((g) => g.topic)
                            .join(
                              " and "
                            )}, which require further investigation for future space missions.`
                        : "No research gap data available."}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Funding Opportunities</h4>
                    <p className="text-gray-300">
                      These identified gaps represent potential funding
                      opportunities and areas where new research could have
                      significant impact on space biology knowledge.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Network Graph */}
            <section id="network">
              <h2 className="text-2xl font-bold mb-6">Publication Network</h2>
              <NetworkGraph
                publications={publications}
                onNodeClick={handlePublicationClick}
              />

              <div className="mt-6 glass-card p-6">
                <h3 className="text-lg font-bold mb-4">Network Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Research Clusters</h4>
                    <p className="text-gray-300">
                      Publications form distinct research clusters around key
                      topics, with some publications bridging multiple research
                      areas.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Collaboration Patterns</h4>
                    <p className="text-gray-300">
                      The network reveals collaboration patterns between
                      researchers and institutions, highlighting the
                      interdisciplinary nature of space biology research.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Publication modal */}
      {selectedPublication && (
        <PublicationModal
          publication={selectedPublication}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          relatedPublications={publications
            .filter(
              (p) =>
                p.id !== selectedPublication.id &&
                p.topics &&
                selectedPublication.topics &&
                (selectedTopic
                  ? p.topics.includes(selectedTopic)
                  : p.topics.some((t) =>
                      selectedPublication.topics!.includes(t)
                    ))
            )
            .slice(0, 3)}
        />
      )}
    </div>
  );
}
