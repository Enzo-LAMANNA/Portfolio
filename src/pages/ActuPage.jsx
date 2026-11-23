import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowDownUp,
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  ExternalLink,
  Filter,
  Flame,
  History,
  Newspaper,
  RefreshCw,
  RotateCcw,
  Search,
  TrendingUp,
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import Navbar from '../components/Navbar';
import NetworkCanvas from '../components/NetworkCanvas';
import BackToTop from '../components/BackToTop';
import Footer from '../components/Footer';

const DATE_FILTERS = [
  { id: 'all', label: 'Toutes les dates' },
  { id: 'today', label: "Aujourd'hui" },
  { id: '7d', label: '7 derniers jours' },
  { id: 'month', label: 'Ce mois-ci' },
];

const BADGE_FILTERS = [
  { id: 'all', label: 'Tous les types' },
  { id: 'Alerte / Faille', label: 'Alerte / Faille' },
  { id: 'Mise à jour', label: 'Mise à jour' },
  { id: 'Actu / Tendance', label: 'Actu / Tendance' },
];

const FOOTER_DISCLAIMER =
  "Note de transparence : l'objectif d'ActuZip n'est en aucun cas de s'approprier ou de voler l'information. Ces articles ne sont pas rédigés par mes soins : il s'agit uniquement d'un outil personnel de veille pratique destiné à synthétiser l'actualité cybersécurité et informatique générale, en renvoyant systématiquement vers les sources originales (IT-Connect et ZDNet France).";

