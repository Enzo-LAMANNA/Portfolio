import { motion } from 'framer-motion';
import { CheckCircle2, Download, FileText } from 'lucide-react';

export default function CvSection({ data }) {
  return (
    <div className="cv-content-block">
      {/* Colonne gauche : aperçu CV + bouton télécharger */}
      <div className="cv-left-col">
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

      {/* Colonne droite : encart présentation du CV */}
      <div className="cv-right-col">
        <div className="cv-info-card">
          <span className="cv-info-badge">
            <FileText size={16} aria-hidden="true" />
            Curriculum Vitae — Format PDF
          </span>
          <h3 className="cv-info-title">Retrouvez mon parcours en un coup d&apos;œil</h3>
          <p className="cv-intro-text">
            Retrouvez mon CV ci-contre : survolez l&apos;aperçu ou cliquez sur le bouton pour le télécharger au format PDF et le consulter en haute qualité.
          </p>
          <ul className="cv-highlights">
            <li>
              <CheckCircle2 size={17} aria-hidden="true" />
              <span>Synthèse de mes formations, certifications et compétences techniques</span>
            </li>
            <li>
              <CheckCircle2 size={17} aria-hidden="true" />
              <span>Expériences professionnelles et objectifs de stage (avril 2027)</span>
            </li>
            <li>
              <CheckCircle2 size={17} aria-hidden="true" />
              <span>Prêt à imprimer ou à partager avec votre équipe recrutement</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
