'use client';

import { useEffect, useRef, memo, useState } from 'react';

const TWO_PI = Math.PI * 2;

interface Dot {
  ax: number;
  ay: number;
  sx: number;
  sy: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
}

interface DotFieldProps {
  dotRadius?: number;
  dotSpacing?: number;
  cursorRadius?: number;
  cursorForce?: number;
  bulgeOnly?: boolean;
  bulgeStrength?: number;
  glowRadius?: number;
  sparkle?: boolean;
  waveAmplitude?: number;
  gradientFrom?: string;
  gradientTo?: string;
  glowColor?: string;
  /** Delay in ms before the animation starts (helps avoid page-transition lag) */
  mountDelay?: number;
  [key: string]: unknown;
}

const DotField = memo(({
  dotRadius = 1.5,
  dotSpacing = 14,
  cursorRadius = 500,
  cursorForce = 0.1,
  bulgeOnly = true,
  bulgeStrength = 67,
  glowRadius = 160,
  sparkle = false,
  waveAmplitude = 0,
  gradientFrom = 'rgba(168, 85, 247, 0.35)',
  gradientTo = 'rgba(180, 151, 207, 0.25)',
  glowColor = '#120F17',
  mountDelay = 150,
  ...rest
}: DotFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef    = useRef<SVGSVGElement>(null);
  const glowRef   = useRef<SVGCircleElement>(null);
  const dotsRef   = useRef<Dot[]>([]);
  const mouseRef  = useRef({ x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 });
  const rafRef    = useRef<number | null>(null);
  const sizeRef   = useRef({ w: 0, h: 0, offsetX: 0, offsetY: 0 });
  const glowOpacityRef = useRef(0);
  const engagementRef  = useRef(0);
  const propsRef = useRef<Record<string, unknown>>({});
  propsRef.current = { dotRadius, dotSpacing, cursorRadius, cursorForce, bulgeOnly, bulgeStrength, sparkle, waveAmplitude, gradientFrom, gradientTo };
  const rebuildRef  = useRef<(() => void) | null>(null);
  const glowIdRef   = useRef(`dot-field-glow-${Math.random().toString(36).slice(2, 9)}`);
  const runningRef  = useRef(false); // single source of truth for loop state
  const [mounted, setMounted] = useState(false);

  // Delay mount so the page-in animation completes first
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), mountDelay);
    return () => clearTimeout(t);
  }, [mountDelay]);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    const glowEl = glowRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // ── Cached gradient (rebuilt only on resize) ──────────────────────────────
    let cachedGrad: CanvasGradient | null = null;
    let cachedGradW = 0;
    let cachedGradH = 0;

    function getGradient(w: number, h: number): CanvasGradient {
      const p = propsRef.current;
      if (!cachedGrad || cachedGradW !== w || cachedGradH !== h) {
        cachedGrad  = ctx!.createLinearGradient(0, 0, w, h);
        cachedGrad.addColorStop(0, p.gradientFrom as string);
        cachedGrad.addColorStop(1, p.gradientTo as string);
        cachedGradW = w;
        cachedGradH = h;
      }
      return cachedGrad;
    }

    // ── Resize ────────────────────────────────────────────────────────────────
    let resizeTimer: ReturnType<typeof setTimeout>;

    function doResize() {
      if (!canvas!.parentElement) return;
      const rect = canvas!.parentElement.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w === 0 || h === 0) return;

      canvas!.width  = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width  = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      sizeRef.current = { w, h, offsetX: rect.left + window.scrollX, offsetY: rect.top + window.scrollY };

      // Invalidate gradient cache
      cachedGrad  = null;
      cachedGradW = 0;
      cachedGradH = 0;

      buildDots(w, h);
    }

    function resize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(doResize, 150);
    }

    // ── Dot grid ──────────────────────────────────────────────────────────────
    function buildDots(w: number, h: number) {
      const p    = propsRef.current;
      const step = (p.dotRadius as number) + (p.dotSpacing as number);
      const cols = Math.floor(w / step);
      const rows = Math.floor(h / step);
      const padX = (w % step) / 2;
      const padY = (h % step) / 2;
      const dots: Dot[] = new Array(rows * cols);
      let idx = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ax = padX + col * step + step / 2;
          const ay = padY + row * step + step / 2;
          dots[idx++] = { ax, ay, sx: ax, sy: ay, vx: 0, vy: 0, x: ax, y: ay };
        }
      }
      dotsRef.current = dots;
    }

    // ── Mouse tracking ────────────────────────────────────────────────────────
    function onMouseMove(e: MouseEvent) {
      const s = sizeRef.current;
      mouseRef.current.x = e.pageX - s.offsetX;
      mouseRef.current.y = e.pageY - s.offsetY;
    }

    let speedInterval: ReturnType<typeof setInterval>;

    function updateMouseSpeed() {
      const m  = mouseRef.current;
      const dx = m.prevX - m.x;
      const dy = m.prevY - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      m.speed += (dist - m.speed) * 0.5;
      if (m.speed < 0.001) m.speed = 0;
      m.prevX = m.x;
      m.prevY = m.y;
    }

    speedInterval = setInterval(updateMouseSpeed, 20);

    // ── Animation loop ────────────────────────────────────────────────────────
    let frameCount = 0;

    function tick() {
      if (!runningRef.current) return;

      frameCount++;
      const dots = dotsRef.current;
      const m    = mouseRef.current;
      const { w, h } = sizeRef.current;
      const p    = propsRef.current;
      const len  = dots.length;
      const t    = frameCount * 0.02;

      const targetEng = Math.min(m.speed / 5, 1);
      engagementRef.current += (targetEng - engagementRef.current) * 0.06;
      if (engagementRef.current < 0.001) engagementRef.current = 0;
      const eng = engagementRef.current;

      glowOpacityRef.current += (eng - glowOpacityRef.current) * 0.08;

      if (glowEl) {
        glowEl.setAttribute('cx', String(m.x));
        glowEl.setAttribute('cy', String(m.y));
        glowEl.style.opacity = String(glowOpacityRef.current);
      }

      ctx!.clearRect(0, 0, w, h);
      ctx!.fillStyle = getGradient(w, h);

      const cr     = p.cursorRadius as number;
      const crSq   = cr * cr;
      const rad    = (p.dotRadius as number) / 2;
      const isBulge = p.bulgeOnly as boolean;

      ctx!.beginPath();

      for (let i = 0; i < len; i++) {
        const d  = dots[i];
        const dx = m.x - d.ax;
        const dy = m.y - d.ay;
        const distSq = dx * dx + dy * dy;

        if (distSq < crSq && eng > 0.01) {
          const dist = Math.sqrt(distSq);
          if (isBulge) {
            const tVal = 1 - dist / cr;
            const push = tVal * tVal * (p.bulgeStrength as number) * eng;
            const angle = Math.atan2(dy, dx);
            d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15;
            d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
          } else {
            const angle = Math.atan2(dy, dx);
            const move  = (500 / dist) * (m.speed * (p.cursorForce as number));
            d.vx += Math.cos(angle) * -move;
            d.vy += Math.sin(angle) * -move;
          }
        } else if (isBulge) {
          d.sx += (d.ax - d.sx) * 0.1;
          d.sy += (d.ay - d.sy) * 0.1;
        }

        if (!isBulge) {
          d.vx *= 0.9;
          d.vy *= 0.9;
          d.x   = d.ax + d.vx;
          d.y   = d.ay + d.vy;
          d.sx += (d.x - d.sx) * 0.1;
          d.sy += (d.y - d.sy) * 0.1;
        }

        let drawX = d.sx;
        let drawY = d.sy;
        if ((p.waveAmplitude as number) > 0) {
          drawY += Math.sin(d.ax * 0.03 + t) * (p.waveAmplitude as number);
          drawX += Math.cos(d.ay * 0.03 + t * 0.7) * (p.waveAmplitude as number) * 0.5;
        }

        if (p.sparkle) {
          const hash = ((i * 2654435761) ^ (frameCount >> 3)) >>> 0;
          const r    = (hash % 100) < 3 ? rad * 1.8 : rad;
          ctx!.moveTo(drawX + r, drawY);
          ctx!.arc(drawX, drawY, r, 0, TWO_PI);
        } else {
          ctx!.moveTo(drawX + rad, drawY);
          ctx!.arc(drawX, drawY, rad, 0, TWO_PI);
        }
      }

      ctx!.fill();
      rafRef.current = requestAnimationFrame(tick);
    }

    // ── Start / stop helpers ──────────────────────────────────────────────────
    function startLoop() {
      if (runningRef.current) return;
      runningRef.current = true;
      rafRef.current = requestAnimationFrame(tick);
    }

    function stopLoop() {
      runningRef.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    // ── Page Visibility API — pause when tab is hidden ────────────────────────
    function handleVisibilityChange() {
      if (document.hidden) {
        stopLoop();
      } else {
        // Reset mouse speed so dots don't jump when returning
        mouseRef.current.speed  = 0;
        mouseRef.current.x      = -9999;
        mouseRef.current.y      = -9999;
        mouseRef.current.prevX  = -9999;
        mouseRef.current.prevY  = -9999;
        engagementRef.current   = 0;
        glowOpacityRef.current  = 0;
        startLoop();
      }
    }

    // ── Init ──────────────────────────────────────────────────────────────────
    doResize();
    window.addEventListener('resize',      resize,       { passive: true });
    window.addEventListener('mousemove',   onMouseMove,  { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Only start if tab is currently visible
    if (!document.hidden) {
      startLoop();
    }

    rebuildRef.current = () => {
      const { w, h } = sizeRef.current;
      if (w > 0 && h > 0) buildDots(w, h);
    };

    return () => {
      stopLoop();
      clearInterval(speedInterval);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize',    resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => {
    rebuildRef.current?.();
  }, [dotRadius, dotSpacing]);

  if (!mounted) return <div className="w-full h-full" />;

  return (
    <div className="w-full h-full relative" {...rest}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />
      <svg
        ref={svgRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <radialGradient id={glowIdRef.current}>
            <stop offset="0%" stopColor={glowColor} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle
          ref={glowRef}
          cx="-9999"
          cy="-9999"
          r={glowRadius}
          fill={`url(#${glowIdRef.current})`}
          style={{ opacity: 0, willChange: 'opacity' }}
        />
      </svg>
    </div>
  );
});

DotField.displayName = 'DotField';

export default DotField;
