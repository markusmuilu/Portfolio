import { useState } from "react";
import { Link } from "react-router-dom";
import Row, { Head } from "../components/Row";
import { GameLog, LastNight, NextGames } from "../components/SeasonLog";
import { Betting, SeasonCards } from "../components/SeasonView";
import { TeamView } from "../components/SeasonExplorer";
import Decisions from "../components/Decisions";
import Src, { SourceTable, SrcKey } from "../components/Src";
import PlayerNet from "../components/PlayerNet";
import Predictor from "../components/Predictor";
import RepoActivity from "../components/RepoActivity";
import useJson, { LIVE_DATA, NBA_LIVE } from "../lib/useJson";
import { isHit, pct, played, quality } from "../lib/ledger";
import "./NbaPrediction.css";

// Two levels: the top of the page is for following the season (tonight's games, last night's results, the season's
// numbers), and everything for a deeper look sits behind a switch, a drawer or a tab.

const SEASONS = ["2026-27", "2025-26"];
const HOW = [
  ["model", "The model"],
  ["chosen", "How it was chosen"],
  ["sources", "Pre-game or backtest"],
  ["runs", "How it runs"],
];

export default function NbaPrediction() {
  const data = useJson(`${NBA_LIVE}/nba-season.json`, `${LIVE_DATA}/nba-season.json`, "/data/nba-season.json");
  const ok = data && !data.error;
  const [season, setSeason] = useState("2026-27");
  const [drawer, setDrawer] = useState({ games: false, betting: false });
  const [how, setHow] = useState("model");

  const liveAll = ok ? data.live.games || [] : [];
  // The record counts final predictions only: games that got only their early prediction, and games reconstructed
  // after the fact, are listed but not counted.
  const liveGames = liveAll.filter((g) => g.pm != null && g.r !== "early" && g.r !== "reconstructed");
  const last = ok ? data.backtest.games.filter((g) => g.pm != null) : [];
  const lastLive = ok ? quality(played(data.backtest.games), (g) => g.ps) : null;

  const backtest = season === "2025-26";
  const seasonGames = backtest ? last : liveGames;
  const logGames = backtest ? last : liveAll;

  const now = played(liveGames);
  const right = (k) => now.filter((g) => g[k] != null && isHit(g, k)).length;
  const toggle = (k) => setDrawer((d) => ({ ...d, [k]: !d[k] }));

  return (
    <div className="page nba">
      <Head>
        <div>
          <h1>NBA game prediction</h1>
          <p className="lede">
            Predicts every NBA game before tip-off with a PyTorch model built from each team's players, keeps the
            regression that ran last season beside it as a benchmark, and records every pick against the result and the
            bookmaker's price.
          </p>
          {now.length > 0 ? (
            <p className="lede">
              <Src kind="live" lead />
              2026-27 so far: the main model has called <b>{right("pm")}</b> of {now.length} games right, the regression{" "}
              <b>{right("ps")}</b> of {now.filter((g) => g.ps != null).length}.
            </p>
          ) : (
            lastLive && (
              <p className="lede">
                <Src kind="live" lead />
                Last season the regression called <b>{pct(lastLive.accuracy)}</b> of {lastLive.n.toLocaleString("en")} games.
              </p>
            )
          )}
          <SrcKey />
          <p className="stack-line">Python, PyTorch, FastAPI, Docker, Fly.io, Cloudflare R2</p>
          <div className="actions">
            <a className="btn" href="#tonight">
              Tonight's games
            </a>
            <a className="btn quiet" href="#season">
              Season numbers
            </a>
            <a className="btn quiet" href="#how">
              How it works
            </a>
          </div>
        </div>
      </Head>

      <Row label="Tonight" sub="last night's results and the next games" field="navy" id="tonight">
        {!data && <p className="note">Loading the games.</p>}
        {data?.error && <p className="note">The games could not be loaded.</p>}
        {ok && (
          <div className="tonight">
            <div>
              <h3 className="tv-h">Last night</h3>
              <LastNight games={liveAll} />
            </div>
            <div>
              <h3 className="tv-h">Next games</h3>
              <NextGames games={liveAll} schedule={data.live.schedule || []} firstDayOnly />
            </div>
          </div>
        )}
      </Row>

      <Row label="Season" sub={backtest ? "2025-26: main model a backtest" : "2026-27, pre-game"} field="sky" id="season">
        <div className="switch season-switch" role="group" aria-label="Season">
          {SEASONS.map((s) => (
            <button key={s} type="button" aria-pressed={season === s} onClick={() => setSeason(s)}>
              {s}
            </button>
          ))}
        </div>
        {backtest && (
          <p className="prose-line">
            The main model did not run last season: its numbers are a backtest, trained only on earlier seasons. The
            regression's are its real pre-game predictions from 10 November. Read the gap as a direction, not a precise
            size.
          </p>
        )}
        {ok ? <SeasonCards games={seasonGames} backtest={backtest} /> : <p className="note">Loading the season.</p>}
        {ok && (
          <div className="drawers">
            <button type="button" className="drawer-btn" aria-expanded={drawer.games} onClick={() => toggle("games")}>
              Every game
            </button>
            <button type="button" className="drawer-btn" aria-expanded={drawer.betting} onClick={() => toggle("betting")}>
              Betting
            </button>
          </div>
        )}
        {ok && drawer.games && (
          <div className="drawer">
            <GameLog key={season} games={logGames} />
          </div>
        )}
        {ok && drawer.betting && (
          <div className="drawer">
            <Betting key={season} games={seasonGames} backtest={backtest} />
          </div>
        )}
      </Row>

      <Row label="Teams" sub={`${season}, the same switch as above`} id="teams">
        {ok ? <TeamView key={season} games={logGames} backtest={backtest} /> : <p className="note">Loading the season.</p>}
      </Row>

      <Row label="How it works" sub="for a closer look" field="surface" id="how">
        <div className="switch how-tabs" role="group" aria-label="How it works">
          {HOW.map(([k, label]) => (
            <button key={k} type="button" aria-pressed={how === k} onClick={() => setHow(k)}>
              {label}
            </button>
          ))}
        </div>
        <div className="how-panel">
          {how === "model" && <PlayerNet />}
          {how === "chosen" && <Decisions />}
          {how === "sources" && <Sources data={ok ? data : null} />}
          {how === "runs" && <Runs />}
        </div>
      </Row>

      <Row label="Ask the model" sub="the player model, now" id="ask">
        <Predictor />
      </Row>

      <Row label="The code" sub="live from GitHub">
        <RepoActivity repo="Predicting-Nba" />
      </Row>

      <Row label="Finnish leagues" sub="a side project" field="sky" id="finland">
        <div className="fin-card">
          <p>
            The same idea for Finnish men's basketball: win chances for every Korisliiga, I divisioona and southern II
            divisioona game, from team ratings that update after each result.
          </p>
          <Link className="btn" to="/finnish_basketball">
            Finnish predictions
          </Link>
        </div>
      </Row>
    </div>
  );
}

