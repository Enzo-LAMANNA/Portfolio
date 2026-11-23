import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import NetworkCanvas from './NetworkCanvas';
import SocialLinks from './SocialLinks';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Hero({ data }) {
  const headerRef = useRef(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(rawY, { stiffness: 180, damping: 20 });
  const rotateY = useSpring(rawX, { stiffness: 180, damping: 20 });

  const handlePhotoMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rawX.set(px * 10);
    rawY.set(-py * 10);
  };

  const handlePhotoLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <header id="accueil" ref={headerRef}>
      <NetworkCanvas containerRef={headerRef} />

      <div className="header-container">
        <motion.div
          className="header-text"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.a
            href={data.latestProject.href}
            className="latest-project-notif"
            variants={itemVariants}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="pulse" />
            <span>{data.latestProject.text}</span>
            <ArrowRight size={15} className="notif-arrow" aria-hidden="true" />
          </motion.a>

          <hgroup>
            <motion.p className="pre-title" variants={itemVariants}>
              {data.preTitle}
            </motion.p>
            <motion.h1 variants={itemVariants}>
              <span className="highlight">{data.name}</span>
            </motion.h1>
            <motion.p
              id="maPresentation"
              variants={itemVariants}
              dangerouslySetInnerHTML={{ __html: data.presentationHtml }}
            />
            <motion.p
              id="monObjectif"
              variants={itemVariants}
              dangerouslySetInnerHTML={{ __html: data.objectifHtml }}
            />
          </hgroup>

          <motion.div variants={itemVariants}>
            <SocialLinks socials={data.socials} id="socialnetworks" />
          </motion.div>
        </motion.div>

        <motion.div
          className="header-image"
          style={{ perspective: 900 }}
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
          onMouseMove={handlePhotoMove}
          onMouseLeave={handlePhotoLeave}
        >
          <motion.div
            className="photo-tilt-inner"
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          >
            <img
              src={data.profileImg.src}
              alt={data.profileImg.alt}
              id="maPhotoProfil"
              width="310"
              height="413"
              fetchPriority="high"
              decoding="async"
            />
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
}
