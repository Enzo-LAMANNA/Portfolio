import { useEffect, useRef } from 'react';

export default function NetworkCanvas({ containerRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef?.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const LINK_DIST = 165;
    const LINK_DIST_SQ = LINK_DIST * LINK_DIST;
    const MOUSE_DIST = 190;
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
      const area = width * height;
      const count = Math.min(72, Math.max(28, Math.floor(area / 16000)));
      nodes = Array.from({ length: count }, () => {
        const star = Math.random() < 0.2;
        const speed = star ? 0.45 : 0.72;
        const angle = Math.random() * Math.PI * 2;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * (0.28 + Math.random() * speed),
          vy: Math.sin(angle) * (0.28 + Math.random() * speed),
          star,
          size: star ? 3.2 : 1.7 + Math.random() * 1.1,
          phase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.002 + Math.random() * 0.0025,
        };
      });
      packets = [];
    }

    function resize() {
      const nextW = container.offsetWidth;
      const nextH = container.offsetHeight;
      if (nextW === 0 || nextH === 0) return;
      width = nextW;
      height = nextH;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (nodes.length === 0) {
        initNodes();
      } else {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].x > width) nodes[i].x = Math.random() * width;
          if (nodes[i].y > height) nodes[i].y = Math.random() * height;
        }
      }
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
        packets.push({ from: a, to: best, t: 0, speed: 0.012 + Math.random() * 0.014 });
      }
    }

    function drawFrame(now) {
      ctx.clearRect(0, 0, width, height);

      // 1. Déplacement continu + fils de constellation
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;

        // Rebond doux sur les bords
        if (a.x < 0) { a.x = 0; a.vx *= -1; }
        else if (a.x > width) { a.x = width; a.vx *= -1; }
        if (a.y < 0) { a.y = 0; a.vy *= -1; }
        else if (a.y > height) { a.y = height; a.vy *= -1; }

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dSq = dx * dx + dy * dy;
          if (dSq < LINK_DIST_SQ) {
            const ratio = 1 - Math.sqrt(dSq) / LINK_DIST;
            const alpha = ratio * 0.58;
            ctx.beginPath();
            ctx.strokeStyle =
              a.star || b.star
                ? `rgba(242, 138, 158, ${alpha.toFixed(2)})`
                : `rgba(218, 92, 118, ${(alpha * 0.85).toFixed(2)})`;
            ctx.lineWidth = a.star || b.star ? 1.15 : 0.8;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        // Interaction constellation vers la souris
        if (mouse.x > -999) {
          const mdx = a.x - mouse.x;
          const mdy = a.y - mouse.y;
          const mdSq = mdx * mdx + mdy * mdy;
          if (mdSq < MOUSE_DIST_SQ) {
            const alpha = (1 - Math.sqrt(mdSq) / MOUSE_DIST) * 0.72;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(242, 192, 150, ${alpha.toFixed(2)})`;
            ctx.lineWidth = 1.1;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // 2. Étoiles / nœuds scintillants (sans shadowBlur, 100 % fluide)
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const twinkle = 0.65 + 0.35 * Math.sin(now * n.twinkleSpeed + n.phase);
        if (n.star) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(248, 176, 190, ${(0.22 * twinkle).toFixed(2)})`;
          ctx.arc(n.x, n.y, n.size * 2.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 228, 234, ${(0.95 * twinkle).toFixed(2)})`;
          ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.fillStyle = `rgba(244, 146, 166, ${(0.88 * twinkle).toFixed(2)})`;
          ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Impulsions lumineuses glissant entre étoiles
      if (packets.length < 14 && Math.random() < 0.15) spawnPacket();
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
        ctx.fillStyle = 'rgba(245, 198, 158, 0.34)';
        ctx.arc(x, y, 4.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = '#ffdfc4';
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      if (isVisible && isTabVisible) {
        rafId = requestAnimationFrame(drawFrame);
      } else {
        rafId = null;
      }
    }

    const startIfNeeded = () => {
      if (isVisible && isTabVisible && rafId === null) {
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

    startIfNeeded();

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
