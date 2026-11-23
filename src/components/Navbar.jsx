import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Radio, X } from 'lucide-react';

export default function Navbar({ data, isActuPage = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState(isActuPage ? 'actu' : 'accueil');
  const progressRef = useRef(null);

  useEffect(() => {
    let ticking = false;

    const updateOnScroll = () => {
      ticking = false;
      const y = window.scrollY;
      setScrolled((prev) => {
        const next = y > 50;
        return prev === next ? prev : next;
      });
      if (progressRef.current) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
        progressRef.current.style.transform = `scaleX(${ratio})`;
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateOnScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateOnScroll();

    if (isActuPage) {
      return () => window.removeEventListener('scroll', onScroll);
    }

    const ids = data.links.map((l) => l.href.replace('#', ''));
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-32% 0px -58% 0px', threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, [data.links, isActuPage]);

  const resolveHref = (href) => (isActuPage ? `./index.html${href}` : href);

  return (
    <>
      <div id="scroll-progress" ref={progressRef} aria-hidden="true" />
      <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
        <a href={isActuPage ? './index.html' : '#accueil'} className="nav-logo nav-logo-link">
          {data.logo}
        </a>

        <button
          id="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="nav-links"
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <ul id="nav-links" className="nav-desktop">
          {data.links.map((link) => {
            const id = link.href.replace('#', '');
            const isActive = !isActuPage && activeId === id;
            return (
              <li key={link.href}>
                <a
                  href={resolveHref(link.href)}
                  title={link.title}
                  className={isActive ? 'active' : ''}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="nav-active-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="nav-link-label">{link.label}</span>
                </a>
              </li>
            );
          })}

          {/* Nouvel onglet Actu — espace à part avec style distinct */}
          <li className="nav-actu-item">
            <a
              href="./ActuZip.html"
              title="Veille technologique & actualités IT"
              className={`nav-actu-link${isActuPage ? ' is-current' : ''}`}
            >
              <Radio size={14} className="nav-actu-icon" aria-hidden="true" />
              <span>Actu</span>
              <span className="nav-actu-dot" aria-hidden="true" />
            </a>
          </li>
        </ul>

        <AnimatePresence>
          {menuOpen && (
            <motion.ul
              className="nav-mobile active"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {data.links.map((link) => {
                const id = link.href.replace('#', '');
                const isActive = !isActuPage && activeId === id;
                return (
                  <li key={link.href}>
                    <a
                      href={resolveHref(link.href)}
                      title={link.title}
                      className={isActive ? 'active' : ''}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
              <li className="nav-mobile-actu">
                <a
                  href="./ActuZip.html"
                  title="Veille technologique & actualités IT"
                  className={`nav-actu-link${isActuPage ? ' is-current' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <Radio size={15} className="nav-actu-icon" aria-hidden="true" />
                  <span>Actu — Veille Tech</span>
                  <span className="nav-actu-dot" aria-hidden="true" />
                </a>
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
