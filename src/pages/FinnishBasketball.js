import { useState } from "react";
import { Link } from "react-router-dom";
import Row, { Head } from "../components/Row";
import Finland from "../components/Finland";
import { SourceTable, SrcKey } from "../components/Src";
import { Calibration, DotPlot } from "../components/charts/charts";
import useJson, { LIVE_DATA, NBA_LIVE } from "../lib/useJson";

const REPO = "https://github.com/markusmuilu/Predicting-Nba/tree/main/src/predict_nba/finland";
const FAMILY = { elo: "Elo", margin: "Point margin" };
const MODE = { final: "final score", q3: "after 3 quarters", half: "half-time", mix: "final and 3 quarters" };

export default function FinnishBasketball() {
  const data = useJson(`${NBA_LIVE}/finland.json`, `${LIVE_DATA}/finland.json`, "/data/finland.json");
  const decisions = useJson("/data/decisions.json");
  const [pool, setPool] = useState("national");
  const ok = data && !data.error;
  const p = ok ? data.pools[pool] : null;
  // Share of each surprise a rating takes on, per pool (the tuned K).
  const share = (key) => (ok ? `${Math.round(data.pools[key].params.K * 100)}%` : "a fixed share");

  return (
    <div className="page">
      <Head>
        <div>
          <h1>Finnish basketball predictions</h1>
          <p className="lede">
            Win chances for every men's Korisliiga, I divisioona and southern II divisioona game, from team ratings that
            update after each result. A side project next to the NBA model, built on the federation's own results.
          </p>
          <SrcKey />
          <p className="stack-line">Python, pandas, Fly.io. Updated every morning around 11:00. The ratings learn from results only; rosters are not used yet.</p>
          <div className="actions">
            <a className="btn" href="#games">
              Next games
            </a>
            <a className="btn quiet" href="#how">
              How it works
            </a>
            <Link className="btn quiet" to="/nba_prediction">
              The NBA model
            </Link>
          </div>
        </div>
      </Head>

      <Row label="Games" sub="next three weeks" field="navy" id="games">
        <Finland />
      </Row>

      <Row label="Pre-game or backtest" sub="what each number is" field="surface" id="sources">
        <SourceTable
          rows={[
            {
              what: "Logged predictions, from 16 October 2026",
              kind: "live",
              detail:
                "Each game is stored twice and never changed: an early prediction when it first appears in the schedule, up to three weeks ahead, and a final one on the morning of the game, with every result up to then. The record uses the latest one stored before tip-off. Game-day predictions started on 19 October.",
            },
            {
              what: "This season replayed",
              kind: "backtest",
              detail:
                "Each morning the current model runs through this season's games in order. Every chance uses only games played before it, but the settings and code are today's, so it is not what the page showed on the day.",
            },
            {
              what: "2025-26 accuracy",
              kind: "backtest",
              detail: "Settings tuned on earlier seasons, then scored once on 2025-26.",
            },
            {
              what: "Modelling decisions",
              kind: "backtest",
              detail: "Every variant scored on 2025-26 after tuning on earlier seasons.",
            },
          ]}
        >
          <p>
            A <b>pre-game</b> number comes from predictions stored before each game. A <b>backtest</b> scores the model
            afterwards on games it was not tuned on. Pre-game logging started on 16 October 2026, so most of the record is
            still a backtest.
          </p>
        </SourceTable>
      </Row>

      <Row label="How it works" id="how">
        <ul className="entries">
          <li className="entry">
            <h3>One rating per team</h3>
            <p>
              Each team's rating is its expected point margin against an average team. Before a game, home rating minus
              away rating plus a home-court bonus gives the expected margin, and that turns into a win chance. After the
              game both ratings move by a fixed share of the surprise, the gap between the expected and the actual
              margin: {share("national")} of it in Korisliiga and I divisioona, {share("m2d")} in II divisioona.
            </p>
            <p>
              Opponent strength is built in, because the expected margin already includes it: losing by 8 to a team
              expected to win by 15 raises a rating. One limit: a game is judged by the ratings at the time. A heavy loss
              to an opponent that only later turns out to be strong is not revisited.
            </p>
          </li>
          <li className="entry">
            <h3>Two pools</h3>
            <p>
              Korisliiga and both I divisioona groups share one pool, so a promoted team keeps the rating it earned. The II
              divisioona is its own pool: it learns from every region, and this page shows the southern group.
            </p>
          </li>
          <li className="entry">
            <h3>Over the summer</h3>
            <p>
              Ratings shrink part of the way back to the level of the league a team last played in, because rosters
              change between seasons. That shrink is one of the settings the tuning chose.
            </p>
          </li>
        </ul>
      </Row>

      <Row label="Modelling decisions" sub="backtests on 2025-26" field="surface">
        <div className="switch" role="group" aria-label="Pool">
          <button type="button" aria-pressed={pool === "national"} onClick={() => setPool("national")}>
            Korisliiga and I divisioona
          </button>
          <button type="button" aria-pressed={pool === "m2d"} onClick={() => setPool("m2d")}>
            II divisioona
          </button>
        </div>
        {p && (
          <div className="dec-grid">
            <section className="dec">
              <h3 className="row-title">Which rating, which margin</h3>
              <p className="prose-line">
                Eight variants: two rating systems times four ways of counting the margin. Each was tuned on earlier
                seasons and scored once on 2025-26.
              </p>
              <ul className="dec-list">
                <li>
                  <b>Elo</b> moves a rating by how surprising the win or loss was, a little more for a bigger margin.{" "}
                  <b>Point margin</b> moves it by how many points the result beat the expectation by.
                </li>
                <li>
                  The margin can be the <b>final score</b>, the score <b>after three quarters</b> (leaving out the last
                  quarter, when fouling and resting starters stretch or shrink the gap), the <b>half-time</b> score, or
                  the average of <b>final and three quarters</b>. Overtime never counts.
                </li>
                <li>
                  The chosen variant (blue) is the best on the tuning seasons, not on 2025-26. Picking the lowest dot here
                  would make 2025-26 part of the tuning, and the gaps between the top variants are far smaller than the
                  noise in one season.
                </li>
              </ul>
              <DotPlot
                rows={[...p.combos]
                  .sort((a, b) => a.test - b.test)
                  .map((c) => ({
                    label: `${FAMILY[c.family]}, ${MODE[c.mode]}`,
                    value: c.test,
                    tone: c.chosen ? "main" : "other",
                    note: `${(c.test_accuracy * 100).toFixed(1)}% called right`,
                  }))}
                domain={[Math.min(...p.combos.map((c) => c.test)) - 0.006, Math.max(...p.combos.map((c) => c.test)) + 0.004]}
                format={(v) => v.toFixed(3)}
                axisLabel="log loss on 2025-26"
                caption="All eight land close together: how the margin is counted matters less than having a margin at all. The point-margin rating was chosen in both pools."
              />
            </section>
            <section className="dec">
              <h3 className="row-title">Are the percentages honest</h3>
              <p className="prose-line">Games grouped by predicted chance, against how often the home team actually won.</p>
              <Calibration
                bins={p.calibration_test}
                caption="Dots near the dashed line mean a 70% chance came true about 70% of the time. Bigger dots hold more games."
              />
            </section>
          </div>
        )}
        {pool === "national" && decisions && !decisions.error && (
          <section className="dec">
            <h3 className="row-title">Does more history help</h3>
            <p className="prose-line">
              The results service starts in 2022-23. Seven more seasons, back to 2015-16, came from basket.fi's statistics
              service. Three ways to use them, scored on the same 2025-26 games:
            </p>
            <DotPlot
              rows={Object.entries(decisions.finland.history).map(([k, h]) => ({
                label: h.label,
                value: h.log_loss,
                tone: k === "C" ? "main" : "other",
                lo: h.gain_vs_A ? decisions.finland.history.A.log_loss - h.gain_vs_A.hi : undefined,
                hi: h.gain_vs_A ? decisions.finland.history.A.log_loss - h.gain_vs_A.lo : undefined,
                note: `${(h.accuracy * 100).toFixed(1)}% called right`,
              }))}
              domain={[0.594, 0.612]}
              ticks={[0.596, 0.604, 0.612]}
              format={(v) => v.toFixed(4)}
              axisLabel="log loss on 2025-26"
              caption="Barely a difference: each summer a rating keeps only about half its distance from the league level, so old seasons fade within a few years. The eight-season tuning (blue) is used because settings chosen over eight seasons are steadier than over two."
            />
          </section>
        )}
      </Row>

      <Row label="The code" sub="open source">
        <p className="prose-line">
          The data pipeline, models and tests are in the{" "}
          <a className="link" href={REPO} target="_blank" rel="noopener noreferrer">
            finland folder of the Predicting-Nba repository
          </a>
          . There are no betting prices for these leagues in any open data source yet, so nothing here is compared with a
          bookmaker.
        </p>
      </Row>
    </div>
  );
}
