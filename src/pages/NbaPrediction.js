import { useState } from "react";
import "./NbaPrediction.css";

const teams = {
  "ATL": "Atlanta Hawks",
  "BOS": "Boston Celtics",
  "BKN": "Brooklyn Nets",
  "CHA": "Charlotte Hornets",
  "CHI": "Chicago Bulls",
  "CLE": "Cleveland Cavaliers",
  "DAL": "Dallas Mavericks",
  "DEN": "Denver Nuggets",
  "DET": "Detroit Pistons",
  "GSW": "Golden State Warriors",
  "HOU": "Houston Rockets",
  "IND": "Indiana Pacers",
  "LAC": "LA Clippers",
  "LAL": "LA Lakers",
  "MEM": "Memphis Grizzlies",
  "MIA": "Miami Heat",
  "MIL": "Milwaukee Bucks",
  "MIN": "Minnesota Timberwolves",
  "NOP": "New Orleans Pelicans",
  "NYK": "New York Knicks",
  "OKC": "Oklahoma City Thunder",
  "ORL": "Orlando Magic",
  "PHI": "Philadelphia 76ers",
  "PHX": "Phoenix Suns",
  "POR": "Portland Trail Blazers",
  "SAC": "Sacramento Kings",
  "SAS": "San Antonio Spurs",
  "TOR": "Toronto Raptors",
  "UTA": "Utah Jazz",
  "WAS": "Washington Wizards",
};

export default function NbaPrediction() {
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePredict() {
    if (loading) return;
    if (!teamA || !teamB) { setError("Please select both teams."); return; }
    if (teamA === teamB) { setError("Please select two different teams."); return; }
    setError("");
    setLoading(true);
    setPrediction(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const res = await fetch(
        `https://predicting-nba.fly.dev/predict?team1=${teamA}&team2=${teamB}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (res.status === 429) throw new Error("rate_limited");
      if (!res.ok) throw new Error("not_ok");
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        setError("Prediction is taking too long — please try again in a moment.");
      } else if (err.message === "rate_limited") {
        setError("Please wait a minute before making another prediction.");
      } else {
        setError("Prediction service unavailable right now.");
      }
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="nba-page">

      {/* HERO BANNER */}
      <section className="nba-hero">
        <span className="nba-eyebrow">End-to-end ML system</span>
        <h1 className="nba-hero-title">NBA Game Prediction</h1>
        <p className="nba-hero-sub">
          A fully automated machine learning pipeline — data ingestion, feature engineering,
          model training, and daily inference — all running in production on Fly.io.
        </p>
        <div className="nba-hero-actions">
          <a
            href="https://github.com/markusmuilu/Predicting-Nba"
            target="_blank"
            rel="noopener noreferrer"
            className="nba-btn primary"
          >
            View on GitHub
          </a>
          <a
            href="https://nba-ml-dashboard.streamlit.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="nba-btn ghost"
          >
            Open Dashboard ↗
          </a>
        </div>
      </section>

      {/* STATS ROW */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-num">1000+</span>
          <span className="stat-label">Predicted games</span>
        </div>
<div className="stat-card">
          <span className="stat-num">Daily</span>
          <span className="stat-label">Automated predictions</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">Live</span>
          <span className="stat-label">API on Fly.io</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">Open</span>
          <span className="stat-label">Source on GitHub</span>
        </div>
      </div>

      {/* PREDICTOR */}
      <section className="predictor-card">
        <div className="predictor-header">
          <div>
            <h2>Try the Live Predictor</h2>
            <p className="predictor-desc">Select two teams and get a real-time win probability from the deployed model.</p>
          </div>
          <span className="live-badge">
            <span className="live-dot" />
            Live API
          </span>
        </div>

        <div className="predictor-inputs">
          <div className="team-select-wrap">
            <label htmlFor="teamA">Home Team</label>
            <select id="teamA" value={teamA} onChange={(e) => setTeamA(e.target.value)}>
              <option value="">Select team…</option>
              {Object.entries(teams).map(([abbr, name]) => (
                <option key={abbr} value={abbr}>{name}</option>
              ))}
            </select>
          </div>

          <div className="vs-divider">VS</div>

          <div className="team-select-wrap">
            <label htmlFor="teamB">Away Team</label>
            <select id="teamB" value={teamB} onChange={(e) => setTeamB(e.target.value)}>
              <option value="">Select team…</option>
              {Object.entries(teams).map(([abbr, name]) => (
                <option key={abbr} value={abbr}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="predictor-error">{error}</p>}

        <button className="predict-btn" onClick={handlePredict} disabled={loading}>
          {loading ? (
            <><span className="btn-spinner" />Predicting…</>
          ) : (
            "Predict Winner"
          )}
        </button>

        {prediction && !loading && (
          <div className="prediction-result">
            {prediction.winner ? (
              <>
                <span className="result-label">Predicted winner</span>
                <span className="result-winner">{prediction.winner}</span>
                {prediction.confidence != null && (
                  <div className="confidence-wrap">
                    <div className="confidence-track">
                      <div
                        className="confidence-bar"
                        style={{ width: `${Math.min(prediction.confidence, 100)}%` }}
                      />
                    </div>
                    <span className="confidence-text">
                      {Number(prediction.confidence).toFixed(1)}% confidence
                    </span>
                  </div>
                )}
              </>
            ) : (
              <span className="result-error">Prediction service unavailable right now.</span>
            )}
          </div>
        )}
      </section>

      {/* STREAMLIT DASHBOARD */}
      <section className="dashboard-section">
        <div className="dash-header">
          <div>
            <h2 className="dash-title">Live Analytics Dashboard</h2>
            <p className="dash-sub">
              5 tabs — model performance, team stats, upset analysis, betting simulation, and today&apos;s predictions.
            </p>
          </div>
          <a
            href="https://nba-ml-dashboard.streamlit.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="nba-btn ghost"
          >
            Full screen ↗
          </a>
        </div>

        <div className="browser-frame">
          <div className="browser-bar">
            <span className="browser-dots">
              <span /><span /><span />
            </span>
            <span className="browser-url">nba-ml-dashboard.streamlit.app</span>
          </div>
          <iframe
            src="https://nba-ml-dashboard.streamlit.app/?embed=true"
            title="NBA Analytics Dashboard"
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            className="dash-iframe"
          />
        </div>
      </section>

      {/* SYSTEM OVERVIEW */}
      <section className="system-section">
        <p className="system-title">System Overview</p>
        <div className="system-grid">
          <div className="system-card">
            <span className="system-icon">⚡</span>
            <h3>Data Pipeline</h3>
            <p>Multi-season game log ingestion from PBPStats with 6-hour caching. Automated feature engineering with corrected defensive rating formula.</p>
          </div>
          <div className="system-card">
            <span className="system-icon">🧠</span>
            <h3>ML Model</h3>
            <p>Logistic Regression serialized as a skops bundle (model + scaler). Chosen for calibration stability and real-world reliability over experimental neural network versions.</p>
          </div>
          <div className="system-card">
            <span className="system-icon">🔄</span>
            <h3>Daily Automation</h3>
            <p>Scheduler runs at 12:00 Helsinki time — resolves finished games via ESPN, archives results to history, and generates predictions with odds from The Odds API.</p>
          </div>
          <div className="system-card">
            <span className="system-icon">☁️</span>
            <h3>Infrastructure</h3>
            <p>FastAPI on Fly.io. All state in Cloudflare R2 — training data, features, model bundle, predictions, history. Zero database. Zero egress fees.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
