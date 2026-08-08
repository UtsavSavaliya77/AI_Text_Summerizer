"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../../store/auth-store';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);

  // Profile state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email,    setEmail]    = useState(user?.email    || '');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest,        setWeeklyDigest]        = useState(false);
  const [aiAutoTagging,       setAiAutoTagging]       = useState(true);

  // Status
  const [isSavingProfile,  setIsSavingProfile]  = useState(false);
  const [profileSuccess,   setProfileSuccess]   = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess,  setPasswordSuccess]  = useState(false);
  const [passwordError,    setPasswordError]    = useState('');

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
    if (newPassword !== confirmPassword) { setPasswordError('New passwords do not match.'); return; }
    setIsSavingPassword(true);
    setTimeout(() => {
      setIsSavingPassword(false);
      setPasswordSuccess(true);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    }, 1500);
  };

  const sectionVariant = (delay: number) => ({
    initial:    { opacity: 0, y: 16 },
    animate:    { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-[#808080] mt-2 text-sm">Manage your profile, account preferences, and configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Account Overview Card */}
        <div className="md:col-span-1">
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-[#808080] text-[10px] uppercase tracking-widest">Account Overview</h3>
            <div
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: '#1A1A1A', border: '1px solid #2E2E2E' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black text-sm shrink-0"
                style={{ background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)' }}
              >
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user?.fullName || 'Guest User'}</p>
                <p className="text-xs text-[#808080]">Member · Pro Plan</p>
              </div>
            </div>

            <div className="pt-3" style={{ borderTop: '1px solid #2E2E2E' }}>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-[#808080]">API Usage</span>
                  <span className="font-semibold text-white">Unlimited</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#808080]">Account Status</span>
                  <span className="font-semibold text-[#22C55E]">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile */}
          <motion.div {...sectionVariant(0)} className="glass-card p-7">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-6">
              <User className="w-4 h-4 text-[#808080]" /> Profile Settings
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-[#808080] uppercase tracking-widest mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-dark"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#808080] uppercase tracking-widest mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="input-dark"
                />
                <p className="text-[11px] text-[#808080] mt-1.5">Contact support to change your registered email address.</p>
              </div>
              <div className="flex items-center justify-between pt-2">
                {profileSuccess && (
                  <span className="text-xs text-[#22C55E] font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Profile updated successfully!
                  </span>
                )}
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="btn-primary text-xs py-2.5 px-5 rounded-xl ml-auto disabled:opacity-50"
                >
                  {isSavingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>

          {/* Password */}
          <motion.div {...sectionVariant(0.1)} className="glass-card p-7">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-6">
              <Lock className="w-4 h-4 text-[#808080]" /> Security & Password
            </h2>
            <form onSubmit={handleSavePassword} className="space-y-5">
              {[
                { label: 'Current Password', val: currentPassword, set: setCurrentPassword, autocomplete: 'current-password' },
                { label: 'New Password',     val: newPassword,     set: setNewPassword,     autocomplete: 'new-password' },
                { label: 'Confirm New Password', val: confirmPassword, set: setConfirmPassword, autocomplete: 'new-password' },
              ].map(({ label, val, set, autocomplete }) => (
                <div key={label}>
                  <label className="block text-[10px] font-bold text-[#808080] uppercase tracking-widest mb-2">{label}</label>
                  <input
                    type="password"
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    autoComplete={autocomplete}
                    className="input-dark"
                    required
                  />
                </div>
              ))}

              {passwordError && (
                <p className="text-xs text-[#EF4444] font-semibold">{passwordError}</p>
              )}

              <div className="flex items-center justify-between pt-2">
                {passwordSuccess && (
                  <span className="text-xs text-[#22C55E] font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Password changed successfully!
                  </span>
                )}
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="btn-secondary text-xs py-2.5 px-5 rounded-xl ml-auto disabled:opacity-50"
                >
                  {isSavingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Update Password
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
