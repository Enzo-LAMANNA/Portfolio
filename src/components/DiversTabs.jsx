import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function DiversTabs({ items }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeItem = items[activeIdx] || items[0];

  return (
    <div className="divers-tabs-wrap">
      <div className="divers-tab-bar" role="tablist" aria-label="Centres d'intérêt">
        {items.map((item, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`divers-tab-btn${isActive ? ' is-active' : ''}`}
              onClick={() => setActiveIdx(idx)}
            >
              {isActive && (
                <motion.span
                  layoutId="divers-active-bg"
                  className="divers-active-bg"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="divers-tab-inner">
                <span className="divers-tab-title">{item.title}</span>
                {item.badge && (
                  <span className={item.badge.className}>{item.badge.text}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="divers-stage" role="tabpanel">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="details-content divers-stage-content"
            dangerouslySetInnerHTML={{ __html: activeItem.contentHtml }}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