function formatDateFr(iso) {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

function formatDateTimeFr(iso) {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

function formatRelative(ts) {
  const diffSec = Math.max(0, Math.floor(Date.now() / 1000) - ts);
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Il y a ${Math.max(1, diffMin)} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'Hier';
  if (diffD < 30) return `Il y a ${diffD} jours`;
  return formatDateFr(new Date(ts * 1000).toISOString());
}

function getCategoryClass(cat) {
  const c = (cat || '').toLowerCase();
  if (c.includes('cyber')) return 'actu-cat-badge cat-cyber';
  if (c.includes('logiciel') || c.includes('os')) return 'actu-cat-badge cat-os';
  if (c.includes('matériel') || c.includes('materiel')) return 'actu-cat-badge cat-hw';
  if (c.includes('web')) return 'actu-cat-badge cat-web';
  return 'actu-cat-badge cat-info';
}

function TypeBadge({ badge }) {
  if (!badge) return null;
  if (badge === 'Alerte / Faille') {
    return (
      <span className="actu-type-badge type-alert">
        <AlertTriangle size={13} aria-hidden="true" />
        {badge}
      </span>
    );
  }
  if (badge === 'Mise à jour') {
    return (
      <span className="actu-type-badge type-update">
        <RefreshCw size={13} aria-hidden="true" />
        {badge}
      </span>
    );
  }
  return (
    <span className="actu-type-badge type-trend">
      <TrendingUp size={13} aria-hidden="true" />
      {badge}
    </span>
  );
}

function AnalysisGrid({ summary, compact = false }) {
  if (!summary) return null;
  return (
    <div className={`actu-analysis-grid${compact ? ' is-compact' : ''}`}>
      <div className="actu-analysis-item">
        <span className="actu-analysis-label">Contexte</span>
        <p>{summary.contexte}</p>
      </div>
      <div className="actu-analysis-item">
        <span className="actu-analysis-label">Quoi</span>
        <p>{summary.quoi}</p>
      </div>
      <div className="actu-analysis-item">
        <span className="actu-analysis-label">Pourquoi</span>
        <p>{summary.pourquoi}</p>
      </div>
      <div className="actu-analysis-item">
        <span className="actu-analysis-label">Conséquence</span>
        <p>{summary.consequence}</p>
      </div>
    </div>
  );
}

function HistoryCard({ art }) {
  const [open, setOpen] = useState(false);
  const summary = art.ai_summary || null;

  return (
    <article className={`actu-card actu-history-card${open ? ' is-expanded' : ''}`}>
      <div className="actu-card-meta">
        {summary?.badge && <TypeBadge badge={summary.badge} />}
        <span className={`actu-source-badge ${art.source === 'IT-Connect' ? 'src-itc' : 'src-zdnet'}`}>
          {art.source}
        </span>
        <span className={getCategoryClass(art.category)}>{art.category}</span>
      </div>

      <h3 className="actu-card-title">
        <a href={art.link} target="_blank" rel="noopener noreferrer">
          {art.title}
        </a>
      </h3>

      <p className="actu-card-desc actu-card-desc-short">{art.description}</p>

      {summary && (
        <div className="actu-history-accordion">
          <button
            type="button"
            className="actu-analysis-toggle"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span>{open ? "Masquer l'analyse" : "Voir l'analyse"}</span>
            <ChevronDown
              size={16}
              className={`actu-toggle-chevron${open ? ' is-rotated' : ''}`}
              aria-hidden="true"
            />
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                className="actu-analysis-collapse"
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: 'auto',
                  opacity: 1,
                  transition: {
                    height: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.22, delay: 0.05 },
                  },
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: { duration: 0.24, ease: [0.4, 0, 0.2, 1] },
                    opacity: { duration: 0.14 },
                  },
                }}
              >
                <AnalysisGrid summary={summary} compact />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="actu-card-footer">
        <span className="actu-date" title={formatDateTimeFr(art.published_at)}>
          <Calendar size={14} aria-hidden="true" />
          {formatDateFr(art.published_at)}
        </span>
        <a
          href={art.link}
          target="_blank"
          rel="noopener noreferrer"
          className="actu-read-link"
        >
          <span>Source originale</span>
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

export default function ActuPage() {
  const { nav, hero, footer } = portfolioData;
  const heroRef = useRef(null);

  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dateFilter, setDateFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [badgeFilter, setBadgeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(18);

  useEffect(() => {
    fetch('./ActuZip.json', { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setPayload(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Impossible de charger ActuZip.json');
        setLoading(false);
      });
  }, []);

  const allArticles = payload?.articles || [];
  const sources = payload?.sources || ['IT-Connect', 'ZDNet France'];
  const categories = payload?.categories || [];

  // Les 3 actus les plus récentes : grandes cartes détaillées en haut
  const featuredArticles = useMemo(() => allArticles.slice(0, 3), [allArticles]);
  const featuredIds = useMemo(() => new Set(featuredArticles.map((a) => a.id)), [featuredArticles]);

  const hasActiveFilter =
    dateFilter !== 'all' ||
    sourceFilter !== 'all' ||
    categoryFilter !== 'all' ||
    badgeFilter !== 'all' ||
    query.trim() !== '' ||
    sortOrder !== 'desc';

  const filteredArticles = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
    const sevenDaysAgo = Date.now() / 1000 - 7 * 86400;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000;
    const q = query.trim().toLowerCase();

    const list = allArticles.filter((art) => {
      // Hors filtres, l'historique affiche les articles qui suivent les 3 actus du moment
      if (!hasActiveFilter && featuredIds.has(art.id)) return false;

      if (sourceFilter !== 'all' && art.source !== sourceFilter) return false;
      if (categoryFilter !== 'all' && art.category !== categoryFilter) return false;
      if (badgeFilter !== 'all' && art.ai_summary?.badge !== badgeFilter) return false;

      if (dateFilter === 'today' && art.published_ts < startOfToday) return false;
      if (dateFilter === '7d' && art.published_ts < sevenDaysAgo) return false;
      if (dateFilter === 'month' && art.published_ts < startOfMonth) return false;

      if (q) {
        const s = art.ai_summary || {};
        const hay = `${art.title} ${art.description} ${art.source} ${art.category} ${s.contexte || ''} ${s.quoi || ''} ${s.pourquoi || ''} ${s.consequence || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });

    list.sort((a, b) =>
      sortOrder === 'desc' ? b.published_ts - a.published_ts : a.published_ts - b.published_ts
    );

    return list;
  }, [
    allArticles,
    dateFilter,
    sourceFilter,
    categoryFilter,
    badgeFilter,
    sortOrder,
    query,
    hasActiveFilter,
    featuredIds,
  ]);

  const resetFilters = () => {
    setDateFilter('all');
    setSourceFilter('all');
    setCategoryFilter('all');
    setBadgeFilter('all');
    setSortOrder('desc');
    setQuery('');
    setVisibleCount(18);
  };

  return (
    <MotionConfig reducedMotion="user">
      <Navbar data={nav} isActuPage />

      {/* En-tête ActuZip (constellation + charte sombre bordeaux) */}
      <header id="accueil" className="actu-hero" ref={heroRef}>
        <NetworkCanvas containerRef={heroRef} />

        <div className="section-container actu-hero-inner">
          <div className="actu-hero-top">
            <a href="./index.html" className="actu-back-link">
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Retour au portfolio</span>
            </a>
          </div>

          <h1 className="actu-title">
            <span className="highlight">ActuZip</span>
          </h1>
          <p className="actu-subtitle">
            Tableau de bord de veille technologique Réseaux, Systèmes, Cybersécurité et Informatique — synthétisé automatiquement depuis <strong>IT-Connect</strong> et <strong>ZDNet France</strong>.
          </p>

          <div className="actu-stats-row">
            <div className="actu-stat-card">
              <Newspaper size={18} aria-hidden="true" />
              <div>
                <strong>{allArticles.length} articles</strong>
                <span>Suivis dans l&apos;historique</span>
              </div>
            </div>
            <div className="actu-stat-card">
              <Filter size={18} aria-hidden="true" />
              <div>
                <strong>{sources.length} sources fiables</strong>
                <span>{sources.join(' · ')}</span>
              </div>
            </div>
            <div className="actu-stat-card">
              <Clock size={18} aria-hidden="true" />
              <div>
                <strong>Dernière mise à jour</strong>
                <span>{payload?.updated_at ? formatDateTimeFr(payload.updated_at) : 'Chargement…'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="actu-main">
        {loading && (
          <section className="actu-section">
            <div className="section-container">
              <div className="actu-state-box">Chargement des actualités en cours…</div>
            </div>
          </section>
        )}

        {error && (
          <section className="actu-section">
            <div className="section-container">
              <div className="actu-state-box is-error">
                Impossible de charger <code>ActuZip.json</code> ({error}). Exécutez <code>python fetch_actu.py</code> pour le générer.
              </div>
            </div>
          </section>
        )}

        {!loading && !error && (
          <>
            {/* SECTION 1 : LES 3 ACTUS DU MOMENT (grandes cartes détaillées avec analyse 4 points directe) */}
            <section className="actu-section actu-featured-section" aria-label="Les 3 actus du moment">
              <div className="section-container">
                <div className="actu-section-head">
                  <h2>
                    <Flame size={24} className="actu-head-icon" aria-hidden="true" />
                    Les 3 actus du moment
                    <span className="section-title-line" aria-hidden="true" />
                  </h2>
                  <p className="actu-section-note">Analyse complète en 4 points affichée directement</p>
                </div>

                <div className="actu-spotlight-list">
                  {featuredArticles.map((art, idx) => (
                    <article
                      key={art.id}
                      className={`actu-card actu-spotlight-card${idx === 0 ? ' is-lead' : ''}`}
                    >
                      <div className="actu-spotlight-top">
                        <div className="actu-card-meta">
                          <span className="actu-rank-pill">#{idx + 1}</span>
                          {art.ai_summary?.badge && <TypeBadge badge={art.ai_summary.badge} />}
                          <span className={`actu-source-badge ${art.source === 'IT-Connect' ? 'src-itc' : 'src-zdnet'}`}>
                            {art.source}
                          </span>
                          <span className={getCategoryClass(art.category)}>{art.category}</span>
                        </div>
                        <span className="actu-date" title={formatDateTimeFr(art.published_at)}>
                          <Calendar size={14} aria-hidden="true" />
                          {formatRelative(art.published_ts)} · {formatDateFr(art.published_at)}
                        </span>
                      </div>

                      <div className="actu-spotlight-body">
                        <div className="actu-spotlight-left">
                          <h3 className="actu-spotlight-title">
                            <a href={art.link} target="_blank" rel="noopener noreferrer">
                              {art.title}
                            </a>
                          </h3>
                          <p className="actu-spotlight-desc">{art.description}</p>
                          <a
                            href={art.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="actu-source-btn"
                          >
                            <span>Lire l&apos;article complet sur {art.source}</span>
                            <ExternalLink size={15} aria-hidden="true" />
                          </a>
                        </div>

                        {art.ai_summary && (
                          <div className="actu-spotlight-right">
                            <AnalysisGrid summary={art.ai_summary} />
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 2 : HISTORIQUE / TOUTES LES ACTUS (cartes compactes + accordéon Voir l'analyse) */}
            <section className="actu-section actu-feed-section" aria-label="Historique et toutes les actus">
              <div className="section-container">
                <div className="actu-section-head">
                  <h2>
                    <History size={24} className="actu-head-icon" aria-hidden="true" />
                    Historique / Toutes les actus
                    <span className="section-title-line" aria-hidden="true" />
                  </h2>
                  <p className="actu-section-note">
                    {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''}
                  </p>
                </div>

                {/* Panneau de filtres */}
                <div className="actu-toolbar">
                  <div className="actu-toolbar-row">
                    <div className="actu-filter-group">
                      <span className="actu-filter-label">
                        <Calendar size={14} aria-hidden="true" />
                        Période
                      </span>
                      <div className="actu-pill-group">
                        {DATE_FILTERS.map((df) => (
                          <button
                            key={df.id}
                            type="button"
                            className={`actu-pill${dateFilter === df.id ? ' is-active' : ''}`}
                            onClick={() => {
                              setDateFilter(df.id);
                              setVisibleCount(18);
                            }}
                          >
                            {df.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="actu-sort-btn"
                      onClick={() => setSortOrder((s) => (s === 'desc' ? 'asc' : 'desc'))}
                    >
                      <ArrowDownUp size={15} aria-hidden="true" />
                      <span>{sortOrder === 'desc' ? 'Plus récents d’abord' : 'Plus anciens d’abord'}</span>
                    </button>
                  </div>

                  <div className="actu-toolbar-row">
                    <div className="actu-filter-group">
                      <span className="actu-filter-label">Type</span>
                      <div className="actu-pill-group">
                        {BADGE_FILTERS.map((bf) => (
                          <button
                            key={bf.id}
                            type="button"
                            className={`actu-pill${badgeFilter === bf.id ? ' is-active' : ''}`}
                            onClick={() => {
                              setBadgeFilter(bf.id);
                              setVisibleCount(18);
                            }}
                          >
                            {bf.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="actu-filter-group">
                      <span className="actu-filter-label">Source</span>
                      <div className="actu-pill-group">
                        <button
                          type="button"
                          className={`actu-pill${sourceFilter === 'all' ? ' is-active' : ''}`}
                          onClick={() => {
                            setSourceFilter('all');
                            setVisibleCount(18);
                          }}
                        >
                          Toutes
                        </button>
                        {sources.map((src) => (
                          <button
                            key={src}
                            type="button"
                            className={`actu-pill${sourceFilter === src ? ' is-active' : ''}`}
                            onClick={() => {
                              setSourceFilter(src);
                              setVisibleCount(18);
                            }}
                          >
                            {src}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="actu-toolbar-row">
                    <div className="actu-filter-group">
                      <span className="actu-filter-label">Catégorie</span>
                      <div className="actu-pill-group">
                        <button
                          type="button"
                          className={`actu-pill${categoryFilter === 'all' ? ' is-active' : ''}`}
                          onClick={() => {
                            setCategoryFilter('all');
                            setVisibleCount(18);
                          }}
                        >
                          Toutes
                        </button>
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            className={`actu-pill${categoryFilter === cat ? ' is-active' : ''}`}
                            onClick={() => {
                              setCategoryFilter(cat);
                              setVisibleCount(18);
                            }}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="actu-toolbar-search">
                    <div className="actu-search-wrap">
                      <Search size={16} aria-hidden="true" />
                      <input
                        type="search"
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          setVisibleCount(18);
                        }}
                        placeholder="Rechercher un mot-clé dans les titres ou les analyses (ex : faille, Linux, Cisco…)"
                        aria-label="Rechercher une actualité"
                      />
                    </div>
                    {hasActiveFilter && (
                      <button type="button" className="actu-reset-btn" onClick={resetFilters}>
                        <RotateCcw size={15} aria-hidden="true" />
                        <span>Réinitialiser</span>
                      </button>
                    )}
                  </div>
                </div>

                {filteredArticles.length === 0 ? (
                  <div className="actu-state-box">
                    Aucune actualité ne correspond à ces filtres. Essayez d&apos;élargir la période ou de réinitialiser les filtres.
                  </div>
                ) : (
                  <>
                    <div className="actu-grid">
                      {filteredArticles.slice(0, visibleCount).map((art) => (
                        <HistoryCard key={art.id} art={art} />
                      ))}
                    </div>

                    {visibleCount < filteredArticles.length && (
                      <div className="actu-load-more">
                        <button
                          type="button"
                          className="btn-download"
                          onClick={() => setVisibleCount((c) => c + 18)}
                        >
                          Afficher plus d&apos;actualités ({filteredArticles.length - visibleCount} restantes)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          </>
        )}

        <BackToTop />
      </main>

      <Footer
        data={footer}
        socials={hero.socials}
        onEmailClick={() => {
          window.location.href = './index.html#contact';
        }}
        instagramUrl="https://www.instagram.com/intakk_iii/"
        topHref="#accueil"
        disclaimer={FOOTER_DISCLAIMER}
        showThanks={false}
      />
    </MotionConfig>
  );
}
