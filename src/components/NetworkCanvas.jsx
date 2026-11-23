import { useEffect, useRef } from 'react';

export default function NetworkCanvas({ containerRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef?.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const LINK_DIST = 140;
    const LINK_DIST_SQ = LINK_DIST * LINK_DIST;
    const MOUSE_DIST = 175;
    const MOUSE_DIST_SQ = MOUSE_DIST * MOUSE_DIST;

    let width = 0;
    let height = 0;
    let nodes = [];
    let packets = [];
    let rafId = null;
    let isVisible = true;
    let isTabVisible = !document.hidden;
    const mouse = { x: -9999, y: -9999 };

    function initNodes() {
      const count = Math.min(55, Math.max(24, Math.floor(width / 26)));
      nodes = Array.from({ length: count }, () => {
        const router = Math.random() < 0.16;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          router,
          size: router ? 3.8 : 1.9,
          phase: Math.random() * Math.PI * 2,
        };
      });
      packets = [];
    }

    function resize() {
      width = container.offsetWidth;
      height = container.offsetHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (nodes.length === 0) initNodes();
    }

    resize();

    const onMouseMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    container.addEventListener('mousemove', onMouseMove, { passive: true });
    container.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', resize, { passive: true });

    function spawnPacket() {
      if (nodes.length < 2) return;
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      let best = null;
      let bestDSq = LINK_DIST_SQ;
      for (let i = 0; i < nodes.length; i++) {
        const b = nodes[i];
        if (b === a) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dSq = dx * dx + dy * dy;
        if (dSq < bestDSq) {
          best = b;
          bestDSq = dSq;
        }
      }
      if (best) {
        packets.push({ from: a, to: best, t: 0, speed: 0.013 + Math.random() * 0.012 });
      }
    }

    function drawFrame(now) {
      ctx.clearRect(0, 0, width, height);

      // 1. Liens entre nœuds (sans shadowBlur et sans Math.sqrt inutile)
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (!reduceMotion) {
          a.x += a.vx;
          a.y += a.vy;
          if (a.x < 0 || a.x > width) a.vx *= -1;
          if (a.y < 0 || a.y > height) a.vy *= -1;
        }

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dSq = dx * dx + dy * dy;
          if (dSq < LINK_DIST_SQ) {
            const alpha = (1 - Math.sqrt(dSq) / LINK_DIST) * 0.52;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(155, 32, 64, ${alpha.toFixed(2)})`;
            ctx.lineWidth = a.router || b.router ? 1.15 : 0.75;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        if (mouse.x > -999) {
          const mdx = a.x - mouse.x;
          const mdy = a.y - mouse.y;
          const mdSq = mdx * mdx + mdy * mdy;
          if (mdSq < MOUSE_DIST_SQ) {
            const alpha = (1 - Math.sqrt(mdSq) / MOUSE_DIST) * 0.6;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(227, 167, 125, ${alpha.toFixed(2)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // 2. Nœuds & routeurs (halo léger sans shadowBlur pour rester à 60-120 FPS)
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.router) {
          const pulse = 0.8 + Math.sin(now * 0.003 + n.phase) * 0.2;
          const halo = n.size * 2.2;
          ctx.fillStyle = `rgba(229, 88, 111, ${(0.18 * pulse).toFixed(2)})`;
          ctx.fillRect(n.x - halo, n.y - halo, halo * 2, halo * 2);
          ctx.fillStyle = `rgba(229, 88, 111, ${pulse.toFixed(2)})`;
          ctx.fillRect(n.x - n.size, n.y - n.size, n.size * 2, n.size * 2);
        } else {
          ctx.beginPath();
          ctx.fillStyle = 'rgba(199, 51, 79, 0.85)';
          ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Paquets de données
      if (!reduceMotion) {
        if (packets.length < 12 && Math.random() < 0.12) spawnPacket();
        for (let i = packets.length - 1; i >= 0; i--) {
          const p = packets[i];
          p.t += p.speed;
          const dx = p.from.x - p.to.x;
          const dy = p.from.y - p.to.y;
          if (p.t >= 1 || dx * dx + dy * dy > LINK_DIST_SQ) {
            packets.splice(i, 1);
            continue;
          }
          const x = p.from.x + (p.to.x - p.from.x) * p.t;
          const y = p.from.y + (p.to.y - p.from.y) * p.t;
          ctx.beginPath();
          ctx.fillStyle = 'rgba(227, 167, 125, 0.28)';
          ctx.arc(x, y, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.fillStyle = '#f4c3a0';
          ctx.arc(x, y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (isVisible && isTabVisible && !reduceMotion) {
        rafId = requestAnimationFrame(drawFrame);
      } else {
        rafId = null;
      }
    }

    const startIfNeeded = () => {
      if (isVisible && isTabVisible && !reduceMotion && rafId === null) {
        rafId = requestAnimationFrame(drawFrame);
      }
    };

    const stopIfRunning = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) startIfNeeded();
        else stopIfRunning();
      },
      { threshold: 0.01 }
    );
    observer.observe(container);

    const onVisibility = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) startIfNeeded();
      else stopIfRunning();
    };
    document.addEventListener('visibilitychange', onVisibility);

    if (reduceMotion) {
      drawFrame(0);
    } else {
      startIfNeeded();
    }

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      stopIfRunning();
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', resize);
    };
  }, [containerRef]);

  return <canvas className="network-canvas" ref={canvasRef} aria-hidden="true" />;
}
