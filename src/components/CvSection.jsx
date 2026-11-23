import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

export default function CvSection({ data }) {
  return (
    <div className="cv-content-block">
      <a
        href={data.href}
        download
        className="cv-preview-card"
        aria-label="Télécharger le CV en PDF pour le voir en vrai"
      >
        <img
          src={data.previewImg}
          alt="Aperçu du CV d'Enzo LAMANNA"
          className="cv-preview-img"
          loading="lazy"
          decoding="async"
        />
        <div className="cv-preview-overlay">
          <span className="cv-overlay-icon" aria-hidden="true">
            <Download size={26} />
          </span>
          <p className="cv-overlay-title">Télécharger le CV en PDF</p>
          <p className="cv-overlay-sub">Cliquez pour télécharger le document et le voir en vrai</p>
        </div>
      </a>

      <div className="download-button-container">
        <motion.a
          href={data.href}
          download
          className="btn-download"
          whileHover={{ y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Download size={17} aria-hidden="true" />
          <span>{data.label}</span>
        </motion.a>
      </div>
    </div>
  );
}
