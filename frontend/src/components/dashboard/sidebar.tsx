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
  User
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/auth-store';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'New Summary', href: '/dashboard/summarize', icon: PlusCircle },
  { name: 'History', href: '/dashboard/history', icon: History },
  { name: 'AI Chat', href: '/dashboard/chat', icon: MessageSquare },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar aside */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen w-64 border-r border-slate-100 bg-white/80 backdrop-blur-xl flex flex-col transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
              Lumina AI
            </span>
          </Link>

          {/* Close button inside sidebar on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-full lg:hidden transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-blue-200"
                    : "text-slate-600 hover:bg-slate-50 hover:shadow-sm"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="relative" ref={profileRef}>
            {/* Profile trigger button */}
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="w-full flex items-center gap-3 cursor-pointer hover:bg-slate-50 rounded-xl p-2 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-md shrink-0">
                {user?.fullName?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />}
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.fullName || 'Guest'}</p>
                <p className="text-xs text-slate-500">Pro Plan</p>
              </div>
            </button>

            {/* Profile dropdown — opens upward */}
            {showProfileMenu && (
              <div className="absolute left-0 bottom-14 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                {/* User info header */}
                <div className="p-4 border-b border-slate-50">
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName || 'Guest User'}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{user?.email}</p>
                </div>

                {/* Actions */}
                <div className="p-2 space-y-1">
                  <button
                    onClick={handleGoToSettings}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    Account Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
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