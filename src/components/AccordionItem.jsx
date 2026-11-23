import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ChevronDown, ChevronRight, Plus } from 'lucide-react';

function ToggleIcon({ variant, isOpen }) {
  if (variant === 'competence') {
    return (
      <motion.span
        className="accordion-icon"
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
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
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
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
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
    >
      <Plus size={16} strokeWidth={2.4} />
    </motion.span>
  );
}

export default function AccordionItem({ item, variant = 'formation' }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  return (
    <div className={`formation-item${isOpen ? ' is-open' : ''}${item.featured ? ' is-featured' : ''}`}>
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
                height: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.25, delay: 0.06 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.16 },
              },
            }}
          >
            <div
              className="details-content"
              dangerouslySetInnerHTML={{ __html: item.contentHtml }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
