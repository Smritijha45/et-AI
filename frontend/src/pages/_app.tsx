import React from 'react';
import type { AppProps } from 'next/app';
import Navbar from '../components/Navbar';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-600/30 selection:text-indigo-200">
      {/* Global Background Glow Accents */}
      <div className="glow-blur w-[600px] h-[600px] bg-indigo-600/10 top-[-200px] left-[-200px]" />
      <div className="glow-blur w-[600px] h-[600px] bg-pink-500/5 bottom-[-200px] right-[-200px]" />

      <Navbar />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-6 py-8 relative z-10">
        <Component {...pageProps} />
      </main>
      
      <footer className="border-t border-slate-900 bg-slate-950/40 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          © 2026 et-AI GraphIntel. Module 3 Fraud Network Graph Analyzer.
        </div>
      </footer>
    </div>
  );
}
