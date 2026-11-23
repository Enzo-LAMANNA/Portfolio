import {
  ArrowRight,
  Briefcase,
  Compass,
  Cpu,
  FileText,
  FolderGit2,
  GraduationCap,
  Mail,
  MousePointerClick,
  Sparkles,
  User,
} from 'lucide-react';

const guideItems = [
  {
    href: '#moi',
    icon: User,
    title: 'À propos',
    desc: 'Apprendre qui je suis et quelles sont mes ambitions.',
  },
  {
    href: '#formation',
    icon: GraduationCap,
    title: 'Formations',
    desc: 'Découvrir les formations et certifications que j’ai suivies.',
  },
  {
    href: '#competence',
    icon: Cpu,
    title: 'Compétences',
    desc: 'Les compétences techniques et humaines acquises via mes formations, mes expériences pro ou mes projets perso.',
  },
  {
    href: '#experience',
    icon: Briefcase,
    title: 'Expériences',
    desc: 'Mes expériences professionnelles et leurs détails.',
  },
  {
    href: '#projet',
    icon: FolderGit2,
    title: 'Projets',
    desc: 'Mes projets techniques réalisés au sein de mes formations ou de manière personnelle.',
  },
  {
    href: '#divers',
    icon: Sparkles,
    title: 'Divers',
    desc: 'Ce que je fais à côté durant mon temps libre.',
  },
  {
    href: '#cv',
    icon: FileText,
    title: 'CV',
    desc: 'Mon CV si mon profil vous intéresse.',
  },
  {
    href: '#contact',
    icon: Mail,
    title: 'Contact',
    desc: 'Section si vous souhaitez me contacter avec mes coordonnées.',
  },
];

export default function GuideSection() {
  return (
    <section id="guide" aria-label="Guide de navigation du portfolio">
      <div className="section-container">
        <div className="guide-box">
          <div className="guide-header">
            <span className="guide-kicker">
              <Compass size={17} aria-hidden="true" />
              Guide de visite
            </span>
            <h2>
              Bienvenue sur mon portfolio en ligne
              <span className="section-title-line" aria-hidden="true" />
            </h2>
            <p className="guide-intro">
              Vous pouvez naviguer simplement en faisant défiler la page vers le bas ou à l&apos;aide des onglets situés en haut pour rejoindre directement la section qui vous intéresse.
            </p>
            <p className="guide-tip">
              <MousePointerClick size={18} aria-hidden="true" />
              <span>
                Certains volets et cartes sont à <strong>déplier ou cliquer</strong> : utilisez les boutons <strong>+</strong> ou en forme de <strong>flèche</strong> pour en afficher tous les détails.
              </span>
            </p>
          </div>

          <div className="guide-grid">
            {guideItems.map((item) => {
              const Icon = item.icon;
              return (
                <a key={item.href} href={item.href} className="guide-card">
                  <div className="guide-card-top">
                    <span className="guide-card-icon" aria-hidden="true">
                      <Icon size={18} />
                    </span>
                    <span className="guide-card-title">{item.title}</span>
                    <ArrowRight size={15} className="guide-card-arrow" aria-hidden="true" />
                  </div>
                  <p className="guide-card-desc">{item.desc}</p>
                </a>
              );
            })}
          </div>

          <div className="guide-legend">
            <p className="guide-legend-title">Légende des indicateurs de dates et statuts</p>
            <div className="guide-legend-items">
              <div className="guide-legend-row">
                <span className="date-badge past">Passé</span>
                <span>La date est passée, cela a déjà été réalisé</span>
              </div>
              <div className="guide-legend-row">
                <span className="date-badge current">En cours</span>
                <span>Formation, projet ou certification en cours</span>
              </div>
              <div className="guide-legend-row">
                <span className="date-badge licence">Cas spécial</span>
                <span>Réalisé, mais dans un cadre ou un cas particulier</span>
              </div>
              <div className="guide-legend-row">
                <span className="date-badge version">v1.0.0</span>
                <span>Version d&apos;un projet personnel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
