import { useRef } from 'react';
import NetworkCanvas from './NetworkCanvas';
import SocialLinks from './SocialLinks';

export default function Footer({ data, socials }) {
  const footerRef = useRef(null);

  return (
    <footer className="site-footer" ref={footerRef}>
      <NetworkCanvas containerRef={footerRef} />
      <div className="footer-inner">
        <p className="footer-thanks">{data.thanks}</p>
        <SocialLinks socials={socials} className="footer-socials" />
        <p className="footer-copy">{data.copy}</p>
      </div>
    </footer>
  );
}
