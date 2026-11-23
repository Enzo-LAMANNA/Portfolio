import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ExperienceShowcase({ items }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeItem = items[selectedIdx] || items[0];

  return (
    <div className="exp-showcase">
      <div className="exp-tabs" role="tablist" aria-label="Expériences">
        {items.map((item, idx) => {
          const isActive = idx === selectedIdx;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`exp-tab${isActive ? ' is-active' : ''}`}
              onClick={() => setSelectedIdx(idx)}
            >
              {isActive && (
                <motion.span
                  layoutId="exp-active-bar"
                  className="exp-active-bar"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="exp-tab-title">{item.title}</span>
              {item.badge && (
                <span className={item.badge.className}>{item.badge.text}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="exp-panel" role="tabpanel">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="exp-panel-header">
              <h3>{activeItem.title}</h3>
              {activeItem.badge && (
                <span className={activeItem.badge.className}>
                  {activeItem.badge.text}
                </span>
              )}
            </div>
            <div
              className="details-content exp-panel-content"
              dangerouslySetInnerHTML={{ __html: activeItem.contentHtml }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
