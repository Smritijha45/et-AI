import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Shield, LayoutDashboard, Share2, Users, FileSearch } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Network Graph', path: '/graph', icon: Share2 },
    { name: 'Communities', path: '/communities', icon: Users },
    { name: 'Intel Packet', path: '/intelligence', icon: FileSearch }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-pink-500 shadow-md shadow-indigo-600/30">
            <Shield className="w-5 h-5 text-white" />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-indigo-600 to-pink-500 blur opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
          </div>
          <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            et-AI <span className="font-light text-slate-400">GraphIntel</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1 md:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
