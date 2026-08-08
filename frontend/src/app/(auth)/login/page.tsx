"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../../store/auth-store';
import { authService } from '../../../services/auth.service';
import { Loader2, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import DotField from '../../../components/ui/DotField';
import BorderGlow from '../../../components/ui/BorderGlow';

export default function LoginPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email    = formData.get('email')    as string;
    const password = formData.get('password') as string;

    try {
      const response = await authService.login({ email, password });
      setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        background: '#090909',
      }}
    >
      {/* DotField background — delayed to avoid blocking page transition */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <DotField
          dotRadius={1.5}
          dotSpacing={14}
          bulgeStrength={67}
          glowRadius={160}
          sparkle={false}
          waveAmplitude={0}
          gradientFrom="rgba(168, 85, 247, 0.25)"
          gradientTo="rgba(180, 151, 207, 0.15)"
          glowColor="#090909"
          mountDelay={300}
        />
      </div>

      {/* Ambient glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0 }} />
      <div className="fixed bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(180,151,207,0.05) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0 }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative"
        style={{ zIndex: 1 }}
      >
        {/* Card wrapped in BorderGlow */}
        <BorderGlow
          edgeSensitivity={25}
          glowColor="270 60 70"
          backgroundColor="rgba(18, 15, 23, 0.92)"
          borderRadius={20}
          glowRadius={45}
          glowIntensity={1.2}
          coneSpread={22}
          animated={true}
          colors={['#c084fc', '#a855f7', '#7c3aed']}
          className="w-full"
        >
          <div className="p-10 space-y-8">
            {/* Logo + Header */}
            <div className="text-center space-y-4">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-black text-sm transition-transform group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, #fff 0%, #ccc 100%)' }}
                >
                  L
                </div>
                <span className="text-base font-bold tracking-tight">Lumina AI</span>
              </Link>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
                <p className="text-[#808080] text-sm mt-2">Sign in to your account to continue</p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] px-4 py-3 rounded-xl text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#BDBDBD] uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808080]" />
                  <input
                    name="email"
                    type="email"
                    required
                    className="input-dark !pl-11 placeholder:text-[#606060]"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#BDBDBD] uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808080]" />
                  <input
                    name="password"
                    type="password"
                    required
                    className="input-dark !pl-11 placeholder:text-[#606060]"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 rounded-xl text-sm font-bold justify-center disabled:opacity-50"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                  : <>Sign In <ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#2E2E2E]" />
              <span className="text-[#808080] text-xs">or</span>
              <div className="flex-1 h-px bg-[#2E2E2E]" />
            </div>

            <p className="text-center text-[#808080] text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-white font-bold hover:text-[#BDBDBD] transition-colors">
                Sign up for free →
              </Link>
            </p>

            <div className="border-t border-[#2E2E2E] pt-6 text-center">
              <span className="badge-dark">
                <Sparkles className="w-3 h-3" /> Secure &amp; Encrypted
              </span>
            </div>
          </div>
        </BorderGlow>
      </motion.div>
    </div>
  );
}