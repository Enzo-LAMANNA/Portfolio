import { useState } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import { Check, Mail } from 'lucide-react';
import { portfolioData } from './data/portfolioData';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SectionWrapper from './components/SectionWrapper';
import AccordionItem from './components/AccordionItem';
import CompetenceGrid from './components/CompetenceGrid';
import ExperienceShowcase from './components/ExperienceShowcase';
import ProjectShowcase from './components/ProjectShowcase';
import DiversTabs from './components/DiversTabs';
import CvSection from './components/CvSection';
import BackToTop from './components/BackToTop';
import Footer from './components/Footer';

export default function App() {
  const { nav, hero, moi, formation, competence, experience, projet, divers, cv, contact, footer } =
    portfolioData;
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(contact.email)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        })
        .catch(() => {});
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <Navbar data={nav} />
      <Hero data={hero} />

      <main>
        {/* À PROPOS */}
        <SectionWrapper id="moi" title={moi.title}>
          <div className="cards">
            <article dangerouslySetInnerHTML={{ __html: moi.contentHtml }} />
          </div>
        </SectionWrapper>

        {/* FORMATIONS & CERTIFICATIONS — Frise chronologique interactive */}
        <SectionWrapper id="formation" title={formation.title}>
          {formation.groups.map((group, gi) => (
            <div key={gi}>
              {group.subTitle &&
                (group.isH2 ? (
                  <h2 className="sub-section-title">{group.subTitle}</h2>
                ) : (
                  <h3 className="sub-section-title">{group.subTitle}</h3>
                ))}
              <div className="cards">
                {group.items.map((item) => (
                  <AccordionItem
                    key={item.id}
                    item={item}
                    variant="formation"
                  />
                ))}
              </div>
            </div>
          ))}
        </SectionWrapper>

        {/* COMPÉTENCES — Grille de cases par 4 déjà ouvertes */}
        <SectionWrapper id="competence" title={competence.title}>
          <h3
            className="sub-section-title competence-notice-title"
            dangerouslySetInnerHTML={{ __html: competence.noticeTitleHtml }}
          />
          <h3 className="sub-section-title competence-notice-text">
            {competence.noticeText}
          </h3>
          <CompetenceGrid groups={competence.groups} />
        </SectionWrapper>

        {/* EXPÉRIENCES — Panneau latéral interactif (Master-Detail) */}
        <SectionWrapper id="experience" title={experience.title}>
          <ExperienceShowcase items={experience.items} />
        </SectionWrapper>

        {/* PROJETS — Cartes dossiers techniques + Modale détaillée */}
        <SectionWrapper id="projet" title={projet.title}>
          <ProjectShowcase groups={projet.groups} />
        </SectionWrapper>

        {/* DIVERS — Onglets horizontaux avec contenu affiché */}
        <SectionWrapper id="divers" title={divers.title}>
          <DiversTabs items={divers.items} />
        </SectionWrapper>

        {/* CV — Aperçu PDF interactif + téléchargement */}
        <SectionWrapper id="cv" title={cv.title}>
          <CvSection data={cv} />
        </SectionWrapper>

        {/* CONTACT */}
        <SectionWrapper id="contact" title={contact.title}>
          <div className="cards contact-grid">
            <article className="contact-card">
              <p className="contact-action-text">{contact.text}</p>
              <motion.button
                type="button"
                className={`contact-email-pill${copied ? ' is-copied' : ''}`}
                onClick={handleCopyEmail}
                title="Cliquer pour copier l'adresse e-mail"
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {copied ? (
                  <Check size={18} aria-hidden="true" />
                ) : (
                  <Mail size={18} aria-hidden="true" />
                )}
                <span>{contact.email}</span>
              </motion.button>
            </article>
          </div>
        </SectionWrapper>

        <BackToTop />
      </main>

      <Footer data={footer} socials={hero.socials} />
    </MotionConfig>
  );
}
