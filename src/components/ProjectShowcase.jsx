import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';

function getSnippet(html) {
  const plain = html
    .replace(/<div class="formation-details[\s\S]*?<\/div>\s*<\/div>/gi, ' ')
    .replace(/<h4[^>]*>[\s\S]*?<\/h4>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > 155 ? plain.slice(0, 152).trim() + '…' : plain;
}

export default function ProjectShowcase({ groups }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [selected]);

  const enrichedGroups = useMemo(
    () =>
      groups.map((g) => ({
        ...g,
        items: g.items.map((item) => ({ ...item, snippet: getSnippet(item.contentHtml) })),
      })),
    [groups]
  );

  return (
    <>
      {enrichedGroups.map((group, gi) => (
        <div key={gi} className="proj-group">
          {group.subTitle && (
            <h3 className="sub-section-title">{group.subTitle}</h3>
          )}
          <div className="proj-grid">
            {group.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="proj-card"
                onClick={() => setSelected(item)}
              >
                <div className="proj-card-top">
                  {item.badge && (
                    <span className={item.badge.className}>{item.badge.text}</span>
                  )}
                  <span className="proj-open-icon" aria-hidden="true">
                    <ArrowUpRight size={17} />
                  </span>
                </div>
                <h4 className="proj-card-title">{item.title}</h4>
                <p className="proj-card-snippet">{item.snippet}</p>
              </button>
            ))}
          </div>
        </div>
      ))}

      <AnimatePresence>
        {selected && (
          <motion.div
            className="proj-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="proj-modal"
              role="dialog"
              aria-modal="true"
              aria-label={selected.title}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="proj-modal-header">
                <div>
                  <h3>{selected.title}</h3>
                  {selected.badge && (
                    <span className={selected.badge.className}>
                      {selected.badge.text}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="proj-modal-close"
                  aria-label="Fermer"
                  onClick={() => setSelected(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <div
                className="details-content proj-modal-body"
                dangerouslySetInnerHTML={{ __html: selected.contentHtml }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
