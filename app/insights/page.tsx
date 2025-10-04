'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, TrendingDown, Zap, ArrowRight } from 'lucide-react';
import { Publication, ResearchGap } from '../../types/publication';
import { parsePublicationsCSV } from '../../lib/dataProcessor';
import { extractInsights, identifyGaps } from '../../lib/aiService';
import ResearchGaps from '../../components/charts/ResearchGaps';
import PublicationModal from '../../components/PublicationModal';
import StatCard from '../../components/StatCard';

export default function InsightsPage() {
  // State for data
  const [publications, setPublications] = useState<Publication[]>([]);
  const [insights, setInsights] = useState<Record<string, string>>({});
  const [researchGaps, setResearchGaps] = useState<ResearchGap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for selected publication
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Load publications data and generate insights
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Use the sample data we created earlier
        const response = await fetch('/data/publications.csv');
        const csvData = await response.text();
        
        // Parse CSV data
        const pubs = await parsePublicationsCSV(csvData);
        setPublications(pubs);
        
        // Generate insights
        const extractedInsights = await extractInsights(pubs);
        setInsights(extractedInsights);
        
        // Identify research gaps
        const gaps = await identifyGaps(pubs);
        setResearchGaps(gaps);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data and generate insights. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Handle gap click
  const handleGapClick = (gap: ResearchGap) => {
    // Find publications related to this gap
    const relatedPubs = publications.filter(pub => pub.topics.includes(gap.topic));
    
    if (relatedPubs.length > 0) {
      // Show the first related publication
      setSelectedPublication(relatedPubs[0]);
      setIsModalOpen(true);
    }
  };
  
  // Get insight cards
  const getInsightCards = () => {
    if (Object.keys(insights).length === 0) {
      return null;
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-blue-500/20 p-2 mr-3">
              <Lightbulb size={20} className="text-blue-300" />
            </div>
            <h3 className="text-lg font-bold">Research Overview</h3>
          </div>
          <div className="space-y-4">
            <p className="text-gray-300">{insights.timespan}</p>
            <p className="text-gray-300">{insights.topicFocus}</p>
            <p className="text-gray-300">{insights.organisms}</p>
          </div>
        </div>
        
        <div className="glass-card p-6">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-purple-500/20 p-2 mr-3">
              <TrendingDown size={20} className="text-purple-300" />
            </div>
            <h3 className="text-lg font-bold">Research Gaps</h3>
          </div>
          <div className="space-y-4">
            <p className="text-gray-300">{insights.gaps}</p>
            <p className="text-gray-300">{insights.recommendations}</p>
          </div>
        </div>
      </div>
    );
  };
  
  // Get recommendations
  const getRecommendations = () => {
    if (researchGaps.length === 0) {
      return null;
    }
    
    return (
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold mb-6">Research Recommendations</h3>
        
        <div className="space-y-6">
          {researchGaps.slice(0, 3).map((gap, index) => (
            <div key={index} className="flex">
              <div className="rounded-full bg-amber-500/20 w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1 mr-4">
                <span className="text-amber-300 font-bold">{index + 1}</span>
              </div>
              <div>
                <h4 className="font-bold mb-1">{gap.topic}</h4>
                <p className="text-gray-300 mb-2">{gap.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {gap.relatedTopics.map((topic, i) => (
                    <span 
                      key={i}
                      className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleGapClick(gap)}
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                >
                  View related publications
                  <ArrowRight size={14} className="ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen">
      {/* Header section */}
      <div className="bg-slate-900 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">AI-Generated Insights</h1>
          <p className="text-gray-400 mb-6">
            Discover patterns, trends, and research gaps in NASA space biology publications.
          </p>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Publications Analyzed"
              value={publications.length}
              description="Total publications in the dataset"
              icon={Lightbulb}
            />
            <StatCard
              title="Research Topics"
              value={new Set(publications.flatMap(pub => pub.topics)).size}
              description="Unique research areas identified"
              icon={Zap}
            />
            <StatCard
              title="Research Gaps"
              value={researchGaps.length}
              description="Under-researched areas identified"
              icon={TrendingDown}
            />
            <StatCard
              title="Year Range"
              value={publications.length > 0 ? `${Math.min(...publications.map(p => p.year))}-${Math.max(...publications.map(p => p.year))}` : 'N/A'}
              description="Publication year span"
            />
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-400">Generating AI insights...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-6">Key Insights</h2>
              {getInsightCards()}
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-6">Research Gap Analysis</h2>
              <ResearchGaps 
                data={researchGaps}
                onGapClick={handleGapClick}
              />
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-6">Recommendations for Future Research</h2>
              {getRecommendations()}
            </section>
            
            <section>
              <div className="glass-card p-6 text-center">
                <h3 className="text-xl font-bold mb-4">Want to dive deeper?</h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Explore the publications dashboard to search through all 608 publications, or check out the visualizations page for interactive data exploration.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a 
                    href="/dashboard" 
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium transition-all flex items-center"
                  >
                    Explore Dashboard
                    <ArrowRight size={18} className="ml-2" />
                  </a>
                  <a 
                    href="/visualizations" 
                    className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition-all"
                  >
                    View Visualizations
                  </a>
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
            .filter(p => 
              p.id !== selectedPublication.id && 
              p.topics.some(t => selectedPublication.topics.includes(t))
            )
            .slice(0, 3)
          }
        />
      )}
    </div>
  );
}
