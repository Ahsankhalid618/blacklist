import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LucideIcon, Moon, Sun, Search, BarChart2, BookOpen, Home, Lightbulb } from "lucide-react";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NASA Space Biology Publications Dashboard",
  description: "Explore NASA's space biology research publications with AI-powered search and visualizations",
};

// Navigation items
const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: BookOpen },
  { name: 'Visualizations', href: '/visualizations', icon: BarChart2 },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Insights', href: '/insights', icon: Lightbulb },
];

// NavItem component
const NavItem = ({ 
  name, 
  href, 
  icon: Icon 
}: { 
  name: string; 
  href: string; 
  icon: LucideIcon;
}) => (
  <Link 
    href={href} 
    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
  >
    <Icon size={18} />
    <span>{name}</span>
  </Link>
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-slate-900 to-indigo-950 text-white min-h-screen`}
      >
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-50 backdrop-blur-lg bg-black/20 border-b border-white/10">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="font-bold text-white">SB</span>
                </div>
                <span className="font-bold text-lg hidden sm:inline">NASA Space Biology</span>
              </div>
              
              <nav className="hidden md:flex items-center gap-4">
                {navItems.map((item) => (
                  <NavItem key={item.name} {...item} />
                ))}
              </nav>
              
              <div className="flex items-center gap-2">
                <button 
                  className="p-2 rounded-full hover:bg-white/10 transition-colors" 
                  aria-label="Toggle dark mode"
                >
                  <Moon size={20} className="hidden dark:block" />
                  <Sun size={20} className="block dark:hidden" />
                </button>
                
                <button 
                  className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Toggle menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" x2="20" y1="12" y2="12"></line>
                    <line x1="4" x2="20" y1="6" y2="6"></line>
                    <line x1="4" x2="20" y1="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </header>
          
          {/* Mobile navigation - hidden by default */}
          <div className="hidden md:hidden fixed inset-0 z-40 bg-black/90 p-4">
            <div className="flex justify-end">
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-2 mt-8">
              {navItems.map((item) => (
                <NavItem key={item.name} {...item} />
              ))}
            </nav>
          </div>
          
          {/* Main content */}
          <main className="flex-1">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="border-t border-white/10 bg-black/20 backdrop-blur-lg">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-400">
                  © {new Date().getFullYear()} NASA Space Biology Publications Dashboard
                </div>
                <div className="flex gap-4 text-sm text-gray-400">
                  <a href="#" className="hover:text-white transition-colors">About</a>
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms</a>
                  <a href="#" className="hover:text-white transition-colors">Contact</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
