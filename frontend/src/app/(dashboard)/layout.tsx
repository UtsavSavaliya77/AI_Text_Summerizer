"use client";

import React, { useState } from 'react';
import { Sidebar } from '../../components/dashboard/sidebar';
import { Navbar }  from '../../components/dashboard/navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090909]">
      <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      <Navbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
      <main className="lg:ml-64 p-4 lg:p-8 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}