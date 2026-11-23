import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Dumbbell, Music, Palette, Sparkles } from 'lucide-react';

function getDiversIcon(title) {
  const t = title.toLowerCase();
  if (t.includes('dessin')) return <Palette size={20} />;
  if (t.includes('piano')) return <Music size={20} />;
  if (t.includes('musculation') || t.includes('sport')) return <Dumbbell size={20} />;
  return <Sparkles size={20} />;
}

export default function DiversTabs({ items }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeItem = items[activeIdx] || items[0];

  return (
    <div className="divers-tabs-wrap">
      <div className="divers-tab-bar" role="tablist" aria-label="Sélectionner une passion">
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
              <span className="divers-tab-icon" aria-hidden="true">
                {getDiversIcon(item.title)}
              </span>
              <span className="divers-tab-text">
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
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="details-content divers-stage-content"
            dangerouslySetInnerHTML={{ __html: activeItem.contentHtml }}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
