import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  BookOpen,
  BarChart2,
  Lightbulb,
} from "lucide-react";
import { loadPublications } from "../lib/dataService";
import { PublicationSummary } from "../types/publication";

// Stat Card Component
const StatCard = ({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) => (
  <div className="glass-card p-6 flex flex-col">
    <h3 className="text-sm font-medium text-blue-300">{title}</h3>
    <p className="text-3xl font-bold mt-1">{value}</p>
    <p className="text-sm text-gray-300 mt-2">{description}</p>
  </div>
);

// Feature Card Component
const FeatureCard = ({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}) => (
  <Link
    href={href}
    className="glass-card p-6 hover:bg-white/10 transition-all hover:scale-[1.02] flex flex-col"
  >
    <div className="rounded-full bg-blue-500/20 w-12 h-12 flex items-center justify-center mb-4">
      <Icon className="text-blue-300" size={24} />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-300">{description}</p>
    <div className="mt-4 flex items-center text-blue-300 font-medium">
      <span>Explore</span>
      <ArrowRight size={16} className="ml-1" />
    </div>
  </Link>
);

export default async function Home() {
  const publicationsRaw = await loadPublications();
  const publications: PublicationSummary[] = publicationsRaw.map((p: any) => ({
    id: p.id || p.pmcid || p.doi, // Use pmcid or doi as fallback ID
    title: p.title,
    authors: p.authors,
    year: p.year || parseInt(p.publicationDate?.split(' ')[0]) || new Date().getFullYear(),
    topics: p.topics || [],
    abstract: p.abstract,
    fullTextAvailable: p.fullTextAvailable,
  }));
  
  // Calculate stats from actual data
  const stats = {
    totalPubs: publications.length,
    yearRange: (() => {
      const years = publications
        .map(p => p.year)
        .filter(year => !isNaN(year) && year > 1900 && year <= new Date().getFullYear());
    
      if (years.length === 0) return 'N/A';
    
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
    
      return minYear === maxYear ? minYear.toString() : `${minYear}-${maxYear}`;
    })(),
    topics: new Set(publications.flatMap(p => p.topics)).size,
    fullTextAvailable: publications.filter(p => p.fullTextAvailable).length
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden animated-gradient py-24 sm:py-32">
        {/* Animated stars/particles effect */}
        <div className="absolute inset-0 z-0 opacity-30">
          {/* This would be enhanced with a proper particles library in production */}
          <div className="absolute h-2 w-2 rounded-full bg-white top-[10%] left-[15%] animate-pulse"></div>
          <div className="absolute h-1 w-1 rounded-full bg-white top-[20%] left-[25%] animate-pulse"></div>
          <div className="absolute h-3 w-3 rounded-full bg-white top-[15%] left-[85%] animate-pulse"></div>
          <div className="absolute h-2 w-2 rounded-full bg-white top-[45%] left-[75%] animate-pulse"></div>
          <div className="absolute h-1 w-1 rounded-full bg-white top-[65%] left-[35%] animate-pulse"></div>
          <div className="absolute h-2 w-2 rounded-full bg-white top-[75%] left-[85%] animate-pulse"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300">
              NASA Space Biology Publications Dashboard
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Explore {stats.totalPubs} space biology research publications with AI-powered
              search, visualization, and summarization tools
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto mb-10">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search publications, topics, or authors..."
                  className="w-full py-3 px-5 pl-12 rounded-full bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2 justify-center">
                <button className="text-xs bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 transition-colors">
                  microgravity
                </button>
                <button className="text-xs bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 transition-colors">
                  bone loss
                </button>
                <button className="text-xs bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 transition-colors">
                  plants
                </button>
                <button className="text-xs bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 transition-colors">
                  radiation
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium transition-all"
              >
                Explore Dashboard
              </Link>
              <Link
                href="/search"
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition-all"
              >
                Advanced Search
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-10 text-center">
            Research at a Glance
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Publications"
              value={stats.totalPubs.toString()}
              description="Peer-reviewed space biology research papers"
            />
            <StatCard
              title="Publication Range"
              value={stats.yearRange}
              description="Years of space biology research"
            />
            <StatCard
              title="Research Topics"
              value={stats.topics.toString()}
              description="Distinct research areas and disciplines"
            />
            <StatCard
              title="Full Text Available"
              value={stats.fullTextAvailable.toString()}
              description="Publications with full text access"
            />
          </div>
        </div>
      </section>

      {/* Recent Publications Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8">Recent Publications</h2>
        <div className="grid gap-6">
          {publications.slice(0, 5).map((pub: PublicationSummary) => (
            <div key={pub.id} className="glass-card p-6">
              <h3 className="font-bold text-lg mb-2">{pub.title}</h3>
              <p className="text-sm text-gray-300 mb-2">{pub.authors.join(', ')}</p>
              <p className="text-sm text-gray-400">{pub.year}</p>
              {pub.abstract && (
                <p className="mt-4 text-gray-300 line-clamp-2">{pub.abstract}</p>
              )}
              {pub.id && (
                <a 
                  href={`/publications/${pub.id}`}
                  className="mt-4 text-blue-400 hover:text-blue-300 inline-flex items-center"
                >
                  View Publication <ArrowRight size={16} className="ml-1" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-indigo-950">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-10 text-center">
            Explore the Dashboard
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="Publication Dashboard"
              description="Browse, filter, and search through all 608 space biology publications with advanced filtering options."
              icon={BookOpen}
              href="/dashboard"
            />
            <FeatureCard
              title="Data Visualizations"
              description="Interactive charts and graphs showing research trends, topic distribution, and publication patterns."
              icon={BarChart2}
              href="/visualizations"
            />
            <FeatureCard
              title="AI Insights"
              description="AI-generated summaries, research gap analysis, and recommendations for future research directions."
              icon={Lightbulb}
              href="/insights"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-900 to-indigo-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to explore space biology research?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover groundbreaking findings, identify research opportunities,
            and explore the fascinating world of biology in space.
          </p>
          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-full bg-white text-indigo-900 font-medium hover:bg-blue-50 transition-colors inline-flex items-center"
          >
            Get Started <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </section>
    </>
  );
}
