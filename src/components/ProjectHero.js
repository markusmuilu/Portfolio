import "./ProjectHero.css";

/**
 * The hero block shared by every project page.
 *
 * Each page used to carry its own copy of this markup and CSS, which is how
 * three pages ended up on two different type scales and two different top
 * paddings. Spacing, type and alignment live here now; pages choose only their
 * accent colour and their words.
 *
 * accent   "blue" | "violet" | "teal"
 * actions  [{ label, href, variant: "primary" | "ghost" }], external links
 */
export default function ProjectHero({
  accent = "blue",
  eyebrow,
  badge,
  title,
  children,
  actions = [],
}) {
  return (
    <section className={`project-hero accent-${accent}`}>
      {(eyebrow || badge) && (
        <div className="project-hero-tags">
          {eyebrow && <span className="project-hero-tag">{eyebrow}</span>}
          {badge && <span className="project-hero-tag">{badge}</span>}
        </div>
      )}

      <h1 className="project-hero-title">{title}</h1>

      {children && <p className="project-hero-sub">{children}</p>}

      {actions.length > 0 && (
        <div className="project-hero-actions">
          {actions.map(({ label, href, variant = "ghost" }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`project-hero-btn ${variant}`}
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
