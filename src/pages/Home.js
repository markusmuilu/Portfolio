import { Link } from "react-router-dom";
import Row, { Head } from "../components/Row";
import MonthBars from "../components/MonthBars";
import CompareBars from "../components/CompareBars";
import useJson from "../lib/useJson";
import "./Home.css";

const experience = [
  {
    title: "Junior Data Scientist, Elo",
    when: "May 2026 to present",
    items: [
      "Build and deploy production ML model training pipelines in Azure and Databricks",
      "Built a customer activity score and a workability index and put them into daily production through Azure Data Factory",
      "Moved existing Power BI DAX logic into Azure Data Factory pipelines",
    ],
  },
  {
    title: "ICT Trainee, Elo",
    when: "May 2025 to Apr 2026",
    lead: "Started in disability pensions, then moved to Dynamics 365 CRM development.",
    items: [
      "Maintained and developed Elo's Microsoft Dynamics 365 Sales system",
      "Monitored and validated dataflows and ran system testing with vendors",
      "Worked with external vendors and internal business units",
    ],
  },
  {
    title: "Electronic Mechanician, Vaisala",
    when: "May 2024 to Feb 2025",
    lead: "Built and tested weather and air quality measurement devices in production.",
    items: ["Assembled devices and installed their software", "Tested components under different conditions", "Learned six production processes"],
  },
  {
    title: "Earlier",
    when: "2020 to 2023",
    items: [
      "Warehouse worker, Stockmann (summer 2023)",
      "Entrepreneur, Aurinkosähkövene JKL (summer 2021)",
      "Course maintenance, Muurame Golf (summer 2020)",
    ],
  },
];

const skills = [
  ["Languages", "Python, SQL, JavaScript, Scala"],
  ["ML and data", "PyTorch, scikit-learn, LightGBM, PySpark, Hyperopt, SHAP, MLflow, Power BI"],
  ["Platforms", "Databricks, Delta Lake, Azure Data Factory, Azure DevOps, Fly.io, Cloudflare R2, AWS EC2 and S3, Supabase"],
  ["Building", "FastAPI, React, Docker, Linux, Git, Dynamics 365"],
  ["Spoken", "Finnish (native), English (fluent)"],
];

