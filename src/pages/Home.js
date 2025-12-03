import "./Home.css";

export default function Home() {
  return (
    <div className="home-root">
      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <img src="/CV_kuva.jpeg" alt="Profile" className="hero-photo" />

          <div className="hero-content">
            <p className="hero-kicker">Information Technology student · ML and Cloud</p>
            <h1 className="hero-title">Markus Muilu</h1>
            <p className="hero-lead">
              I design and build production-level machine learning systems, cloud backends,
              and data pipelines. I enjoy turning messy data and ideas into something
              reliable, automated, and scalable.
            </p>

            <div className="hero-buttons">
              <a href="mailto:markus.muilu@aalto.fi" className="hero-btn primary">
                Contact me
              </a>
              <a href="https://www.markusmuilu.page/nba_prediction" className="hero-btn ghost">
                View NBA project
              </a>
            </div>
          </div>
        </div>

        <div className="hero-side">
          <div className="hero-card">
            <h2>Quick facts</h2>
            <ul>
              <li>Aalto University IT student, GPA 4.43</li>
              <li>ICT trainee at Elo, working in Dynamics 365</li>
              <li>Built a full NBA prediction MLOps pipeline</li>
            </ul>
          </div>
          <div className="hero-card subtle">
            <h3>Currently focused on</h3>
            <p>Production ML, cloud infrastructure, clean API design.</p>
          </div>
        </div>
      </section>


      {/* HIGHLIGHTS */}
      <section className="section" id="highlights">
        <h2 className="section-title">Highlights</h2>
        <div className="cards-grid">
          <div className="info-card">
            <h3>Academic</h3>
            <p>
              Bachelor of Electrical Engineering and Information Technology at Aalto.
              Minor in Computer Science, 167 credits completed after the fall semester.
            </p>
            <ul>
              <li>Strong focus on ML, networking, and cloud computing</li>
            </ul>
          </div>

          <div className="info-card">
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

          <div className="info-card">
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
      <section className="section" id="skills">
        <h2 className="section-title">Skills</h2>
        <div className="skills-wrap">
          <div className="skills-group">
            <h3>Core stack</h3>
            <div className="chips">
              <span>Python</span>
              <span>JavaScript</span>
              <span>SQL</span>
              <span>React</span>
              <span>FastAPI</span>
            </div>
          </div>

          <div className="skills-group">
            <h3>Cloud and DevOps</h3>
            <div className="chips">
              <span>AWS EC2 and S3</span>
              <span>Docker</span>
              <span>Linux</span>
              <span>Azure DevOps</span>
            </div>
          </div>

          <div className="skills-group">
            <h3>Data and ML</h3>
            <div className="chips">
              <span>Feature engineering</span>
              <span>ML model training</span>
              <span>Data pipelines</span>
              <span>Power BI</span>
            </div>
          </div>

          <div className="skills-group">
            <h3>Tools</h3>
            <div className="chips">
              <span>Git and GitHub</span>
              <span>VS Code</span>
              <span>Dynamics 365</span>
            </div>
          </div>
        </div>
      </section>

      {/* EDUCATION */}
      <section className="section" id="education">
        <h2 className="section-title">Education</h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-dot" />
            <div className="timeline-content">
              <h3>Aalto University</h3>
              <p className="timeline-dates">2023 to 2026</p>
              <p>Bachelor of Electrical Engineering and Information Technology.</p>
              <ul>
                <li>Minor in Computer Science</li>
                <li>167 credits after fall, currently GPA 4.43</li>
                <li>Networking, Signal Processing, Data Analytics, ML, Cloud Computing</li>
              </ul>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot" />
            <div className="timeline-content">
              <h3>Air Force Academy, Tikkakoski</h3>
              <p className="timeline-dates">2022 to 2023</p>
              <ul>
                <li>Reserve Officer Training</li>
                <li>Best in Communications Line</li>
                <li>Best Officer Candidate and leader of batch 2/2022</li>
              </ul>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot" />
            <div className="timeline-content">
              <h3>Schildtin lukio, Jyväskylä</h3>
              <p className="timeline-dates">2019 to 2022</p>
              <p>High school diploma, sports line.</p>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="section" id="experience">
        <h2 className="section-title">Experience</h2>
        <div className="cards-stack">
          <div className="exp-card">
            <div className="exp-header">
              <h3>ICT Trainee · Elo</h3>
              <span className="exp-location">Espoo · 2025 to present</span>
            </div>
            <p>
              Started in disability pensions and moved into Dynamics 365 CRM development.
              I work on keeping data and tools reliable for the business.
            </p>
            <ul>
              <li>Maintain and improve Elo&apos;s Dynamics 365 Sales system</li>
              <li>Monitor and validate dataflows</li>
              <li>Test new features with vendors and internal teams</li>
              <li>Provide guidance and support for business users</li>
            </ul>
          </div>

          <div className="exp-card">
            <div className="exp-header">
              <h3>Electronic Mechanician · Vaisala</h3>
              <span className="exp-location">Vantaa · May 2024 to Feb 2025</span>
            </div>
            <p>
              Worked in production building and testing weather and air quality devices.
            </p>
            <ul>
              <li>Assembled measurement devices and installed software</li>
              <li>Tested components under different conditions</li>
              <li>Learned six full production processes in a short time</li>
            </ul>
          </div>

          <div className="exp-card subtle">
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
      <section className="section" id="projects">
        <h2 className="section-title">Projects</h2>

        <div className="project-card">
          <div className="project-header">
            <h3>NBA game prediction pipeline</h3>
            <span className="project-tag">End to end ML and MLOps</span>
          </div>

          <p className="project-lead">
            A full production style machine learning system that predicts NBA game outcomes
            and feeds results into Power BI dashboards.
          </p>

          <div className="project-tech">
            <span>Python</span>
            <span>FastAPI</span>
            <span>Docker</span>
            <span>AWS EC2</span>
            <span>AWS S3</span>
            <span>Power BI</span>
            <span>React</span>
          </div>

          <ul className="project-list">
            <li>Built a data pipeline for game, team, and historical performance data</li>
            <li>Created preprocessing and feature engineering for model training</li>
            <li>Trained and evaluated models for win probability prediction</li>
            <li>Dockerized a FastAPI backend and deployed it on AWS EC2</li>
            <li>Designed an automated prediction flow with a bootstrap container</li>
            <li>Stored data and predictions in S3 for analytics and history</li>
            <li>Published results to Power BI and a React frontend for live viewing</li>
          </ul>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>
          Feel free to reach out at{" "}
          <a href="mailto:markus.muilu@aalto.fi">markus.muilu@aalto.fi</a>.
        </p>
      </footer>
    </div>
  );
}
