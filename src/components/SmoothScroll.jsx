import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const lenis = new Lenis({
      lerp: 0.11,
      wheelMultiplier: 1,
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    let rafId = null;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Gère les clics sur tous les liens d'ancres (#accueil, #projet, etc.)
    const onAnchorClick = (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: hash === '#accueil' ? 0 : -68, duration: 0.9 });
    };

    document.addEventListener('click', onAnchorClick);

    return () => {
      document.removeEventListener('click', onAnchorClick);
      if (rafId !== null) cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
