import { useMemo, useState } from "react";
import Row, { Head } from "../components/Row";
import Tally from "../components/Tally";
import LineChart from "../components/LineChart";
import Finland from "../components/Finland";
import Predictor from "../components/Predictor";
import SeasonExplorer from "../components/SeasonExplorer";
import RepoActivity from "../components/RepoActivity";
import useJson, { LIVE_DATA, NBA_LIVE } from "../lib/useJson";
import { MODELS, euro, flatLedger, kellyLedger, marketP, pct, played, priced, quality, shortDate, signedPct } from "../lib/ledger";
import "./NbaPrediction.css";

const REPO = "https://github.com/markusmuilu/Predicting-Nba";

export default function NbaPrediction() {
  const data = useJson(`${NBA_LIVE}/nba-season.json`, `${LIVE_DATA}/nba-season.json`, "/data/nba-season.json");
  const ok = data && !data.error;
  const liveAll = data?.live?.games || [];
  const liveGames = liveAll.filter((g) => g.pm != null && g.ps != null);
  const hasLive = played(liveGames).length > 0;
  const upcoming = liveAll.filter((g) => g.hw == null).slice(-15);
  const last = ok ? data.backtest.games : [];
  const both = last.filter((g) => g.pm != null);
  const liveRecord = ok ? quality(played(last), (g) => g.ps) : null;
  const fromJan = ok ? quality(played(last).filter((g) => g.d >= "2026-01-09"), (g) => g.ps) : null;
  const days = ok ? Math.ceil((new Date(`${data.live.opens}T00:00:00`) - new Date()) / 86400000) : null;

  return (
    <div className="page nba">
      <Head>
        <div>
          <h1>NBA game prediction</h1>
          <p className="lede">
            Predicts the winner of every NBA game before tip-off and keeps a record of each pick against the
            bookmaker's price. For the 2026-27 season a PyTorch model built from each team's players becomes the main
            model, and the logistic regression that predicted every game live last season keeps running beside it.
          </p>
          {liveRecord && (
            <p className="lede">
              Last season, live: the regression called <b>{pct(liveRecord.accuracy)}</b> of{" "}
              {liveRecord.n.toLocaleString("en")} regular-season games, and <b>{pct(fromJan.accuracy)}</b> of the{" "}
              {fromJan.n} from 9 January on.
            </p>
          )}
          <p className="stack-line">Python, PyTorch, FastAPI, Docker, Fly.io, Cloudflare R2</p>
          <div className="actions">
            <a className="btn" href="#season">
              The 2026-27 season
            </a>
            <a className="btn quiet" href={REPO} target="_blank" rel="noopener noreferrer">
              Code on GitHub
            </a>
          </div>
        </div>
      </Head>

      <Row label="2026-27 season" sub={days > 0 ? `opens in ${days} day${days === 1 ? "" : "s"}` : "in progress"} field="navy" id="season">
        {upcoming.length > 0 && <Upcoming games={upcoming} />}
        {hasLive ? (
          <Season games={liveGames} backtest={false} />
        ) : (
          <div className="upcoming">
            <p className="upcoming-lead">
              {ok ? (
                <>
                  The regular season opens on <b>{shortDate(data.live.opens)}</b>. From the first game, both models
                  predict every game before tip-off, and each pick is logged here with the price at that moment and the
                  result.
                </>
              ) : (
                "Loading the season."
              )}
            </p>
            <ul className="upcoming-models">
              <li>
                <span className="um-tag">Main</span>
                <h3>PyTorch player model</h3>
                <p>
                  Each player's recent box-score form goes through the same small network, and a team is the average of
                  its players weighted by expected minutes. A head that is antisymmetric in the two teams turns the pair
                  into a home-win probability. It uses the roster from each team's previous game, since that is what is
                  known before tip-off.
                </p>
                {both.length > 0 && <p className="um-fig">Backtest on last season: {pct(quality(both, (g) => g.pm).accuracy)} called right</p>}
              </li>
              <li>
                <span className="um-tag">Shadow</span>
                <h3>Logistic regression</h3>
                <p>
                  Team statistics from recent games. It ran in production through 2025-26 and predicted every game live,
                  so it is the benchmark: the player model has to beat it on the same games to stay the main model.
                </p>
                {liveRecord && <p className="um-fig">Live last season: {pct(liveRecord.accuracy)} called right</p>}
              </li>
            </ul>
            <ul className="upcoming-log">
              <li><b>Before tip-off</b>both models' win probability for the home team</li>
              <li><b>At the same moment</b>the bookmaker's price for both sides</li>
              <li><b>After the game</b>the result, which model was right, and €1 and quarter-Kelly paper bets</li>
            </ul>
          </div>
        )}
      </Row>

      <Row label="Last season" sub="2025-26, live and backtest" field="sky" id="results">
        {!data && <p className="note">Loading the season.</p>}
        {data?.error && <p className="note">The season data could not be loaded.</p>}
        {ok && (
          <>
            <p className="prose-line">
              The regression's numbers are its real live predictions, made before each game from 10 November. The player
              model did not run last season: its numbers are a backtest on the same games, trained only on earlier
              seasons. Live and backtest are not quite the same test, so read the gap as a direction, not a precise size.
            </p>
            <Season games={both} backtest={true} />
          </>
        )}
      </Row>

      <Row label="Follow a team" sub="2025-26" id="explore">
        {ok ? <SeasonExplorer games={both} /> : <p className="note">Loading the season.</p>}
      </Row>

      <Row label="How it runs">
        <ul className="entries">
          <li className="entry">
            <h3>Daily job</h3>
            <p>
              Resolves finished games from ESPN, archives them to the history, rebuilds features, and writes the day's
              predictions with odds from The Odds API.
            </p>
          </li>
          <li className="entry">
            <h3>Storage and serving</h3>
            <p>
              A FastAPI service on Fly.io. All state lives in Cloudflare R2: training data, features, the model bundle,
              predictions and history. There is no database.
            </p>
          </li>
          <li className="entry">
            <h3>This page</h3>
            <p>
              The ledger is computed in your browser from one row per game: the date, the teams, both models'
              probabilities, the result and the stored prices.
            </p>
          </li>
        </ul>
      </Row>

      <Row label="The code" sub="live from GitHub">
        <RepoActivity repo="Predicting-Nba" />
      </Row>

      <Row label="Ask the model" sub="the deployed regression" field="surface">
        <Predictor />
      </Row>

      <Row label="Finnish leagues" sub="a side project" field="sky" id="finland">
        <p className="prose-line">
          Team ratings for the Finnish men's leagues: Korisliiga and the two I divisioona groups in one model, the II
          divisioona in another, built from final and quarter scores in the federation's results service.
        </p>
        <Finland />
      </Row>
    </div>
  );
}

