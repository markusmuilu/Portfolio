import { Link } from "react-router-dom";
import "./GitHub.css";

const repos = [
  {
    name: "gym-exercise-recognition",
    description:
      "Bachelor's thesis — compared LightGBM vs Random Forest for gym exercise recognition across wrist, leg, and pocket sensor positions. LGBM achieved 0.889 macro F1 on the wrist.",
    tags: ["Python", "LightGBM", "scikit-learn", "Jupyter"],
    accent: "violet",
    href: "https://github.com/markusmuilu/gym-exercise-recognition",
    internal: "/thesis",
    internalLabel: "View showcase",
    badge: "Grade 5 · Aalto 2026",
  },
  {
    name: "Predicting-Nba",
    description:
      "End-to-end MLOps pipeline that predicts NBA game outcomes daily. Data ingestion, feature engineering, logistic regression model, and a live Streamlit dashboard — all running in production.",
    tags: ["Python", "FastAPI", "Docker", "scikit-learn", "Fly.io", "AWS"],
    accent: "blue",
    href: "https://github.com/markusmuilu/Predicting-Nba",
    internal: "/nba_prediction",
    internalLabel: "View showcase",
    badge: "Live in production",
  },
  {
    name: "Portfolio",
    description:
      "This portfolio site — built with React. Dark-themed, fully responsive, with animated scroll reveals, a live NBA predictor, and project showcases.",
    tags: ["React", "JavaScript", "CSS"],
    accent: "teal",
    href: "https://github.com/markusmuilu/Portfolio",
    internal: null,
    internalLabel: null,
    badge: null,
  },
];

export default function Github() {
  return (
    <div className="gh-page">
      {/* HERO */}
      <section className="gh-hero">
        <div className="gh-hero-inner">
          <div className="gh-avatar-wrap">
            <img
              src="https://github.com/markusmuilu.png"
              alt="markusmuilu GitHub avatar"
              className="gh-avatar"
            />
            <span className="gh-online-dot" />
          </div>

          <div>
            <p className="gh-eyebrow">GitHub</p>
            <h1 className="gh-hero-title">markusmuilu</h1>
            <p className="gh-hero-sub">
              Building ML systems, data pipelines, and cloud backends.
            </p>
            <a
              href="https://github.com/markusmuilu"
              target="_blank"
              rel="noopener noreferrer"
              className="gh-profile-btn"
            >
              View full profile ↗
            </a>
          </div>
        </div>
      </section>

      {/* FEATURED REPOS */}
      <section className="gh-repos-section">
        <p className="gh-section-title">Featured Repositories</p>

        <div className="gh-repos-grid">
          {repos.map((repo) => (
            <div className={`gh-repo-card gh-repo-${repo.accent}`} key={repo.name}>
              <div className="gh-repo-top">
                <div className="gh-repo-name-row">
                  <svg className="gh-repo-icon" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z" />
                  </svg>
                  <span className="gh-repo-name">{repo.name}</span>
                  {repo.badge && (
                    <span className={`gh-repo-badge gh-badge-${repo.accent}`}>{repo.badge}</span>
                  )}
                </div>
                <p className="gh-repo-desc">{repo.description}</p>
              </div>

              <div className="gh-repo-bottom">
                <div className="gh-repo-tags">
                  {repo.tags.map((t) => (
                    <span key={t} className="gh-repo-tag">{t}</span>
                  ))}
                </div>

                <div className="gh-repo-links">
                  {repo.internal && (
                    <Link to={repo.internal} className="gh-link-btn ghost">
                      {repo.internalLabel}
                    </Link>
                  )}
                  <a
                    href={repo.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gh-link-btn primary"
                  >
                    GitHub ↗
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
