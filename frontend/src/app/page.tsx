"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Sparkles, ArrowRight, FileText, Zap, Shield, Users, CheckCircle2 } from 'lucide-react';

/* ─── Animated Particle Canvas ─── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = window.innerWidth  + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 1000;
    const particles = Array.from({ length: COUNT }, () => ({
      x:   Math.random() * window.innerWidth,
      y:   Math.random() * window.innerHeight,
      r:   Math.random() * 1.5 + 0.3,
      dx:  (Math.random() - 0.5) * 0.3,
      dy:  (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(229,229,229,${p.opacity})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > window.innerWidth) p.dx *= -1;
        if (p.y < 0 || p.y > window.innerHeight) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ willChange: 'transform' }}
    />
  );
}

/* ─── Mouse-reactive radial light ─── */
function MouseLight() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0"
      animate={{ background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, rgba(255,255,255,0.04) 0%, transparent 60%)` }}
      transition={{ type: 'tween', ease: 'linear', duration: 0.1 }}
    />
  );
}

/* ─── Hero animated background ─── */
function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* Animated gradient orbs */}
      <div
        className="hero-mesh-1 absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%)', filter: 'blur(80px)' }}
      />
      <div
        className="hero-mesh-2 absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, rgba(200,200,200,0.8) 0%, transparent 70%)', filter: 'blur(100px)' }}
      />
      <div
        className="hero-mesh-3 absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 60%)', filter: 'blur(60px)' }}
      />

      {/* Animated grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Particle canvas */}
      <ParticleCanvas />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48" style={{ background: 'linear-gradient(to top, #090909, transparent)' }} />
    </div>
  );
}

/* ─── Feature Card ─── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const cardVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function FeatureCard({ icon: Icon, title, desc, gradient }: { icon: any; title: string; desc: string; gradient: string }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, boxShadow: '0 0 0 1px rgba(255,255,255,0.10), 0 20px 60px rgba(0,0,0,0.7)' }}
      className="glass-card p-8 group cursor-default"
    >
      <div
        className={`stat-icon mb-6 ${gradient}`}
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
      <p className="text-[#808080] text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ─── Floating Stat Card ─── */
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      className="glass-card px-5 py-4 flex flex-col items-center min-w-[110px]"
      style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.6)' }}
    >
      <span className="text-2xl font-extrabold text-white tracking-tight">{value}</span>
      <span className="text-[10px] text-[#808080] font-semibold uppercase tracking-widest mt-1">{label}</span>
    </motion.div>
  );
}

/* ─── Nav ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className={`glass-nav${scrolled ? ' scrolled' : ''} px-6 py-4 flex items-center justify-between`}>
      <Link href="/" className="flex items-center gap-2.5 group">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-black text-sm transition-transform group-hover:scale-110"
          style={{ background: 'linear-gradient(135deg, #fff 0%, #ccc 100%)' }}
        >
          L
        </div>
        <span className="text-[15px] font-bold tracking-tight text-white">Lumina AI</span>
      </Link>

      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-semibold text-[#BDBDBD] hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-[#181818]"
        >
          Sign In
        </Link>
        <Link href="/register" className="btn-primary text-sm py-2 px-4 rounded-xl">
          Get Started <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </nav>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const fadeUp = (delay = 0) => ({
    initial:  { opacity: 0, y: 24 },
    animate:  { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  });

  return (
    <div className="min-h-screen bg-[#090909] text-white overflow-x-hidden">
      <MouseLight />
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 pt-24 pb-24">
        <HeroBackground />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">

          {/* Headline */}
          <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08]">
            Turn long documents
            <br />
            into{' '}
            <span
              className="relative"
              style={{
                background: 'linear-gradient(90deg, #fff 0%, #999 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              instant insights.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p {...fadeUp(0.2)} className="text-lg md:text-xl text-[#BDBDBD] max-w-2xl mx-auto leading-relaxed">
            The ultimate AI assistant for researchers, students, and professionals.
            Summarize, chat, and analyze documents in seconds.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/register" className="btn-primary text-base px-8 py-3.5 rounded-2xl w-full sm:w-auto justify-center">
              Start for Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-secondary text-base px-8 py-3.5 rounded-2xl w-full sm:w-auto justify-center">
              View Demo
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div {...fadeUp(0.4)} className="flex flex-wrap items-center justify-center gap-5 pt-2">
            {['No credit card required', '99.9% accuracy', 'SOC-2 compliant'].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-[#808080] text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> {t}
              </span>
            ))}
          </motion.div>

          {/* Floating stats */}
          <motion.div {...fadeUp(0.5)} className="flex items-center justify-center gap-4 flex-wrap pt-4">
            <StatCard value="50k+" label="Documents" />
            <StatCard value="99.9%" label="Accuracy" />
            <StatCard value="< 5s" label="Speed" />
            <StatCard value="5" label="Summary Modes" />
          </motion.div>
        </div>
      </section>

      {/* ─── Feature Grid ─── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-32">
        <motion.div {...fadeUp(0)} className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#808080] mb-4">Capabilities</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Everything you need,
            <br />
            <span className="text-[#BDBDBD]">nothing you don't.</span>
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <FeatureCard
            icon={FileText}
            title="Multi-Format Support"
            desc="Upload PDF, DOCX, or paste raw text. Our engine handles it all with perfect accuracy."
            gradient="bg-[#222]"
          />
          <FeatureCard
            icon={Zap}
            title="Instant Summaries"
            desc="Get 5 different summary styles from a single click. From executive briefs to bullet points."
            gradient="bg-[#222]"
          />
          <FeatureCard
            icon={Shield}
            title="RAG-Powered Chat"
            desc="Ask questions directly to your documents. Our AI answers only using your provided context."
            gradient="bg-[#222]"
          />
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#2E2E2E] py-10 px-6 text-center">
        <p className="text-[#808080] text-xs">
          © {new Date().getFullYear()} Lumina AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}