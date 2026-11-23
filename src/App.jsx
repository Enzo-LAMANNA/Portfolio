import { useState } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import { Check, Download, Mail } from 'lucide-react';
import { portfolioData } from './data/portfolioData';
import SmoothScroll from './components/SmoothScroll';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SectionWrapper from './components/SectionWrapper';
import AccordionItem from './components/AccordionItem';
import BackToTop from './components/BackToTop';
import Footer from './components/Footer';

export default function App() {
  const { nav, hero, moi, formation, competence, experience, projet, divers, cv, contact, footer } =
    portfolioData;
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(contact.email).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }).catch(() => {});
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-grid-layer" aria-hidden="true" />
      <SmoothScroll />
      <Navbar data={nav} />
      <Hero data={hero} />

      <main>
        {/* À PROPOS */}
        <SectionWrapper id="moi" title={moi.title}>
          <div className="cards">
            <article dangerouslySetInnerHTML={{ __html: moi.contentHtml }} />
          </div>
        </SectionWrapper>

        {/* FORMATIONS & CERTIFICATIONS */}
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

        {/* COMPÉTENCES */}
        <SectionWrapper id="competence" title={competence.title}>
          <h3
            className="sub-section-title competence-notice-title"
            dangerouslySetInnerHTML={{ __html: competence.noticeTitleHtml }}
          />
          <h3 className="sub-section-title competence-notice-text">
            {competence.noticeText}
          </h3>

          {competence.groups.map((group, gi) => (
            <div key={gi}>
              {group.subTitle && (
                <h3 className="sub-section-title">{group.subTitle}</h3>
              )}
              <div className="cards">
                {group.items.map((item) => (
                  <AccordionItem
                    key={item.id}
                    item={item}
                    variant="competence"
                  />
                ))}
              </div>
            </div>
          ))}
        </SectionWrapper>

        {/* EXPÉRIENCES */}
        <SectionWrapper id="experience" title={experience.title}>
          <div className="cards layout-one-col">
            {experience.items.map((item) => (
              <AccordionItem
                key={item.id}
                item={item}
                variant="experience"
              />
            ))}
          </div>
        </SectionWrapper>

        {/* PROJETS */}
        <SectionWrapper id="projet" title={projet.title}>
          {projet.groups.map((group, gi) => (
            <div key={gi}>
              {group.subTitle && (
                <h3 className="sub-section-title">{group.subTitle}</h3>
              )}
              <div className="cards layout-one-col">
                {group.items.map((item) => (
                  <AccordionItem
                    key={item.id}
                    item={item}
                    variant="projet"
                  />
                ))}
              </div>
            </div>
          ))}
        </SectionWrapper>

        {/* DIVERS */}
        <SectionWrapper id="divers" title={divers.title}>
          <div className="cards">
            {divers.items.map((item) => (
              <AccordionItem
                key={item.id}
                item={item}
                variant="divers"
              />
            ))}
          </div>
        </SectionWrapper>

        {/* CV */}
        <SectionWrapper id="cv" title={cv.title}>
          <div className="cv-content-block">
            <div className="download-button-container">
              <motion.a
                href={cv.href}
                download
                className="btn-download"
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Download size={17} aria-hidden="true" />
                <span>{cv.label}</span>
              </motion.a>
            </div>
          </div>
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

      <Footer data={footer} />
    </MotionConfig>
  );
}
