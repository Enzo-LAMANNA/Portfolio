import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Briefcase, ChevronRight } from 'lucide-react';

export default function ExperienceShowcase({ items, groups }) {
  const allItems = useMemo(
    () => (groups ? groups.flatMap((g) => g.items) : items || []),
    [groups, items]
  );
  const [selectedId, setSelectedId] = useState(allItems[0]?.id || null);
  const activeItem = allItems.find((i) => i.id === selectedId) || allItems[0];

  const renderGroup = (group, gi) => (
    <div key={gi} className="exp-tab-group">
      {group.subTitle && <p className="exp-sub-label">{group.subTitle}</p>}
      <div className="exp-tab-group-list">
        {group.items.map((item) => {
          const isActive = item.id === activeItem?.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`exp-tab${isActive ? ' is-active' : ''}`}
              onClick={() => setSelectedId(item.id)}
            >
              <span className="exp-tab-icon" aria-hidden="true">
                <Briefcase size={17} />
              </span>
              <span className="exp-tab-body">
                <span className="exp-tab-title">{item.title}</span>
                {item.badge && (
                  <span className={item.badge.className}>{item.badge.text}</span>
                )}
              </span>
              <span className="exp-tab-arrow" aria-hidden="true">
                <ChevronRight size={18} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="exp-showcase">
      <div className="exp-tabs" role="tablist" aria-label="Sélectionner une expérience">
        {groups ? groups.map(renderGroup) : renderGroup({ subTitle: null, items: allItems }, 0)}
      </div>

      {activeItem && (
        <div className="exp-panel" role="tabpanel">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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
      )}
    </div>
  );
}
