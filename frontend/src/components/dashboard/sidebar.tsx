"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  PlusCircle,
  MessageSquare,
  X,
  User,
  ChevronUp,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/auth-store';

const navItems = [
  { name: 'Dashboard',   href: '/dashboard',           icon: LayoutDashboard },
  { name: 'New Summary', href: '/dashboard/summarize', icon: PlusCircle },
  { name: 'History',     href: '/dashboard/history',   icon: History },
  { name: 'AI Chat',     href: '/dashboard/chat',      icon: MessageSquare },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const user     = useAuthStore((state) => state.user);
  const logout   = useAuthStore((state) => state.logout);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    router.push('/login');
  };

  const handleGoToSettings = () => {
    setShowProfileMenu(false);
    onClose?.();
    router.push('/dashboard/settings');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 flex flex-col transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          background: 'rgba(10, 10, 10, 0.55)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-black text-sm transition-transform group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #fff 0%, #ccc 100%)' }}
            >
              L
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white">Lumina AI</span>
          </Link>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
            >
              <X className="w-4 h-4 text-[#808080]" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium',
                  isActive
                    ? 'text-white bg-white/10 border border-white/15 shadow-sm'
                    : 'text-[#808080] hover:bg-white/[0.06] hover:text-[#BDBDBD]'
                )}
              >
                <item.icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-white' : 'text-[#808080] group-hover:text-[#BDBDBD]'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Profile */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu((p) => !p)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-black shrink-0"
                style={{ background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)' }}
              >
                {user?.fullName?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
              </div>
              <div className="text-left overflow-hidden flex-1">
                <p className="text-sm font-semibold text-white truncate">{user?.fullName || 'Guest'}</p>
                <p className="text-xs text-[#808080]">Pro Plan</p>
              </div>
              <ChevronUp
                className={cn(
                  'w-4 h-4 text-[#808080] transition-transform',
                  showProfileMenu ? 'rotate-180' : 'rotate-0'
                )}
              />
            </button>

            {/* Profile dropdown */}
            {showProfileMenu && (
              <div
                className="absolute left-0 bottom-14 w-56 rounded-2xl overflow-hidden z-50"
                style={{
                  background: 'rgba(20, 20, 20, 0.75)',
                  backdropFilter: 'blur(28px)',
                  WebkitBackdropFilter: 'blur(28px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
                }}
              >
                <div className="p-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <p className="text-sm font-bold text-white truncate">{user?.fullName || 'Guest User'}</p>
                  <p className="text-xs text-[#808080] mt-0.5 truncate">{user?.email}</p>
                </div>
                <div className="p-2 space-y-1">
                  <button
                    onClick={handleGoToSettings}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-[#BDBDBD] rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#808080]" />
                    Account Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#EF4444]/15 text-[#EF4444] rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}