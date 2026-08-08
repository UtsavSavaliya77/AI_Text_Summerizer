"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  subtitle?: string;
  color?: string;
  delay?: number;
}

export function StatsCard({ title, value, icon: Icon, trend, subtitle, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{
        delay,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative glass-card p-6 flex flex-col justify-between overflow-hidden cursor-default transition-all duration-300 hover:border-white/20 hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
      style={{
        background: 'rgba(18, 18, 18, 0.45)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Subtle monochrome ambient light on hover */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/[0.04] rounded-full blur-2xl pointer-events-none group-hover:bg-white/[0.08] group-hover:scale-125 transition-all duration-500" />
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-transparent to-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Top row: Icon & Trend */}
      <div className="flex items-center justify-between relative z-10">
        <motion.div
          whileHover={{ rotate: 6, scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-inner"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Icon className="w-5 h-5 text-[#BDBDBD] group-hover:text-white transition-colors duration-300" />
        </motion.div>

        {trend && (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#E0E0E0',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
            {trend}
          </span>
        )}
      </div>

      {/* Bottom row: Title, Value & Subtitle */}
      <div className="relative z-10 mt-6">
        <p className="text-xs font-bold text-[#808080] uppercase tracking-wider group-hover:text-[#BDBDBD] transition-colors duration-300">
          {title}
        </p>
        <div className="flex items-baseline gap-2 mt-1.5">
          <h3 className="text-3xl font-extrabold text-white tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <span className="text-xs text-[#707070] font-medium">{subtitle}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}