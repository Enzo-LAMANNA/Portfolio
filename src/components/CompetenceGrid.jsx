export default function CompetenceGrid({ groups }) {
  return (
    <>
      {groups.map((group, gi) => {
        const count = group.items.length;
        const gridClass =
          count >= 4
            ? 'comp-grid comp-grid-4'
            : count === 3
              ? 'comp-grid comp-grid-3'
              : 'comp-grid comp-grid-1';

        return (
          <div key={gi} className="comp-group">
            {group.subTitle && (
              <h3 className="sub-section-title">{group.subTitle}</h3>
            )}
            <div className={gridClass}>
              {group.items.map((item) => (
                <div key={item.id} className="comp-card">
                  <div className="comp-card-head">
                    <span className="comp-dot" aria-hidden="true" />
                    <h4>{item.title}</h4>
                    {item.badge && (
                      <span className={item.badge.className}>{item.badge.text}</span>
                    )}
                  </div>
                  <div
                    className="comp-card-body"
                    dangerouslySetInnerHTML={{ __html: item.contentHtml }}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
