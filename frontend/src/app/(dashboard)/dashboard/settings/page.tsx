"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Shield, Sparkles, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../../store/auth-store';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  
  // Profile settings state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [aiAutoTagging, setAiAutoTagging] = useState(true);

  // Status/Feedback states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess(false);
    
    setTimeout(() => {
      setIsSavingProfile(false);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }, 1200);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsSavingPassword(true);
    setTimeout(() => {
      setIsSavingPassword(false);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-2">Manage your profile, account preferences, and configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Navigation Card */}
        <div className="md:col-span-1 space-y-4">
          <div className="glass-card p-6 rounded-3xl space-y-2">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4 px-2">Account Overview</h3>
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl">
              <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.fullName || 'Guest User'}</p>
                <p className="text-xs text-slate-500 capitalize">Member • Pro Plan</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>API Usage</span>
                <span className="font-semibold text-slate-800">Unlimited</span>
              </div>
              <div className="flex justify-between">
                <span>Account Status</span>
                <span className="font-semibold text-emerald-600">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Forms Column */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Form */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-3xl"
          >
            <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-primary" /> Profile Settings
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 outline-none text-sm font-medium cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-400 mt-1">Contact support to change your registered email address.</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                {profileSuccess && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Profile updated successfully!
                  </span>
                )}
                <button 
                  type="submit" 
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 ml-auto"
                >
                  {isSavingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>

          {/* Change Password Form */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 rounded-3xl"
          >
            <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2 mb-6">
              <Lock className="w-5 h-5 text-purple-600" /> Security & Password
            </h2>
            <form onSubmit={handleSavePassword} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium transition-all"
                  required
                />
              </div>

              {passwordError && (
                <p className="text-xs text-red-500 font-semibold">{passwordError}</p>
              )}

              <div className="flex items-center justify-between pt-2">
                {passwordSuccess && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Password changed successfully!
                  </span>
                )}
                <button 
                  type="submit" 
                  disabled={isSavingPassword}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 ml-auto"
                >
                  {isSavingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update Password
                </button>
              </div>
            </form>
          </motion.div>

          {/* Preferences Section */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 rounded-3xl"
          >
            <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-amber-500" /> System Preferences
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Email Notifications</h4>
                  <p className="text-xs text-slate-400 mt-1">Receive updates when summaries are processed.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-9 h-5 bg-slate-200 checked:bg-primary rounded-full cursor-pointer appearance-none relative transition-colors focus:outline-none"
                  style={{
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                  }}
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Weekly Summary Digest</h4>
                  <p className="text-xs text-slate-400 mt-1">Get a weekly email detailing insights saved.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={weeklyDigest}
                  onChange={(e) => setWeeklyDigest(e.target.checked)}
                  className="w-9 h-5 bg-slate-200 checked:bg-primary rounded-full cursor-pointer appearance-none relative transition-colors focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">AI Auto-Tagging</h4>
                  <p className="text-xs text-slate-400 mt-1">Automatically extract key topics and tag summaries.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={aiAutoTagging}
                  onChange={(e) => setAiAutoTagging(e.target.checked)}
                  className="w-9 h-5 bg-slate-200 checked:bg-primary rounded-full cursor-pointer appearance-none relative transition-colors focus:outline-none"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