function Sources({ data }) {
  const lastLive = data ? quality(played(data.backtest.games), (g) => g.ps) : null;
  const both = data ? data.backtest.games.filter((g) => g.pm != null) : [];
  return (
    <SourceTable
      rows={[
        {
          what: "2026-27, both models",
          kind: "live",
          detail:
            "Each game is predicted twice and both are stored: early, once both teams have played their previous game, and final, 60 to 75 minutes before tip-off after the injury report. The record counts the final prediction, with the price at that moment.",
        },
        {
          what: "21 October 2026",
          kind: "backtest",
          detail:
            "The prediction loop ran out of memory and missed all 11 games. They are shown with predictions computed afterwards from the history before that day, and not counted in the record.",
        },
        {
          what: `Logistic regression, 2025-26${lastLive ? `: ${pct(lastLive.accuracy)} of ${lastLive.n.toLocaleString("en")} games` : ""}`,
          kind: "live",
          detail:
            "Predicted before each game from 10 November 2025 and stored. From 7 January the bookmaker's price at that moment was stored with it.",
        },
        {
          what: `Player model, 2025-26${both.length ? `: ${pct(quality(both, (g) => g.pm).accuracy)} of ${both.length.toLocaleString("en")} games` : ""}`,
          kind: "backtest",
          detail:
            "Trained on 2020-21 to 2023-24, with 2024-25 for choosing settings, so it never saw a 2025-26 game. It used each team's previous-game roster. The season numbers compare the two models on these games, the ones the regression also predicted.",
        },
        {
          what: "How it was chosen",
          kind: "backtest",
          detail: "Every chart there scores models on seasons they were not trained on.",
        },
      ]}
    >
      <p>
        A <b>pre-game</b> number comes from predictions made before each game and stored as they were. A <b>backtest</b>{" "}
        scores a model afterwards, on games it was not trained on.
      </p>
      <p>
        A backtest is the best test there is before a model goes live, but it can still flatter: the data was cleaned
        after the fact, and the model was picked after seeing how earlier versions scored. A pre-game record has neither
        advantage, so it counts for more.
      </p>
    </SourceTable>
  );
}

function Runs() {
  return (
    <ul className="entries">
      <li className="entry">
        <h3>Every 15 minutes</h3>
        <p>
          Records finished games and their box scores from ESPN. A game gets its early prediction as soon as both teams
          have played their previous game, and its final one 60 to 75 minutes before tip-off, after reading the ESPN
          injury list. Both models predict each time, and the price from The Odds API is stored with them.
        </p>
      </li>
      <li className="entry">
        <h3>Storage and serving</h3>
        <p>
          A FastAPI service on Fly.io with 1 GB of memory. All state lives in Cloudflare R2: training data, the player
          history, the model weights, predictions and results. There is no database.
        </p>
      </li>
      <li className="entry">
        <h3>This page</h3>
        <p>
          Every number is computed in your browser from one row per game: the date, the teams, both models'
          probabilities, the result and the stored prices.
        </p>
      </li>
    </ul>
  );
}
