import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X, Facebook, Twitter, Youtube, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdPlaceholder } from "@/components/news/AdPlaceholder";
import { useSubscribeNewsletterMutation } from "@/hooks/use-newsletter";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const categories = ["Politics", "Government", "Constitution", "Crime", "Economy", "World"];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-white">
      {/* Ticker */}
      <div className="bg-primary text-primary-foreground py-2 px-4 flex items-center overflow-hidden text-xs sm:text-sm font-semibold tracking-widest relative">
        <span className="shrink-0 mr-4 z-10 bg-primary pr-4 flex items-center h-full uppercase">
          <span className="animate-pulse w-2 h-2 rounded-full bg-white mr-2"></span>
          Breaking News
        </span>
        <div className="animate-marquee whitespace-nowrap opacity-90 font-medium">
          <span className="mx-4">Washington: New bipartisan bill proposed to protect digital speech</span>
          <span className="mx-4 text-white/50">•</span>
          <span className="mx-4">Economy: Small businesses report unexpected surge in Q3</span>
          <span className="mx-4 text-white/50">•</span>
          <span className="mx-4">Constitution: Landmark ruling reinforces 4th Amendment protections</span>
          <span className="mx-4 text-white/50">•</span>
          <span className="mx-4">Global: Historic peace agreement signed at Geneva summit</span>
        </div>
        {/* Gradient mask for smooth fade out */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none"></div>
      </div>

      {/* Header */}
      <header className="bg-navy text-navy-foreground shadow-2xl relative z-40 border-b-4 border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link href="/" className="group flex items-center gap-4">
              <img 
                src={`${import.meta.env.BASE_URL}images/logo.png`} 
                alt="We The People News Logo" 
                className="h-16 md:h-20 w-auto group-hover:scale-105 transition-transform duration-500 drop-shadow-md" 
              />
              <div className="flex flex-col">
                <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight text-white m-0 leading-none drop-shadow-lg">
                  WE THE PEOPLE <span className="text-primary">NEWS</span>
                </h1>
                <p className="text-xs md:text-sm text-gray-300 tracking-[0.2em] uppercase mt-1 font-semibold">
                  Independent. Unfiltered. Unapologetic.
                </p>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
               <AdPlaceholder width="468px" height="60px" className="hidden lg:flex bg-[#0A0F1D] border-gray-800 text-gray-600 shadow-inner" />
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="border-t border-gray-800 bg-navy/95 backdrop-blur-md sticky top-0 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex overflow-x-auto no-scrollbar py-1">
              <Link 
                href="/" 
                className={`px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap border-b-2 ${location === '/' ? 'text-white border-primary' : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'}`}
              >
                Latest
              </Link>
              {categories.map((category) => {
                const path = `/category/${category}`;
                const isActive = location === path;
                return (
                  <Link 
                    key={category} 
                    href={path} 
                    className={`px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap border-b-2 ${isActive ? 'text-white border-primary' : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'}`}
                  >
                    {category}
                  </Link>
                );
              })}
            </div>
            <div className="hidden md:flex items-center gap-4 text-gray-400">
              <Link href="/admin" className="hover:text-primary transition-colors"><Search className="w-5 h-5" /></Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-navy text-gray-300 mt-20 pt-16 border-t-8 border-primary relative overflow-hidden">
        {/* Background decorative image */}
        <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay">
          <img src={`${import.meta.env.BASE_URL}images/hero-bg.png`} alt="Decorative" className="w-full h-full object-cover" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-1">
              <Link href="/" className="inline-block mb-6">
                <h2 className="font-display text-2xl font-black text-white leading-none">
                  WE THE PEOPLE <span className="text-primary block mt-1">NEWS</span>
                </h2>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Dedicated to preserving the truth and providing unfiltered, independent journalism for the American people. Authored primarily by Don Matthews.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Youtube className="w-5 h-5" /></a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6 border-l-2 border-primary pl-3">Categories</h4>
              <ul className="space-y-3">
                {categories.map(c => (
                  <li key={c}><Link href={`/category/${c}`} className="text-gray-400 hover:text-primary transition-colors text-sm font-medium">{c}</Link></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6 border-l-2 border-primary pl-3">Company</h4>
              <ul className="space-y-3 text-sm font-medium text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/admin" className="hover:text-white transition-colors">Admin Portal</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Don</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6 border-l-2 border-primary pl-3">Support Truth</h4>
              <p className="text-sm text-gray-400 mb-4">Independent journalism relies on readers like you. We refuse corporate media buyouts.</p>
              <Button className="w-full bg-[#003087] hover:bg-[#001C54] text-white font-bold tracking-widest mb-4">
                SUPPORT VIA PAYPAL
              </Button>
              <Button variant="outline" className="w-full border-gray-700 text-white hover:bg-white hover:text-navy font-bold tracking-widest">
                BECOME A PATRON
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center mb-12">
            <AdPlaceholder width="728px" height="90px" className="bg-[#0A0F1D] border-gray-800 text-gray-600 hidden md:flex" />
          </div>
          
          <div className="border-t border-gray-800 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} We The People News. All rights reserved.</p>
            <p>Designed for the Free Press.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
