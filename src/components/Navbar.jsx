import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Navbar({ data }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState('accueil');

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    // 1. Etat scrolled sans lecture DOM (0 reflow)
    const onScroll = () => {
      const next = window.scrollY > 50;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // 2. Section active via IntersectionObserver (0 getBoundingClientRect au scroll)
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
  }, [data.links]);

  return (
    <>
      <motion.div id="scroll-progress" style={{ scaleX }} aria-hidden="true" />
      <motion.nav
        id="navbar"
        className={scrolled ? 'scrolled' : ''}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="nav-logo">{data.logo}</p>

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
            const isActive = activeId === id;
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  title={link.title}
                  className={isActive ? 'active' : ''}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="nav-active-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                    />
                  )}
                  <span className="nav-link-label">{link.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <AnimatePresence>
          {menuOpen && (
            <motion.ul
              className="nav-mobile active"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {data.links.map((link) => {
                const id = link.href.replace('#', '');
                const isActive = activeId === id;
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      title={link.title}
                      className={isActive ? 'active' : ''}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
