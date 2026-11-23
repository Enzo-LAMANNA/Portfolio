import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  ExternalLink,
  Music,
  Palette,
  Sparkles,
  X,
  ZoomIn,
} from 'lucide-react';

function getDiversIcon(title) {
  const t = title.toLowerCase();
  if (t.includes('dessin')) return <Palette size={20} />;
  if (t.includes('piano')) return <Music size={20} />;
  if (t.includes('musculation') || t.includes('sport')) return <Dumbbell size={20} />;
  return <Sparkles size={20} />;
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function DiversTabs({ items }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const activeItem = items[activeIdx] || items[0];
  const gallery = activeItem.gallery || null;
  const currentArt = gallery && lightboxIdx !== null ? gallery[lightboxIdx] : null;

  useEffect(() => {
    if (!currentArt || !gallery) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      else if (e.key === 'ArrowRight') setLightboxIdx((i) => (i + 1) % gallery.length);
      else if (e.key === 'ArrowLeft') setLightboxIdx((i) => (i - 1 + gallery.length) % gallery.length);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [currentArt, gallery]);

  const lightboxModal = (
    <AnimatePresence>
      {currentArt && gallery && (
        <motion.div
          className="art-lightbox-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setLightboxIdx(null)}
        >
          <motion.div
            className="art-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={currentArt.title}
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="art-lightbox-close"
              aria-label="Fermer l'aperçu"
              onClick={() => setLightboxIdx(null)}
            >
              <X size={20} />
            </button>

            <div className="art-lightbox-media">
              {gallery.length > 1 && (
                <button
                  type="button"
                  className="art-lightbox-nav art-lightbox-prev"
                  aria-label="Œuvre précédente"
                  onClick={() => setLightboxIdx((i) => (i - 1 + gallery.length) % gallery.length)}
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              <img
                src={currentArt.src}
                alt={currentArt.title}
                className="art-lightbox-img"
              />

              {gallery.length > 1 && (
                <button
                  type="button"
                  className="art-lightbox-nav art-lightbox-next"
                  aria-label="Œuvre suivante"
                  onClick={() => setLightboxIdx((i) => (i + 1) % gallery.length)}
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>

            <div className="art-lightbox-caption">
              <h4>{currentArt.title}</h4>
              <p>{currentArt.description}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

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
              onClick={() => {
                setActiveIdx(idx);
                setLightboxIdx(null);
              }}
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
          >
            <div dangerouslySetInnerHTML={{ __html: activeItem.contentHtml }} />

            {gallery && (
              <div className="art-gallery">
                {gallery.map((art, idx) => (
                  <figure key={art.src} className="art-card">
                    <button
                      type="button"
                      className="art-card-btn"
                      onClick={() => setLightboxIdx(idx)}
                      aria-label={`Agrandir et lire l'explication de « ${art.title} »`}
                    >
                      <div className="art-frame">
                        <img
                          src={art.src}
                          alt={art.title}
                          className="art-img"
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="art-zoom-badge" aria-hidden="true">
                          <ZoomIn size={16} />
                        </span>
                      </div>
                      <figcaption className="art-caption">{art.title}</figcaption>
                    </button>
                  </figure>
                ))}
              </div>
            )}

            {activeItem.instagram && (
              <div className="art-insta-cta">
                <p className="art-insta-text">{activeItem.instagram.text}</p>
                <a
                  href={activeItem.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-insta"
                >
                  <InstagramIcon />
                  <span>{activeItem.instagram.label}</span>
                  <ExternalLink size={15} aria-hidden="true" />
                </a>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {typeof document !== 'undefined' && createPortal(lightboxModal, document.body)}
    </div>
  );
}
