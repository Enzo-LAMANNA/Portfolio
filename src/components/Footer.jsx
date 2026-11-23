import { motion } from 'framer-motion';

export default function Footer({ data }) {
  return (
    <motion.footer
      className="site-footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7 }}
    >
      <p className="footer-thanks">{data.thanks}</p>
      <p className="footer-copy">{data.copy}</p>
    </motion.footer>
  );
}
