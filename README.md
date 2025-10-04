# NASA Space Biology Publications Dashboard

A dynamic web dashboard that helps users explore NASA space biology research publications using AI-powered search, visualization, and summarization tools.

![NASA Space Biology Publications Dashboard](https://via.placeholder.com/1200x600/0a0a1a/38bdf8?text=NASA+Space+Biology+Publications+Dashboard)

## 🚀 Project Overview

This dashboard was built for a hackathon to provide an intuitive interface for exploring 608 NASA space biology research publications. It helps scientists, managers, and mission planners discover relevant research, identify trends, and find research gaps.

### Target Users
- **Scientists** generating hypotheses
- **Managers** identifying investment opportunities
- **Mission planners** for Moon/Mars exploration

### Core Features
1. 🔍 **AI-powered semantic search** through publications
2. 📊 **Interactive data visualizations** (timeline, topic distribution, trends)
3. 🧩 **Topic clustering and categorization**
4. 🤖 **AI-generated summaries** of key findings
5. 🔎 **Smart filtering** (by year, topic, organism, experiment type)
6. 📉 **Gap analysis** showing under-researched areas
7. 📱 **Responsive, modern UI** with dark mode support

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **UI Components**: Custom components with shadcn/ui inspiration
- **Data Visualization**: Recharts
- **Data Processing**: PapaParse for CSV processing
- **AI Integration**: OpenAI API (simulated for demo)
- **Icons**: Lucide React

## 🚀 Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Publications dashboard
│   ├── insights/           # AI-generated insights
│   ├── search/             # Search interface
│   ├── visualizations/     # Data visualizations
│   ├── layout.tsx          # Root layout with navigation
│   └── page.tsx            # Homepage
├── components/             # Reusable UI components
│   ├── charts/             # Visualization components
│   ├── AISummary.tsx       # AI summary component
│   ├── FilterSidebar.tsx   # Filtering component
│   ├── PublicationCard.tsx # Publication display
│   ├── PublicationModal.tsx # Detailed publication view
│   ├── SearchBar.tsx       # Search interface
│   └── StatCard.tsx        # Statistics display
├── data/                   # Data files
│   └── publications.csv    # Sample publication data
├── lib/                    # Utility functions
│   ├── aiService.ts        # AI integration
│   ├── dataProcessor.ts    # Data processing utilities
│   └── utils.ts            # Helper functions
└── types/                  # TypeScript type definitions
    └── publication.ts      # Publication data types
```

## 🔍 Features in Detail

### Dashboard
- Browse and filter publications
- View publication details
- Bookmark interesting papers

### Visualizations
- Timeline of publications over years
- Topic distribution visualization
- Research gap analysis
- Publication network graph

### AI-Powered Search
- Semantic search for natural language queries
- Regular keyword search
- Search history tracking

### AI Insights
- AI-generated summaries of publications
- Research gap identification
- Recommendations for future research

## 🌐 Deployment

The application can be deployed on Vercel or any other platform that supports Next.js applications.

```bash
npm run build
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Data source: [NASA Space Biology Publications](https://github.com/jgalazka/SB_publications/tree/main)
- Built with Next.js, TailwindCSS, and Recharts
