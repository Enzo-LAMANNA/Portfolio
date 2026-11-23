export default function SectionWrapper({ id, title, children }) {
  return (
    <section id={id}>
      <div className="section-container">
        <h2>
          {title}
          <span className="section-title-line" aria-hidden="true" />
        </h2>
        {children}
      </div>
    </section>
  );
}
