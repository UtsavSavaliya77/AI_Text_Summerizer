"use client";

import React, { useState, useRef} from 'react';
import { Menu, Search, User, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  
  const [searchVal, setSearchVal] = useState('');
  // Close menus when clicking outside

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/dashboard/history?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <header className="glass-nav px-4 lg:px-8 py-4 flex items-center justify-between ml-0 lg:ml-64 relative z-40">
      {/* Mobile Hamburger menu */}
      <button 
        onClick={onMenuClick}
        className="p-2 hover:bg-slate-100 rounded-full mr-2 lg:hidden transition-colors"
      >
        <Menu className="w-5 h-5 text-slate-600" />
      </button>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative w-72 lg:w-96 hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search summaries..." 
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border-none rounded-full focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
        />
      </form>
    </header>
  );
}