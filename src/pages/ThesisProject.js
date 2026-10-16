import Row, { Head } from "../components/Row";
import RepoActivity from "../components/RepoActivity";
import "./ThesisProject.css";

const REPO = "https://github.com/markusmuilu/gym-exercise-recognition";

const results = [
  { position: "Wrist", lgbm: 0.889, rf: 0.868 },
  { position: "Leg", lgbm: 0.793, rf: 0.773 },
  { position: "Pocket", lgbm: 0.528, rf: 0.519 },
];

const steps = [
  [
    "Dataset",
    "10 subjects, five men and five women, performed 11 gym exercises wearing sensors on the wrist, on the leg and in the pocket. Each sensor recorded 3-axis acceleration, 3-axis gyroscope and body capacitance at 20 Hz.",
  ],
  [
    "Features",
    "4-second sliding windows with 2 seconds of overlap. Mean, minimum, maximum, standard deviation and MAD per channel give 35 features and 117,437 labelled windows.",
  ],
  [
    "Tuning",
    <>
      Grid search over 5 hyperparameters per model on the first two folds, wrist position. Best LightGBM settings:{" "}
      <code>num_leaves=60, lr=0.05, n_estimators=400</code>.
    </>,
  ],
  [
    "Evaluation",
    "Leave-one-group-out cross-validation: each fold holds out one subject entirely, so every score is on a person the model never saw. Reported as macro F1.",
  ],
];

export default function ThesisProject() {
  return (
    <div className="page">
      <Head>
        <div>
          <h1 className="h1-long">Improving gym exercise recognition with Light Gradient Boosting</h1>
          <p className="lede">
            Tests whether LightGBM recognises gym exercises from wearable sensor data better than Random Forest, at three
            sensor positions, with each subject held out in turn. LightGBM scored higher at all three and trained in
            under half the time.
          </p>
          <p className="stack-line">Bachelor's thesis, Aalto University, 2026. Grade 5 of 5.</p>
          <div className="actions">
            <a className="btn" href={`${REPO}/blob/main/thesis.pdf`} target="_blank" rel="noopener noreferrer">
              Read the thesis (PDF)
            </a>
            <a className="btn quiet" href={REPO} target="_blank" rel="noopener noreferrer">
              Code on GitHub
            </a>
          </div>
        </div>
      </Head>

      <Row label="Results" sub="macro F1 after tuning" field="surface">
        <table className="f1">
          <thead>
            <tr>
              <th scope="col">Position</th>
              <th scope="col">LightGBM</th>
              <th scope="col">Random Forest</th>
              <th scope="col" className="num">
                Difference
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map(({ position, lgbm, rf }) => (
              <tr key={position}>
                <th scope="row">{position}</th>
                <td>
                  <span className="f1-bar lgbm" style={{ width: `${lgbm * 100}%` }} />
                  <span className="f1-num">{lgbm.toFixed(3)}</span>
                </td>
                <td>
                  <span className="f1-bar rf" style={{ width: `${rf * 100}%` }} />
                  <span className="f1-num">{rf.toFixed(3)}</span>
                </td>
                <td className="num">+{(lgbm - rf).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="note f1-note">
          Bars run from 0 to 1.
        </p>
      </Row>

      <Row label="Method">
        <ol className="entries steps">
          {steps.map(([title, body]) => (
            <li className="entry" key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </Row>

      <Row label="The code" sub="live from GitHub">
        <RepoActivity repo="gym-exercise-recognition" />
      </Row>

      <Row label="Stack">
        <p className="words-line">Python, LightGBM, scikit-learn, pandas, NumPy, Matplotlib, Jupyter</p>
      </Row>
    </div>
  );
}