export default function Home() {
  const nba = useJson("/data/nba-season.json");
  const games = nba?.backtest?.games?.filter((g) => g.pm != null);

  return (
    <div className="page">
      <Head className="home-head">
        <div className="home-head-main">
          <h1 className="nameplate">
            Markus
            <br />
            Muilu
          </h1>
          <img src="/CV_kuva.jpeg" alt="Markus Muilu" className="home-photo" width="168" height="210" />
          <p className="lede">
            I build machine learning systems and the pipelines that keep them running. At Elo I build production ML
            pipelines in Azure and Databricks. I graduated from Aalto in June 2026 and am now studying for the M.Sc. in
            Machine Learning, Data Science and Artificial Intelligence there.
          </p>
          <div className="actions">
            <a className="btn" href="mailto:muilu.markus@gmail.com">
              Email me
            </a>
            <a className="btn quiet" href="https://github.com/markusmuilu" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </Head>

      <section className="pblocks wrap" id="work" aria-labelledby="work-h">
        <h2 id="work-h" className="pblocks-h">Projects</h2>

        <article className="pblock">
          <Link to="/home_heating" className="pb-visual chart" aria-label="Building automation bridge">
            <CompareBars
              rows={[
                { label: "Day's average electricity price", value: 6.21 },
                { label: "Average price the heating paid", value: 5.52, strong: true },
              ]}
              max={6.5}
              format={(v) => `${v.toFixed(2)} c`}
            />
            <span className="pb-cap">Cents per kWh, 6 to 11 October, all rooms on price control</span>
          </Link>
          <div className="pb-text">
            <h3>
              <Link to="/home_heating">Building automation bridge</Link>
            </h3>
            <p>
              A replacement control system for a house with 24 heating zones, built from scratch after the original
              control computer failed. A Raspberry Pi running Home Assistant drives the existing Fidelix controller over
              Modbus RTU and moves the heating into the cheaper hours of the spot price.
            </p>
            <ul className="pb-stats">
              <li><b>24</b>heating zones back under control</li>
              <li><b>11%</b>less per kWh than the day's average price</li>
              <li><b>2x</b>more accurate solar forecast than "same as yesterday"</li>
            </ul>
            <Link to="/home_heating" className="pb-more">See the build</Link>
          </div>
        </article>

        <article className="pblock flip">
          <Link to="/nba_prediction" className="pb-visual chart" aria-label="NBA game prediction">
            {games ? <MonthBars games={games} modelKey="pm" /> : <span />}
            <span className="pb-cap">Share of games the player model called right, by month, 2025-26</span>
          </Link>
          <div className="pb-text">
            <h3>
              <Link to="/nba_prediction">NBA game prediction</Link>
            </h3>
            <p>
              Predicts every NBA game before tip-off and keeps the record of each pick against the bookmaker's price. A
              PyTorch player model is the main model for 2026-27, with a logistic regression as the shadow.
            </p>
            <ul className="pb-stats">
              <li><b>1,084</b>games predicted live last season</li>
              <li><b>64.0%</b>called right live</li>
              <li><b>68.4%</b>player model on the same games</li>
            </ul>
            <Link to="/nba_prediction" className="pb-more">See the results</Link>
          </div>
        </article>

        <article className="pblock">
          <Link to="/thesis" className="pb-visual chart" aria-label="Bachelor's thesis">
            <span className="f1mini" aria-hidden="true">
              {[
                ["Wrist", 0.889, 0.868],
                ["Leg", 0.793, 0.773],
                ["Pocket", 0.528, 0.519],
              ].map(([n, a, b]) => (
                <span key={n} className="f1m-row">
                  <span className="f1m-n">{n}</span>
                  <span className="f1m-bars">
                    <span className="f1m-a" style={{ width: `${a * 100}%` }} />
                    <span className="f1m-b" style={{ width: `${b * 100}%` }} />
                  </span>
                  <span className="f1m-v">{a.toFixed(3)}</span>
                </span>
              ))}
            </span>
            <span className="pb-cap">Macro F1 by sensor position: LightGBM (dark) against Random Forest (light)</span>
          </Link>
          <div className="pb-text">
            <h3>
              <Link to="/thesis">Gym exercise recognition, bachelor's thesis</Link>
            </h3>
            <p>
              Compares LightGBM and Random Forest for recognising 11 gym exercises from wearable sensor data, holding out
              each of the 10 subjects in turn. LightGBM scored higher at all three sensor positions.
            </p>
            <ul className="pb-stats">
              <li><b>5 / 5</b>thesis grade</li>
              <li><b>0.889</b>wrist macro F1</li>
              <li><b>117k</b>sensor windows</li>
            </ul>
            <Link to="/thesis" className="pb-more">See the thesis</Link>
          </div>
        </article>

        <article className="pblock small">
          <div className="pb-text">
            <h3>
              <a href="https://github.com/markusmuilu/training-planner" target="_blank" rel="noopener noreferrer">
                Training planner
              </a>
            </h3>
            <p>
              A web app that reads recovery data from Oura and activities from Strava, and has Claude draft the week's
              training plan through tool calls. In personal use.
            </p>
          </div>
        </article>
      </section>

      <Row label="Experience" field="surface">
        <ul className="entries">
          {experience.map((job) => (
            <li className="entry" key={job.title}>
              <h3>{job.title}</h3>
              <span className="when">{job.when}</span>
              {job.lead && <p>{job.lead}</p>}
              <ul>
                {job.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Row>

      <Row label="Education">
        <ul className="entries">
          <li className="entry">
            <h3>M.Sc., Machine Learning, Data Science and Artificial Intelligence, Aalto University</h3>
            <span className="when">2026 to 2028</span>
          </li>
          <li className="entry">
            <h3>B.Sc., Electrical Engineering (Information Technology), Aalto University</h3>
            <span className="when">2023 to 2026</span>
            <p className="figures">
              <span>
                GPA <b>4.57</b> / 5
              </span>
              <span>thesis grade 5</span>
              <span>182 ECTS</span>
              <span>minor in computer science</span>
              <span>graduated with honours</span>
            </p>
          </li>
          <li className="entry">
            <h3>Reserve Officer Training, Air Force Academy, Tikkakoski</h3>
            <span className="when">2022 to 2023</span>
            <ul>
              <li>Best Officer Candidate and leader of batch 2/2022</li>
              <li>Top of the Communications Line, 3rd overall in IRUK 114</li>
              <li>Led a 10-day field exercise for 300 conscripts</li>
            </ul>
          </li>
          <li className="entry">
            <h3>Schildtin lukio, Jyväskylä, sports line</h3>
            <span className="when">2019 to 2022</span>
          </li>
        </ul>
      </Row>

      <Row label="Also" field="surface">
        <ul className="entries">
          <li className="entry">
            <h3>Basketball</h3>
            <span className="when">youth national teams</span>
            <p>Played in the U20 European Championships and the U18 Nordic Championships.</p>
          </li>
          <li className="entry">
            <h3>Huawei Seeds for the Future</h3>
            <span className="when">2024</span>
            <p>People's Choice Award in the European Tech4Good competition, and third of 22 teams.</p>
          </li>
        </ul>
      </Row>

      <Row label="Tools">
        <div className="groups">
          {skills.map(([group, list]) => (
            <div className="group" key={group}>
              <h3>{group}</h3>
              <p>{list}</p>
            </div>
          ))}
        </div>
      </Row>
    </div>
  );
}
