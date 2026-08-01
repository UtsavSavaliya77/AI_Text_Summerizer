"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BarChart3, 
  FileStack, 
  ShieldCheck, 
  Search,
  MoreVertical,
  Activity
} from 'lucide-react';
import apiClient from '../../../../lib/api-client';
import { StatsCard } from '../../../../components/dashboard/stats-card';
import { formatDate } from '../../../../lib/utils';

export default function AdminPanel() {
  const [data, setData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const [statsRes, usersRes] = await Promise.all([
          apiClient.get('/admin/stats'),
          apiClient.get('/admin/users')
        ]);
        setData(statsRes.data.data);
        setUsers(usersRes.data.data.users);
      } catch (err) {
        console.error("Admin access denied or error", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Analytics...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-primary" /> System Administration
        </h1>
        <p className="text-slate-500 mt-2">Global oversight of Lumina AI platform usage.</p>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Global Users" 
          value={data?.stats.totalUsers || 0} 
          icon={Users} 
          color="bg-slate-900" 
          delay={0.1}
        />
        <StatsCard 
          title="Total AI Summaries" 
          value={data?.stats.totalSummaries || 0} 
          icon={FileStack} 
          color="bg-blue-600" 
          delay={0.2}
        />
        <StatsCard 
          title="Words Processed" 
          value={(data?.stats.totalWordsProcessed / 1000).toFixed(1) + 'k'} 
          icon={Activity} 
          color="bg-emerald-600" 
          delay={0.3}
        />
        <StatsCard 
          title="AI Interactions" 
          value={data?.stats.totalChats || 0} 
          icon={BarChart3} 
          color="bg-purple-600" 
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* User Management Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 glass-card rounded-3xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">User Management</h2>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm" placeholder="Search user..." />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Summaries</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-800">{user.fullName}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                        {user._count.summaries}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-slate-100 rounded-lg">
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* System Health / Logs */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="glass-card p-6 rounded-3xl">
            <h2 className="font-bold text-slate-900 mb-4">Platform Growth</h2>
            <div className="h-48 flex items-end gap-2 px-2">
              {[40, 70, 45, 90, 65, 80, 95].map((val, i) => (
                <div key={i} className="flex-1 bg-primary/20 rounded-t-lg relative group cursor-pointer hover:bg-primary transition-all" style={{ height: `${val}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {val}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Mon</span>
              <span>Sun</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-3xl text-white shadow-xl">
             <h3 className="font-bold text-lg">Gemini API Status</h3>
             <p className="text-blue-100 text-sm mt-1">Version: 1.5 Flash</p>
             <div className="mt-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Healthy & Operational</span>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}