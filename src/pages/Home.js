import "./Home.css";

export default function Home() {
  return (
    <div className="cv-layout">
      
      {/* LEFT SIDEBAR */}
      <aside className="cv-sidebar">
        <img src="/CV_kuva.jpeg" alt="Profile" className="cv-photo" />

        <div className="sidebar-section">
          <h3>Contact Information</h3>
          <p><strong>Phone</strong><br />+358 44 317 0803</p>
          <p><strong>Email</strong><br />markus.muilu@aalto.fi</p>
          <p><strong>Address</strong><br />Espoo, Finland</p>
        </div>

        <div className="sidebar-section">
          <h3>Achievements</h3>
          <ul>
            <li>Top of the line in IRUK 114 course and ranked 3rd overall</li>
            <li>Best Leader of the Air Force Academy batch 2/2022</li>
            <li>Player in 2022 Men’s U20 European Championship</li>
            <li>Player in 2021 Men’s U18 Nordic Championship</li>
            <li>Huawei Seeds for the Future 2024  
              — People’s Choice Award, 3rd in Europe
            </li>
          </ul>
        </div>

        <div className="sidebar-section">
          <h3>Technical Skills</h3>
          <ul>
            <li>Python, JavaScript, SQL, C/C++, React, Scala</li>
            <li>AWS (EC2, S3), Azure DevOps, Docker, Linux, REST APIs, Supabase</li>
            <li>Feature Engineering, ML Models, Pipelines, Power BI</li>
            <li>Git/GitHub, FastAPI, VS Code, Dynamics 365</li>
          </ul>
        </div>

        <div className="sidebar-section">
          <h3>Languages</h3>
          <ul>
            <li>Finnish:       Native</li>
            <li>English:       Fluent</li>
          </ul>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="cv-main">
        <header>
          <h1>Markus Muilu</h1>
          <h2>Information Technology Student at Aalto University</h2>
        </header>

        <section className="cv-section">
          <h3>About Me</h3>
          <p>
            Third-year Information Technology student at Aalto University with a current GPA of 4.39 
            and 165 completed credits after this fall. I am responsible, calm, goal-oriented, and proactive, 
            with a strong interest in applying technology to solve real-world problems. A quick learner who enjoys taking 
            responsibility and continuously challenging myself in both academic and work environments.
          </p>
        </section>

        {/* EDUCATION */}
        <section className="cv-box">
          <h3 className="cv-box-title">Education</h3>

          <div className="cv-entry">
            <h4>Aalto University, Bachelor of Electrical Engineering and Information Technology</h4>
            <p className="cv-entry-dates">2023 to 2026</p>
            <ul>
              <li>Minor in Computer Science</li>
              <li>Completed 165 credits, GPA 4.39</li>
              <li>Courses: Networking, Signal Processing, Data Analytics, Machine Learning, Cloud Computing, Programming</li>
            </ul>
          </div>

          <div className="cv-entry">
            <h4>Air Force Academy, Tikkakoski, Reserve Officer Training</h4>
            <p className="cv-entry-dates">2022 to 2023</p>
            <ul>
              <li>Awarded Best in Communications Line</li>
              <li>Best Officer Candidate and Leader of the 2/22 batch</li>
              <li>Served as camp leader for a 10 day field training exercise with over 300 conscripts</li>
            </ul>
          </div>

          <div className="cv-entry">
            <h4>Schildtin lukio, Jyväskylä, High School Diploma</h4>
            <p className="cv-entry-dates">2019 to 2022</p>
          </div>
        </section>

        {/* EXPERIENCE */}
        <section className="cv-box">
          <h3 className="cv-box-title">Experience</h3>

          <div className="cv-entry">
            <h4>ICT-Trainee, Elo, Espoo</h4>
            <p className="cv-entry-dates">2025 to Present</p>
            <ul>
              <li>Processed pension applications and provided customer support</li>
              <li>Moved into Dynamics 365 CRM development after strong performance</li>
              <li>Maintained dataflows, tested new features, and collaborated with vendors and internal teams</li>
              <li>Provided user support and training for business teams</li>
            </ul>
          </div>

          <div className="cv-entry">
            <h4>Electronic Mechanician, Vaisala, Vantaa</h4>
            <p className="cv-entry-dates">May 2024 to February 2025</p>
            <ul>
              <li>Assembled weather and air-quality measurement devices</li>
              <li>Installed software on embedded systems</li>
              <li>Learned and worked within six complete production processes</li>
            </ul>
          </div>

          <h4>Additional Roles</h4>
          <ul>
            <li>Warehouse Worker, Stockmann (Summer 2023)</li>
            <li>Entrepreneur, Aurinkosähkövene JKL (Summer 2021)</li>
            <li>Course Maintenance, Muurame Golf (Summer 2020)</li>
          </ul>
        </section>

        {/* PROJECTS */}
        <section className="cv-box">
          <h3 className="cv-box-title">Projects</h3>

          <div className="cv-entry">
            <h4>Predicting NBA - End to End Machine Learning Pipeline</h4>
            <p className="cv-project-tags">Machine Learning, Data Pipelines, Cloud Development</p>
            <ul>
              <li>Designed and built a complete machine learning pipeline for NBA game predictions</li>
              <li>Created data ingestion, preprocessing, feature engineering, and training stages</li>
              <li>Developed a FastAPI backend, packaged with Docker and deployed to AWS EC2</li>
              <li>Implemented an automated prediction system with a bootstrap container</li>
              <li>Built S3 based storage architecture and Power BI analytics dashboards</li>
              <li>Developed a React frontend for live predictions</li>
              <li>Used GitHub for version control, workflow automation and continuous development</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
