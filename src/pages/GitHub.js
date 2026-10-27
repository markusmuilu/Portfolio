import { Link } from "react-router-dom";
import Row, { Head } from "../components/Row";

const repos = [
  {
    name: "fidelix-modbus-bridge",
    description:
      "Replacement control system for a house's 24 heating zones: Home Assistant and AppDaemon on a Raspberry Pi, driving a Fidelix FX-2020 controller over Modbus RTU. A redacted snapshot of the real code.",
    tags: "Python, Modbus RTU, pymodbus, AppDaemon, Home Assistant",
    internal: "/home_heating",
  },
  {
    name: "Predicting-Nba",
    description:
      "Daily NBA game predictions with a full record of each pick against the bookmaker's price. A PyTorch player model is the main model for 2026-27, with a logistic regression as the shadow.",
    tags: "Python, PyTorch, FastAPI, Docker, Fly.io, Cloudflare R2",
    internal: "/nba_prediction",
  },
  {
    name: "gym-exercise-recognition",
    description:
      "Bachelor's thesis code. Compares LightGBM and Random Forest for recognising gym exercises from wrist, leg and pocket sensors. LightGBM reached 0.889 macro F1 on the wrist.",
    tags: "Python, LightGBM, scikit-learn, Jupyter",
    internal: "/thesis",
  },
  {
    name: "basketball-cv",
    description:
      "Player, ball and event detection on NBA broadcast footage: RF-DETR fine-tuned, with ByteTrack following players across frames. 0.561 mAP on a held-out split; the ball and jersey numbers are the weakest classes. Unfinished.",
    tags: "Python, PyTorch, RF-DETR, ByteTrack, Jupyter",
  },
  {
    name: "Portfolio",
    description: "This site. React, with each page prerendered to static HTML at build time.",
    tags: "React, JavaScript, CSS",
  },
];

export default function Github() {
  return (
    <div className="page">
      <Head>
        <div>
          <h1>Repositories</h1>
          <p className="lede">The public code behind the projects on this site.</p>
          <div className="actions">
            <a className="btn" href="https://github.com/markusmuilu" target="_blank" rel="noopener noreferrer">
              Full GitHub profile
            </a>
          </div>
        </div>
      </Head>

      <Row label="Public repositories">
        <ul className="entries">
          {repos.map((r) => (
            <li className="entry" key={r.name}>
              <h3>
                <a className="repo-name" href={`https://github.com/markusmuilu/${r.name}`} target="_blank" rel="noopener noreferrer">
                  {r.name}
                </a>
              </h3>
              {r.internal ? (
                <Link to={r.internal} className="link when-link">
                  Project page
                </Link>
              ) : (
                <span />
              )}
              <p>{r.description}</p>
              <p className="figures">
                <span>{r.tags}</span>
              </p>
            </li>
          ))}
        </ul>
      </Row>
    </div>
  );
}
