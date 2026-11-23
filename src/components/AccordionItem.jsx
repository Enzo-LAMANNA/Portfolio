import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ChevronDown, ChevronRight, Plus } from 'lucide-react';

function ToggleIcon({ variant, isOpen }) {
  if (variant === 'competence') {
    return (
      <motion.span
        className="accordion-icon"
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      >
        <ChevronRight size={15} strokeWidth={2.5} />
      </motion.span>
    );
  }
  if (variant === 'experience') {
    return (
      <motion.span
        className="accordion-icon"
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      >
        <ArrowDown size={15} strokeWidth={2.4} />
      </motion.span>
    );
  }
  if (variant === 'divers') {
    return (
      <motion.span
        className="accordion-icon"
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      >
        <ChevronDown size={16} strokeWidth={2.4} />
      </motion.span>
    );
  }
  return (
    <motion.span
      className="accordion-icon"
      animate={{ rotate: isOpen ? 135 : 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
    >
      <Plus size={16} strokeWidth={2.4} />
    </motion.span>
  );
}

export default function AccordionItem({ item, variant = 'formation', index = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  const isGridVariant = variant === 'competence';

  return (
    <motion.div
      layout={isGridVariant ? 'position' : false}
      className={`formation-item${isOpen ? ' is-open' : ''}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{
        duration: 0.55,
        delay: Math.min(index * 0.055, 0.3),
        ease: [0.16, 1, 0.3, 1],
        layout: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
      }}
      onMouseMove={handleMouseMove}
    >
      <button
        type="button"
        className="accordion-trigger"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((v) => !v)}
      >
        <div className="summary-title">
          <h3>{item.title}</h3>
          {item.badge && (
            <span className={item.badge.className}>{item.badge.text}</span>
          )}
        </div>
        <ToggleIcon variant={variant} isOpen={isOpen} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={contentId}
            className="accordion-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: { duration: 0.46, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.32, delay: 0.08 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.34, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.2 },
              },
            }}
          >
            <motion.div
              className="details-content"
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              exit={{ y: -6 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              dangerouslySetInnerHTML={{ __html: item.contentHtml }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
