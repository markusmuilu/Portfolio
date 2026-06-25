import "./Home.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ContactCard from "../components/ContactCard";

export default function Home() {
  const [openContact, setOpenContact] = useState(false);

  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    reveals.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="home-root">
      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <img src="/CV_kuva.jpeg" alt="Markus Muilu" className="hero-photo" />

          <div className="hero-content">
            <div className="status-badge">
              <span className="status-dot" />
              Junior Data Scientist · Elo
            </div>
            <p className="hero-kicker">Machine Learning · Data Science · Cloud</p>
            <h1 className="hero-title">Markus Muilu</h1>
            <p className="hero-lead">
              I build and deploy production machine learning systems, data pipelines,
              and cloud backends. Currently at Elo building production ML pipelines in
              Azure and Databricks, graduating from Aalto this summer and starting my
              M.Sc. in ML, DS &amp; AI in autumn.
            </p>

            <div className="hero-buttons">
              <button className="hero-btn primary" onClick={() => setOpenContact(true)}>
                Contact me
              </button>
              <Link to="/nba_prediction" className="hero-btn ghost">
                View NBA project
              </Link>
              <Link to="/thesis" className="hero-btn ghost">
                View Thesis
              </Link>
            </div>
          </div>
        </div>

        <div className="hero-side">
          <div className="hero-card">
            <h2>Quick facts</h2>
            <ul>
              <li>Aalto University, B.Sc. GPA 4.57 — graduating summer 2026</li>
              <li>M.Sc. in ML, DS &amp; AI at Aalto starting autumn 2026</li>
              <li>Building production ML pipelines at Elo (Azure / Databricks)</li>
              <li>NBA prediction: 670+ games, 68.2% accuracy</li>
            </ul>
          </div>
          <div className="hero-card">
            <h3>Currently focused on</h3>
            <p>Production ML, Databricks / PySpark, agentic AI systems.</p>
          </div>
        </div>

        <ContactCard open={openContact} onClose={() => setOpenContact(false)} />
      </section>

      {/* HIGHLIGHTS */}
      <section className="section" id="highlights">
        <h2 className="section-title">Highlights</h2>
        <div className="cards-grid">
          <div className="info-card reveal">
            <div className="card-accent blue" />
            <h3>Academic</h3>
            <p>
              Bachelor of Electrical Engineering (Information Technology) at Aalto University,
              graduating summer 2026. Starting M.Sc. in Machine Learning, Data Science and AI at Aalto in autumn 2026.
            </p>
            <ul>
              <li>B.Sc. GPA 4.57 · Thesis grade 5 · 182 ECTS</li>
              <li>Strong focus on ML, networking, and cloud computing</li>
            </ul>
          </div>

          <div className="info-card reveal">
            <div className="card-accent teal" />
            <h3>Leadership and teamwork</h3>
            <p>
              Reserve Officer Training at the Air Force Academy and a long sports
              background in basketball.
            </p>
            <ul>
              <li>Best Officer Candidate and Leader of batch 2/2022</li>
              <li>Led a 10 day field exercise for 300 conscripts</li>
              <li>Played in U20 European and U18 Nordic Championships</li>
            </ul>
          </div>

          <div className="info-card reveal">
            <div className="card-accent violet" />
            <h3>Global tech exposure</h3>
            <p>
              Huawei Seeds for the Future 2024 alumnus with hands on exposure to
              cloud, 5G, and global collaboration.
            </p>
            <ul>
              <li>People&apos;s Choice Award in European Tech4Good</li>
              <li>Third place out of 22 teams</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section className="section reveal" id="skills">
        <h2 className="section-title">Skills</h2>
        <div className="skills-wrap">
          <div className="skills-group">
            <h3>Core stack</h3>
            <div className="chips blue">
              <span>Python</span>
              <span>SQL</span>
              <span>JavaScript</span>
              <span>Scala</span>
              <span>React</span>
              <span>FastAPI</span>
            </div>
          </div>

          <div className="skills-group">
            <h3>Cloud and DevOps</h3>
            <div className="chips teal">
              <span>Azure Data Factory</span>
              <span>Azure DevOps</span>
              <span>AWS EC2</span>
              <span>AWS S3</span>
              <span>Fly.io</span>
              <span>Cloudflare R2</span>
              <span>Docker</span>
              <span>Linux</span>
              <span>Supabase</span>
            </div>
          </div>

          <div className="skills-group">
            <h3>Data and ML</h3>
            <div className="chips violet">
              <span>PySpark</span>
              <span>scikit-learn</span>
              <span>LightGBM</span>
              <span>Hyperopt / TPE</span>
              <span>SHAP</span>
              <span>Feature engineering</span>
              <span>Data pipelines</span>
              <span>Power BI</span>
              <span>Streamlit</span>
            </div>
          </div>

          <div className="skills-group">
            <h3>Tools</h3>
            <div className="chips slate">
              <span>Databricks</span>
              <span>MLflow</span>
              <span>Delta Lake</span>
              <span>Git and GitHub</span>
              <span>VS Code</span>
              <span>Dynamics 365</span>
            </div>
          </div>

          <div className="skills-group">
            <h3>Languages</h3>
            <div className="chips slate">
              <span>Finnish — Native</span>
              <span>English — Fluent</span>
            </div>
          </div>
        </div>
      </section>

      {/* EDUCATION */}
      <section className="section" id="education">
        <h2 className="section-title">Education</h2>
        <div className="timeline">
          <div className="timeline-item reveal">
            <div className="timeline-dot" />
            <div className="timeline-content">
              <h3>Aalto University</h3>
              <p className="timeline-dates">2026 — 2028 (expected)</p>
              <p>M.Sc. in Machine Learning, Data Science and Artificial Intelligence.</p>
            </div>
          </div>

          <div className="timeline-item reveal">
            <div className="timeline-dot" />
            <div className="timeline-content">
              <h3>Aalto University</h3>
              <p className="timeline-dates">2023 — 2026</p>
              <p>Bachelor of Electrical Engineering, Information Technology — graduating summer 2026.</p>
              <ul>
                <li>Minor in Computer Science · 182 ECTS · GPA 4.57</li>
                <li>Thesis grade 5: <em>Improving Gym Exercise Recognition with Light Gradient Boosting</em></li>
                <li>Machine Learning, Data Analytics, Networking, Signal Processing, Cloud Computing</li>
              </ul>
            </div>
          </div>

          <div className="timeline-item reveal">
            <div className="timeline-dot" />
            <div className="timeline-content">
              <h3>Air Force Academy, Tikkakoski</h3>
              <p className="timeline-dates">2022 — 2023</p>
              <ul>
                <li>Reserve Officer Training</li>
                <li>Top-ranked in Communications Line, 3rd overall in IRUK 114</li>
                <li>Best Officer Candidate and leader of batch 2/2022</li>
              </ul>
            </div>
          </div>

          <div className="timeline-item reveal">
            <div className="timeline-dot" />
            <div className="timeline-content">
              <h3>Schildtin lukio, Jyväskylä</h3>
              <p className="timeline-dates">2019 — 2022</p>
              <p>High school diploma, sports line.</p>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="section" id="experience">
        <h2 className="section-title">Experience</h2>
        <div className="cards-stack">
          <div className="exp-card reveal">
            <div className="exp-header">
              <h3>Junior Data Scientist · Elo</h3>
              <span className="exp-location">Espoo · May 2026 — present</span>
            </div>
            <ul>
              <li>Building and deploying production ML model training pipelines in Azure / Databricks</li>
              <li>Developed and deployed a customer activity scoring model and workability index into daily production automation via Azure Data Factory</li>
              <li>Migrated existing Power BI DAX logic into Azure Data Factory pipelines</li>
            </ul>
          </div>

          <div className="exp-card reveal">
            <div className="exp-header">
              <h3>ICT Trainee · Elo</h3>
              <span className="exp-location">Espoo · May 2025 — April 2026</span>
            </div>
            <p>
              Started in disability pensions and transitioned to Dynamics 365 CRM development after strong performance.
            </p>
            <ul>
              <li>Maintained and developed Elo&apos;s Microsoft Dynamics 365 Sales system</li>
              <li>Monitored and validated dataflows, performed system testing with vendors</li>
              <li>Collaborated with external vendors and internal business units</li>
            </ul>
          </div>

          <div className="exp-card reveal">
            <div className="exp-header">
              <h3>Electronic Mechanician · Vaisala</h3>
              <span className="exp-location">Vantaa · May 2024 — Feb 2025</span>
            </div>
            <p>Worked in production building and testing weather and air quality devices.</p>
            <ul>
              <li>Assembled measurement devices and installed software</li>
              <li>Tested components under different conditions</li>
              <li>Learned six full production processes in a short time</li>
            </ul>
          </div>

          <div className="exp-card subtle reveal">
            <div className="exp-header">
              <h3>Other roles</h3>
            </div>
            <ul>
              <li>Warehouse worker, Stockmann (Summer 2023)</li>
              <li>Entrepreneur, Aurinkosähkövene JKL (Summer 2021)</li>
              <li>Course maintenance, Muurame Golf (Summer 2020)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="section reveal" id="projects">
        <h2 className="section-title">Projects</h2>

        <div className="project-card">
          <div className="project-header">
            <h3>NBA game prediction pipeline</h3>
            <div className="project-controls">
              <span className="project-tag">End-to-end ML · MLOps · Live</span>
              <Link to="/nba_prediction" className="hero-btn ghost">
                View Project
              </Link>
            </div>
          </div>

          <p className="project-lead">
            A fully automated, containerized machine learning system that predicts NBA game
            outcomes daily. Tracked 670+ real predictions throughout the NBA regular season,
            achieving 68.2% accuracy and +1.1% ROI against live Pinnacle moneyline odds at
            the 61%+ confidence threshold.
          </p>

          <div className="project-tech">
            <span>Python</span>
            <span>FastAPI</span>
            <span>Docker</span>
            <span>scikit-learn</span>
            <span>React</span>
            <span>Fly.io</span>
            <span>Cloudflare R2</span>
            <span>Streamlit</span>
            <span>AWS EC2</span>
            <span>AWS S3</span>
            <span>Power BI</span>
          </div>

          <ul className="project-list">
            <li>670+ real predictions tracked throughout the 2024–25 NBA regular season</li>
            <li>68.2% accuracy — beats the always-home baseline by 12.6 percentage points</li>
            <li>+1.1% ROI benchmarked against live Pinnacle moneyline odds at 61%+ confidence</li>
            <li>Dockerized FastAPI backend on AWS EC2 with S3 and Cloudflare R2 storage</li>
            <li>Daily automation: resolve games, archive history, generate new predictions</li>
            <li>Streamlit dashboard with model performance, team stats, and betting simulation</li>
          </ul>
        </div>
      </section>

      <div className="project-card" style={{ marginTop: 18 }}>
        <div className="project-header">
          <h3>AI-powered training planner</h3>
          <div className="project-controls">
            <span className="project-tag">Agentic AI · Full-stack</span>
          </div>
        </div>

        <p className="project-lead">
          A full-stack training planner integrating Oura and Strava APIs with an agentic Claude AI layer
          that generates personalised weekly training recommendations based on recovery data and activity history.
          In active personal use and continuously iterated.
        </p>

        <div className="project-tech">
          <span>React 19</span>
          <span>Vite</span>
          <span>Tailwind</span>
          <span>Supabase</span>
          <span>Vercel</span>
          <span>Claude API</span>
        </div>

        <ul className="project-list">
          <li>Oura and Strava API integration with OAuth + CSRF handling and PWA support</li>
          <li>Agentic Claude layer with tool use for structured weekly plan generation</li>
          <li>In active personal use for weekly training planning</li>
        </ul>
      </div>

      <div className="project-card thesis-project-card">
        <div className="project-header">
          <h3>Gym Exercise Recognition — Bachelor&apos;s Thesis</h3>
          <div className="project-controls">
            <span className="project-tag thesis-tag">ML Research · Grade 5</span>
            <Link to="/thesis" className="hero-btn ghost">
              View Project
            </Link>
          </div>
        </div>

        <p className="project-lead">
          Investigated whether LightGBM achieves higher macro F1-scores than Random Forest
          on a gym exercise recognition dataset. Evaluated across wrist, leg, and pocket sensor
          positions on 10 subjects performing 11 exercises using Leave-One-Group-Out
          cross-validation. LGBM outperformed RF across all positions with a wrist F1 of 0.889.
        </p>

        <div className="project-tech">
          <span>Python</span>
          <span>LightGBM</span>
          <span>scikit-learn</span>
          <span>pandas</span>
          <span>NumPy</span>
          <span>Jupyter</span>
        </div>

        <ul className="project-list">
          <li>Feature engineering with 4-second sliding windows, 39 features, 117 437 samples</li>
          <li>Grid search hyperparameter tuning across 5 parameters per model</li>
          <li>LGBM trains in under half the time of RF while outperforming it across all positions</li>
          <li>Full LOGO-CV evaluation — each fold holds out one subject entirely</li>
        </ul>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <p>
          Feel free to reach out at{" "}
          <a href="mailto:muilu.markus@gmail.com">muilu.markus@gmail.com</a>.
        </p>
      </footer>
    </div>
  );
}
