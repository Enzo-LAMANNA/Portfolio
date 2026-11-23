import { useEffect, useRef } from 'react';

export default function NetworkCanvas({ containerRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef?.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const LINK_DIST = 145;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes = [];
    let packets = [];
    let rafId = null;
    let isVisible = true;
    const mouse = { x: -9999, y: -9999 };

    function initNodes() {
      const count = Math.min(85, Math.max(30, Math.floor(width / 18)));
      nodes = Array.from({ length: count }, () => {
        const router = Math.random() < 0.14;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.55,
          vy: (Math.random() - 0.5) * 0.55,
          router,
          size: router ? 4.2 : 2,
          phase: Math.random() * Math.PI * 2,
        };
      });
      packets = [];
    }

    function resize() {
      width = container.offsetWidth;
      height = container.offsetHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
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
    window.addEventListener('resize', resize);

    function spawnPacket() {
      if (nodes.length < 2) return;
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      let best = null;
      let bestD = Infinity;
      for (let i = 0; i < nodes.length; i++) {
        const b = nodes[i];
        if (b === a) continue;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK_DIST && d < bestD) {
          best = b;
          bestD = d;
        }
      }
      if (best) {
        packets.push({ from: a, to: best, t: 0, speed: 0.012 + Math.random() * 0.014 });
      }
    }

    function drawFrame(now) {
      ctx.clearRect(0, 0, width, height);

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
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.55;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(155, 32, 64, ${alpha})`;
            ctx.lineWidth = a.router || b.router ? 1.2 : 0.8;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (md < 185) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(227, 167, 125, ${(1 - md / 185) * 0.65})`;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        ctx.beginPath();
        if (n.router) {
          const pulse = 0.85 + Math.sin(now * 0.003 + n.phase) * 0.15;
          ctx.fillStyle = `rgba(229, 88, 111, ${pulse})`;
          ctx.shadowColor = '#e5586f';
          ctx.shadowBlur = 12;
          ctx.rect(n.x - n.size, n.y - n.size, n.size * 2, n.size * 2);
        } else {
          ctx.fillStyle = 'rgba(199, 51, 79, 0.85)';
          ctx.shadowBlur = 0;
          ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (!reduceMotion) {
        if (packets.length < 16 && Math.random() < 0.14) spawnPacket();
        packets = packets.filter((p) => {
          p.t += p.speed;
          if (p.t >= 1 || Math.hypot(p.from.x - p.to.x, p.from.y - p.to.y) > LINK_DIST) {
            return false;
          }
          const x = p.from.x + (p.to.x - p.from.x) * p.t;
          const y = p.from.y + (p.to.y - p.from.y) * p.t;
          ctx.beginPath();
          ctx.fillStyle = '#f4c3a0';
          ctx.shadowColor = '#e3a77d';
          ctx.shadowBlur = 10;
          ctx.arc(x, y, 1.9, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          return true;
        });
      }

      if (isVisible && !reduceMotion) {
        rafId = requestAnimationFrame(drawFrame);
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !reduceMotion && rafId === null) {
          rafId = requestAnimationFrame(drawFrame);
        } else if (!isVisible && rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      },
      { threshold: 0.01 }
    );
    observer.observe(container);

    if (reduceMotion) {
      drawFrame(0);
    } else {
      rafId = requestAnimationFrame(drawFrame);
    }

    return () => {
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', resize);
    };
  }, [containerRef]);

  return <canvas id="network-canvas" ref={canvasRef} aria-hidden="true" />;
}
