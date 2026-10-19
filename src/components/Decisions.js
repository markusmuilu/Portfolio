import { useState } from "react";
import useJson from "../lib/useJson";
import { DotPlot, Dumbbell, Heatmap } from "./charts/charts";

const ll = (v) => v.toFixed(3);

// Why the models are compared on log loss: the cost of one game for a few chances given to the team that won.
const COSTS = [0.9, 0.7, 0.5, 0.3, 0.1];
function LogLossNote() {
  return (
    <div className="ll-note">
      <div>
        <h4>Why log loss, not accuracy</h4>
        <p>
          Accuracy only asks whether the pick was right, so a 51% call and a 90% call count the same. Log loss scores
          the probability: each game costs minus the log of the chance the model gave to what happened. Averaged over a
          season, lower is better, and saying 50% every game scores 0.693.
        </p>
        <p>
          Betting and the Kelly test below need the probability to be right, not only the pick, so models are chosen on
          log loss. Accuracy is still shown because it is easier to read.
        </p>
      </div>
      <table className="ll-costs">
        <caption>Cost of one game</caption>
        <thead>
          <tr>
            <th scope="col">Chance given to the winner</th>
            <th scope="col" className="num">
              Cost
            </th>
          </tr>
        </thead>
        <tbody>
          {COSTS.map((p) => (
            <tr key={p}>
              <td>{Math.round(p * 100)}%</td>
              <td className="num">
                <span className="ll-bar" style={{ width: `${(-Math.log(p) / -Math.log(0.1)) * 100}%` }} />
                {(-Math.log(p)).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// The NBA model's decisions, each with the test that settled it. Data: research/export_decisions.py.
export default function Decisions() {
  const data = useJson("/data/decisions.json");
  const [kellyModel, setKellyModel] = useState("player_model_prev");
  if (!data || data.error) return <p className="note">Loading the research results.</p>;
  const n = data.nba;

  const models = [...n.models].sort((a, b) => a.log_loss - b.log_loss).map((m) => ({
    label: m.label,
    value: m.log_loss,
    tone: m.key === "player_model_prev" ? "main" : m.key === "logreg" ? "second" : "other",
    note: m.gain_vs_logreg ? `${m.gain_vs_logreg[0] > 0 ? "better" : "worse"} than the regression by ${Math.abs(m.gain_vs_logreg[0]).toFixed(3)}` : null,
  }));
  const deeper = n.models.find((m) => m.key === "dl_both_w12_pr_wide_league");
  const main = n.models.find((m) => m.key === "player_model_prev");
  const lr = n.models.find((m) => m.key === "logreg");

  const fractions = [0.05, 0.1, 0.25, 0.5, 1.0];
  const thresholds = [0, 0.02, 0.05, 0.1];
  const cells = n.kelly[kellyModel];
  const cell = (f, t) => cells.find((c) => c.fraction === f && c.threshold === t)?.final;

  return (
    <div className="decisions">
      <section className="dec">
        <h3 className="row-title">Which model</h3>
        <p className="prose-line">
          Seven ways to predict a game, each using only what is known before tip-off, scored once on the{" "}
          {n.test_games.toLocaleString("en")} games of {n.test_season}, all as backtests. Lower log loss is better.
        </p>
        <LogLossNote />
        <DotPlot
          rows={models}
          domain={[0.575, 0.615]}
          ticks={[0.58, 0.59, 0.6, 0.61]}
          format={ll}
          axisLabel="log loss, lower is better"
          caption={`The player model (blue) beats the logistic regression (teal) by ${(lr.log_loss - main.log_loss).toFixed(3)}, an interval that stays above zero. The deeper network scored ${deeper.log_loss.toFixed(3)}, slightly better again, but within noise, so the simpler player model is the main model. A model that knows who actually played reaches ${n.optimistic[0].log_loss.toFixed(3)}, which no model can know before tip-off.`}
        />
      </section>

      <section className="dec">
        <h3 className="row-title">Do injury reports help</h3>
        <p className="prose-line">
          Last game's roster against the official injury report, tested season by season: train on the seasons before,
          predict the next one.
        </p>
        <Dumbbell
          rows={n.injuries.folds.map((f) => ({ label: f.season, a: f.previous, b: f.report }))}
          domain={[0.56, 0.65]}
          format={ll}
          labels={["last game's roster", "with the injury report"]}
          caption={`Better in all five seasons, by ${n.injuries.pooled_gain[0].toFixed(4)} log loss on average (interval ${n.injuries.pooled_gain[1].toFixed(4)} to ${n.injuries.pooled_gain[2].toFixed(4)}). That is why the running model removes injured players before predicting.`}
        />
      </section>

      <section className="dec">
        <h3 className="row-title">When to predict</h3>
        <p className="prose-line">The same test with the injury report taken 60, 30 or 15 minutes before tip-off.</p>
        <DotPlot
          rows={[
            { label: "Last game's roster", value: n.timing.previous, tone: "other" },
            { label: "Report 60 min before", value: n.timing["T-60"], tone: "main" },
            { label: "Report 30 min before", value: n.timing["T-30"], tone: "other" },
            { label: "Report 15 min before", value: n.timing["T-15"], tone: "other" },
          ]}
          domain={[0.6, 0.614]}
          ticks={[0.6, 0.605, 0.61]}
          format={(v) => v.toFixed(4)}
          axisLabel="log loss, five seasons"
          caption={`Waiting from 60 to 30 minutes changes log loss by ${n.timing.t30_vs_t60[0].toFixed(4)} (interval ${n.timing.t30_vs_t60[1].toFixed(4)} to ${n.timing.t30_vs_t60[2].toFixed(4)}): no measurable difference. Predicting an hour before leaves room to log the price before the late moves.`}
        />
      </section>

      <section className="dec">
        <h3 className="row-title">How much to bet</h3>
        <p className="prose-line">
          The bankroll left after the season for every Kelly fraction and minimum edge, starting from 1, on the{" "}
          680 games with a stored price. Outlined cells ended above where they started.
        </p>
        <div className="switch" role="group" aria-label="Model">
          <button type="button" aria-pressed={kellyModel === "player_model_prev"} onClick={() => setKellyModel("player_model_prev")}>
            Player model
          </button>
          <button type="button" aria-pressed={kellyModel === "logreg"} onClick={() => setKellyModel("logreg")}>
            Logistic regression
          </button>
        </div>
        <Heatmap
          rows={fractions.map((f) => ({ label: `${f}`, f }))}
          cols={thresholds.map((t) => ({ label: `${Math.round(t * 100)}%`, t }))}
          value={(r, c) => cell(r.f, c.t)}
          rowLabel="Kelly fraction"
          colLabel="minimum edge"
          format={(v) => (v < 0.005 ? "<0.01" : v.toFixed(2))}
          base={1}
          caption="The player model's best setting ends at 1.02, which over 680 games is within noise of where it started; the regression loses at every setting, and full Kelly empties the bankroll for both. The bookmaker's prices already carry most of what the models know, so the page tracks bets on paper only."
        />
      </section>
    </div>
  );
}
