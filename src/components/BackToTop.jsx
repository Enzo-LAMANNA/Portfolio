import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="RevenirenHautContainer"
          initial={{ opacity: 0, y: 20, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.85 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.a
            href="#accueil"
            id="RevenirenHautButton"
            aria-label="Revenir en haut"
            whileHover={{ y: -4, scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
          >
            <ArrowUp size={18} strokeWidth={2.4} />
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