function Season({ games, backtest }) {
  const [model, setModel] = useState("pm");
  const s = useMemo(() => {
    const done = played(games);
    const withPrice = priced(games);
    const row = (key) => ({
      all: quality(done, (g) => g[key]),
      priced: quality(withPrice, (g) => g[key]),
      flat: flatLedger(withPrice, key),
      kelly: kellyLedger(withPrice, key),
    });
    return {
      done,
      withPrice,
      pm: row("pm"),
      ps: row("ps"),
      market: quality(withPrice, marketP),
      marketFlat: flatLedger(
        withPrice.map((g) => ({ ...g, mk: marketP(g) })),
        "mk"
      ),
    };
  }, [games]);

  const pricedSpan = s.withPrice.length ? `${shortDate(s.withPrice[0].d)} to ${shortDate(s.withPrice[s.withPrice.length - 1].d)}` : "";

  return (
    <div className="season">
      <p className="season-scope">
        {s.done.length.toLocaleString("en")} {s.done.length === 1 ? "game" : "games"} played. {s.withPrice.length} have a stored price
        {pricedSpan && ` (${pricedSpan})`}, and the money columns use only those.
      </p>

      <div className="scroll-x">
        <table className="scoreboard">
          <thead>
            <tr>
              <th scope="col" />
              <th scope="col" className="num">
                Called right
              </th>
              <th scope="col" className="num">
                Log loss
              </th>
              <th scope="col" className="num">
                €1 on every pick
              </th>
              <th scope="col" className="num">
                Quarter Kelly, €100
              </th>
              <th scope="col" className="num">
                Worst drop
              </th>
            </tr>
          </thead>
          <tbody>
            {["pm", "ps"].map((k) => (
              <tr key={k} className={k}>
                <th scope="row">
                  <span className="swatch" aria-hidden="true" />
                  {MODELS[k].name}
                  <span className="sub">{MODELS[k].long}{backtest ? `, ${MODELS[k].last}` : ""}</span>
                </th>
                <td className="num">
                  {pct(s[k].all.accuracy)}
                  <span className="sub">priced {pct(s[k].priced.accuracy)}</span>
                </td>
                <td className="num">
                  {s[k].all.logLoss.toFixed(3)}
                  <span className="sub">priced {s[k].priced.logLoss.toFixed(3)}</span>
                </td>
                <td className={`num ${s[k].flat.profit < 0 ? "neg" : ""}`}>
                  {euro(s[k].flat.profit, true)}
                  <span className="sub">
                    ROI {signedPct(s[k].flat.roi)}
                    {s[k].flat.interval && `, 95% ${signedPct(s[k].flat.interval[0], 0)} to ${signedPct(s[k].flat.interval[1], 0)}`}
                  </span>
                </td>
                <td className={`num ${s[k].kelly.final < s[k].kelly.start ? "neg" : ""}`}>
                  {euro(s[k].kelly.final)}
                  <span className="sub">{s[k].kelly.bets} bets</span>
                </td>
                <td className="num neg">{pct(s[k].kelly.maxDrawdown, 0)}</td>
              </tr>
            ))}
            <tr className="mk">
              <th scope="row">
                <span className="swatch" aria-hidden="true" />
                Market
                <span className="sub">Pinnacle price, margin removed</span>
              </th>
              <td className="num">
                <span className="na">n/a</span>
                <span className="sub">priced {pct(s.market.accuracy)}</span>
              </td>
              <td className="num">
                <span className="na">n/a</span>
                <span className="sub">priced {s.market.logLoss.toFixed(3)}</span>
              </td>
              <td className={`num ${s.marketFlat.profit < 0 ? "neg" : ""}`}>
                {euro(s.marketFlat.profit, true)}
                <span className="sub">€1 on every favourite</span>
              </td>
              <td className="num">
                <span className="na">no bets</span>
              </td>
              <td className="num" />
            </tr>
          </tbody>
        </table>
      </div>

      <div className="tally-wrap">
        <div className="tally-top">
          <h3>Every game, one square</h3>
          <div className="switch" role="group" aria-label="Model">
            {["pm", "ps"].map((k) => (
              <button key={k} type="button" aria-pressed={model === k} onClick={() => setModel(k)}>
                {MODELS[k].name}
              </button>
            ))}
          </div>
        </div>
        <Tally games={games} modelKey={model} />
      </div>

      {s.withPrice.length > 1 && (
        <div className="charts">
          <LineChart
            title="€1 on every pick: running profit"
            dates={s.withPrice.map((g) => g.d)}
            base={0}
            format={(v) => `${v < 0 ? "−" : ""}€${Math.abs(v).toFixed(0)}`}
            series={[
              { label: "Main", values: s.pm.flat.path, className: "pm" },
              { label: "Shadow", values: s.ps.flat.path, className: "ps" },
            ]}
          />
          <LineChart
            title="Quarter Kelly: bankroll from €100"
            dates={s.withPrice.map((g) => g.d)}
            base={100}
            format={(v) => `€${v.toFixed(0)}`}
            series={[
              { label: "Main", values: s.pm.kelly.path, className: "pm" },
              { label: "Shadow", values: s.ps.kelly.path, className: "ps" },
            ]}
          />
        </div>
      )}

      <div className="reading">
        <h3>Reading these numbers</h3>
        <ul>
          <li>
            <b>Log loss</b> scores the probability, not only the pick. Lower is better, and 0.693 is a coin flip.
          </li>
          <li>
            <b>Quarter Kelly</b> stakes a quarter of the Kelly fraction of the bankroll, only on a side the model rates
            above the price. Flat staking puts €1 on the model's pick in every priced game.
          </li>
          {backtest && (
            <>
              <li>
                The prices were stored when the daily job ran, around midday Finnish time, not at closing. They are
                the only prices that exist for this season.
              </li>
              <li>
                The market called these games better than either model. Where the models disagreed with it, they were
                mostly backing underdogs the market had rated correctly, which is why Kelly staking loses faster than
                flat stakes.
              </li>
              <li>
                Confirming a 1% edge would take tens of thousands of bets. {s.withPrice.length} games can only rule out
                large ones.
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

// Games predicted but not played yet: both models' pick, and the price when the prediction was made.
function Upcoming({ games }) {
  const tip = (g) =>
    g.t
      ? new Date(g.t).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Helsinki" })
      : shortDate(g.d);
  const side = (g, p) => (p == null ? "n/a" : p >= 0.5 ? `${g.h} ${pct(p, 0)}` : `${g.a} ${pct(1 - p, 0)}`);
  return (
    <div className="next-games">
      <h3 className="tv-h">Predicted, not played yet</h3>
      <div className="scroll-x">
        <table className="tv-table next-table">
          <thead>
            <tr>
              <th scope="col">Tip-off (Finnish time)</th>
              <th scope="col">Game</th>
              <th scope="col">Main pick</th>
              <th scope="col">Shadow pick</th>
              <th scope="col" className="num">
                Price home / away
              </th>
            </tr>
          </thead>
          <tbody>
            {games.map((g) => (
              <tr key={g.d + g.h}>
                <td>{tip(g)}</td>
                <td>
                  {g.a} at {g.h}
                </td>
                <td>{side(g, g.pm)}</td>
                <td>{side(g, g.ps)}</td>
                <td className="num">{g.oh ? `${g.oh.toFixed(2)} / ${g.oa.toFixed(2)}` : "not priced"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
