import { useState } from 'react';
import { LayoutGroup, MotionConfig, motion } from 'framer-motion';
import { Check, Download, Mail } from 'lucide-react';
import { portfolioData } from './data/portfolioData';
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
      <Navbar data={nav} />
      <Hero data={hero} />

      <main>
        {/* À PROPOS */}
        <SectionWrapper id="moi" title={moi.title}>
          <div className="cards">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              dangerouslySetInnerHTML={{ __html: moi.contentHtml }}
            />
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
                {group.items.map((item, idx) => (
                  <AccordionItem
                    key={item.id}
                    item={item}
                    variant="formation"
                    index={idx}
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
            <LayoutGroup key={gi} id={`comp-group-${gi}`}>
              {group.subTitle && (
                <h3 className="sub-section-title">{group.subTitle}</h3>
              )}
              <div className="cards">
                {group.items.map((item, idx) => (
                  <AccordionItem
                    key={item.id}
                    item={item}
                    variant="competence"
                    index={idx}
                  />
                ))}
              </div>
            </LayoutGroup>
          ))}
        </SectionWrapper>

        {/* EXPÉRIENCES */}
        <SectionWrapper id="experience" title={experience.title}>
          <div className="cards layout-one-col">
            {experience.items.map((item, idx) => (
              <AccordionItem
                key={item.id}
                item={item}
                variant="experience"
                index={idx}
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
                {group.items.map((item, idx) => (
                  <AccordionItem
                    key={item.id}
                    item={item}
                    variant="projet"
                    index={idx}
                  />
                ))}
              </div>
            </div>
          ))}
        </SectionWrapper>

        {/* DIVERS */}
        <SectionWrapper id="divers" title={divers.title}>
          <div className="cards">
            {divers.items.map((item, idx) => (
              <AccordionItem
                key={item.id}
                item={item}
                variant="divers"
                index={idx}
              />
            ))}
          </div>
        </SectionWrapper>

        {/* CV */}
        <SectionWrapper id="cv" title={cv.title}>
          <motion.div
            className="cv-content-block"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
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
          </motion.div>
        </SectionWrapper>

        {/* CONTACT */}
        <SectionWrapper id="contact" title={contact.title}>
          <div className="cards contact-grid">
            <motion.article
              className="contact-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="contact-action-text">{contact.text}</p>
              <motion.button
                type="button"
                className={`contact-email-pill${copied ? ' is-copied' : ''}`}
                onClick={handleCopyEmail}
                title="Cliquer pour copier l'adresse e-mail"
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {copied ? (
                  <Check size={18} aria-hidden="true" />
                ) : (
                  <Mail size={18} aria-hidden="true" />
                )}
                <span>{contact.email}</span>
              </motion.button>
            </motion.article>
          </div>
        </SectionWrapper>

        <BackToTop />
      </main>

      <Footer data={footer} />
    </MotionConfig>
  );
}
