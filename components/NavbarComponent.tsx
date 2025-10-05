"use client";

import {
  Navbar,
  NavBody,
  
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { Search, BarChart2, BookOpen, Home, Lightbulb } from "lucide-react";
import Link from "next/link";

// Navigation items defined inside the client component
const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: BookOpen },
  { name: "Visualizations", href: "/visualizations", icon: BarChart2 },
  { name: "Search", href: "/search", icon: Search },
  { name: "Insights", href: "/insights", icon: Lightbulb },
];

export function NavbarComponent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <div className="flex items-center justify-center space-x-2">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={`desktop-link-${idx}`}
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-4">
            
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={`mobile-link-${idx}`}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="flex w-full flex-col gap-4 p-4">
              <NavbarButton variant="secondary" className="w-full">
                <button
                  className="w-full p-2 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  Toggle Theme
                </button>
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
