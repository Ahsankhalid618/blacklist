import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavbarComponent } from "@/components/NavbarComponent";
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
  description:
    "Explore NASA's space biology research publications with AI-powered search and visualizations",
};

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
          <header>
            <NavbarComponent />
          </header>

          {/* Main content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="border-t border-white/10 bg-black/20 backdrop-blur-lg">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-400">
                  © {new Date().getFullYear()} NASA Space Biology Publications
                  Dashboard
                </div>
                <div className="flex gap-4 text-sm text-gray-400">
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
