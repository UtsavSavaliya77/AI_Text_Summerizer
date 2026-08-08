"use client";

import React, { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/dashboard/history?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <header
      className="glass-nav px-4 lg:px-8 py-3.5 flex items-center justify-between lg:ml-64"
      style={{ position: 'sticky', top: 0, zIndex: 40 }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors mr-2 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-[#808080]" />
      </button>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="relative w-64 lg:w-80 hidden sm:block">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808080]" />
        <input
          type="text"
          placeholder="Search summaries…"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl outline-none transition-all placeholder:text-[#606060]"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#fff',
            backdropFilter: 'blur(12px)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(255,255,255,0.06)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.boxShadow   = 'none';
          }}
        />
      </form>

      {/* Spacer — keep end aligned */}
      <div />
    </header>
  );
}