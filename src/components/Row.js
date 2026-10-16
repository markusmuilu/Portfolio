// One section of a page: full width, on its own ground colour. The heading sits in the left column on wide
// screens and above the content on narrow ones.
//   field  "sky" | "navy" | "surface" | undefined (the page ground)
export default function Row({ label, sub, field, id, children }) {
  return (
    <section className={`row${field ? ` field-${field}` : ""}`} id={id}>
      <div className="wrap row-grid">
        <div className="row-head">
          <h2>{label}</h2>
          {sub && <p className="row-note">{sub}</p>}
        </div>
        <div className="row-body">{children}</div>
      </div>
    </section>
  );
}

// The coloured band at the top of every page.
export function Head({ children, className = "" }) {
  return (
    <header className={`head field-sky ${className}`}>
      <div className="wrap head-grid">{children}</div>
    </header>
  );
}
