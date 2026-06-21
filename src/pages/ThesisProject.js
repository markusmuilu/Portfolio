import "./ThesisProject.css";

const results = [
  {
    position: "Wrist",
    lgbm: 0.889,
    rf: 0.868,
  },
  {
    position: "Leg",
    lgbm: 0.793,
    rf: 0.773,
  },
  {
    position: "Pocket",
    lgbm: 0.528,
    rf: 0.519,
  },
];

export default function ThesisProject() {
  return (
    <div className="thesis-page">

      {/* HERO */}
      <section className="thesis-hero">
        <div className="thesis-glow-a" />
        <div className="thesis-glow-b" />

        <div className="thesis-eyebrow-row">
          <span className="thesis-eyebrow">Bachelor's Thesis · Aalto University 2026</span>
          <span className="thesis-grade-badge">Grade 5 / 5</span>
        </div>

        <h1 className="thesis-hero-title">
          Improving Gym Exercise Recognition<br />
          <span className="thesis-hero-accent">with Light Gradient Boosting</span>
        </h1>

        <p className="thesis-hero-sub">
          Investigated whether LightGBM outperforms Random Forest on a wearable sensor dataset
          of 10 subjects performing 11 gym exercises, evaluated across three sensor positions
          using Leave-One-Group-Out cross-validation.
        </p>

        <div className="thesis-hero-actions">
          <a
            href="https://github.com/markusmuilu/gym-exercise-recognition"
            target="_blank"
            rel="noopener noreferrer"
            className="thesis-btn primary"
          >
            View on GitHub
          </a>
          <a
            href="https://github.com/markusmuilu/gym-exercise-recognition/blob/main/thesis.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="thesis-btn ghost"
          >
            Read Thesis ↗
          </a>
        </div>
      </section>

      {/* STATS ROW */}
      <div className="thesis-stats-row">
        <div className="thesis-stat-card">
          <span className="thesis-stat-num">0.889</span>
          <span className="thesis-stat-label">LGBM wrist F1</span>
        </div>
        <div className="thesis-stat-card">
          <span className="thesis-stat-num">11</span>
          <span className="thesis-stat-label">Exercise classes</span>
        </div>
        <div className="thesis-stat-card">
          <span className="thesis-stat-num">3</span>
          <span className="thesis-stat-label">Sensor positions</span>
        </div>
        <div className="thesis-stat-card">
          <span className="thesis-stat-num">117k</span>
          <span className="thesis-stat-label">Training samples</span>
        </div>
      </div>

      {/* RESULTS COMPARISON */}
      <section className="thesis-results-section">
        <h2 className="thesis-section-title">LGBM vs Random Forest — Macro F1</h2>
        <p className="thesis-section-sub">
          Final results after hyperparameter tuning via grid search on wrist position.
          LGBM outperforms RF across all three sensor positions.
        </p>

        <div className="results-chart">
          {results.map(({ position, lgbm, rf }) => (
            <div className="result-row" key={position}>
              <span className="result-position">{position}</span>
              <div className="result-bars">
                <div className="bar-group">
                  <span className="bar-label lgbm-label">LGBM</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill lgbm-fill"
                      style={{ width: `${lgbm * 100}%` }}
                    />
                  </div>
                  <span className="bar-value">{lgbm.toFixed(3)}</span>
                </div>
                <div className="bar-group">
                  <span className="bar-label rf-label">RF</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill rf-fill"
                      style={{ width: `${rf * 100}%` }}
                    />
                  </div>
                  <span className="bar-value">{rf.toFixed(3)}</span>
                </div>
              </div>
            </div>
          ))}

          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-dot lgbm-dot" />
              LightGBM (tuned)
            </span>
            <span className="legend-item">
              <span className="legend-dot rf-dot" />
              Random Forest (tuned)
            </span>
          </div>
        </div>
      </section>

      {/* METHOD OVERVIEW */}
      <section className="thesis-method-section">
        <h2 className="thesis-section-title">How It Works</h2>
        <div className="thesis-method-grid">
          <div className="thesis-method-card">
            <span className="method-step">01</span>
            <h3>Dataset</h3>
            <p>
              10 subjects (5M / 5F) performed 11 gym exercises wearing sensors on the wrist,
              leg, and in the pocket. Each sensor recorded 3-axis acceleration, 3-axis
              gyroscope, and body capacitance at 20 Hz.
            </p>
          </div>
          <div className="thesis-method-card">
            <span className="method-step">02</span>
            <h3>Feature Engineering</h3>
            <p>
              4-second sliding windows with 2-second overlap. Mean, min, max, standard
              deviation, and MAD extracted per channel — yielding 39 features and
              117 437 labelled samples.
            </p>
          </div>
          <div className="thesis-method-card">
            <span className="method-step">03</span>
            <h3>Hyperparameter Tuning</h3>
            <p>
              Grid search across 5 hyperparameters per model using the first two
              LOGO-CV folds on the wrist position. Best LGBM config:
              <code>num_leaves=60, lr=0.05, n_estimators=400</code>.
            </p>
          </div>
          <div className="thesis-method-card">
            <span className="method-step">04</span>
            <h3>Evaluation</h3>
            <p>
              Leave-One-Group-Out CV across all 10 subjects, reported as macro F1.
              LGBM trains in under half the time of RF with 100 estimators while
              still outperforming it across all positions.
            </p>
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="thesis-tech-section">
        <h2 className="thesis-section-title">Stack</h2>
        <div className="thesis-tech-chips">
          <span>Python</span>
          <span>LightGBM</span>
          <span>scikit-learn</span>
          <span>pandas</span>
          <span>NumPy</span>
          <span>Matplotlib</span>
          <span>Jupyter</span>
        </div>
      </section>

    </div>
  );
}
