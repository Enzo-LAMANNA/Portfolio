import { useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import NetworkCanvas from './NetworkCanvas';
import SocialLinks from './SocialLinks';

export default function Footer({
  data,
  socials,
  onEmailClick,
  instagramUrl,
  topHref = '#accueil',
  disclaimer = null,
  showThanks = true,
}) {
  const footerRef = useRef(null);

  return (
    <footer className="site-footer" ref={footerRef}>
      <NetworkCanvas containerRef={footerRef} />
      <div className="footer-inner">
        <div className="footer-left">
          <SocialLinks
            socials={socials}
            className="footer-socials"
            onEmailClick={onEmailClick}
            instagramUrl={instagramUrl}
            compact
          />
        </div>

        <div className="footer-center">
          {showThanks && data.thanks && (
            <>
              <p className="footer-thanks">{data.thanks}</p>
              <span className="footer-divider" aria-hidden="true" />
            </>
          )}
          <p className="footer-copy">{data.copy}</p>
        </div>

        <div className="footer-right">
          <a href={topHref} className="footer-back-top">
            <ArrowUp size={16} aria-hidden="true" />
            <span>Revenir au début</span>
          </a>
        </div>
      </div>

      {disclaimer && (
        <div className="footer-disclaimer">
          <p>{disclaimer}</p>
        </div>
      )}
    </footer>
  );
}
