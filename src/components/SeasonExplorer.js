import { useMemo, useState } from "react";
import LineChart from "./LineChart";
import Src from "./Src";
import { MODELS, euro, isHit, pct, played, priced, shortDate } from "../lib/ledger";

// Two ways into the 2025-26 backtest: follow one team through its season, or change the betting rules and watch the
// bankroll. Everything is computed in the browser from the same per-game rows as the results table.

export default function SeasonExplorer({ games }) {
  const [tab, setTab] = useState("team");
  return (
    <div className="explorer">
      <div className="switch" role="group" aria-label="Explorer">
        <button type="button" aria-pressed={tab === "team"} onClick={() => setTab("team")}>
          Teams
        </button>
        <button type="button" aria-pressed={tab === "bet"} onClick={() => setTab("bet")}>
          Change the betting rules
        </button>
      </div>
      {tab === "team" ? <TeamView games={games} /> : <BetView games={games} />}
    </div>
  );
}

export function TeamView({ games, backtest = true }) {
  const done = useMemo(() => played(games), [games]);
  const [team, setTeam] = useState("BOS");
  const [model, setModel] = useState("pm");
  const [showAll, setShowAll] = useState(false);

  // A game counts for a model only if that model predicted it before tip-off: reconstructed games, and games that only
  // got their early prediction, are listed but not counted.
  const counts = (g, k) => g.r !== "reconstructed" && g.r !== "early" && g[k] != null;

  // Every team: all its games and real record, and how often the model called the counted ones right.
  const table = useMemo(() => {
    const t = {};
    for (const g of done) {
      for (const side of [g.h, g.a]) {
        const r = (t[side] ||= { team: side, n: 0, w: 0, hits: { pm: 0, ps: 0 }, m: { pm: 0, ps: 0 } });
        r.n++;
        if ((side === g.h) === (g.hw === 1)) r.w++;
        for (const k of ["pm", "ps"]) {
          if (!counts(g, k)) continue;
          r.m[k]++;
          if (isHit(g, k)) r.hits[k]++;
        }
      }
    }
    return Object.values(t);
  }, [done]);
  const share = (r) => (r.m[model] ? r.hits[model] / r.m[model] : 0);
  const ranked = [...table].sort((x, y) => share(y) - share(x) || x.team.localeCompare(y.team));

  const all = done.filter((g) => g.h === team || g.a === team);
  const rows = all.filter((g) => counts(g, model));
  const callOf = (g) =>
    counts(g, model) ? (isHit(g, model) ? "Right" : "Wrong") : g.r === "reconstructed" ? "Backtest" : g.r === "early" ? "Early only" : "Not predicted";
  const won = (g) => (g.h === team ? g.hw === 1 : g.hw === 0);
  const opp = (g) => (g.h === team ? g.a : g.h);
  const pTeam = (g) => (g.h === team ? g[model] : 1 - g[model]);
  const right = rows.filter((g) => isHit(g, model)).length;
  const predictedWins = rows.filter((g) => pTeam(g) >= 0.5).length;
  const record = [rows.filter(won).length, rows.filter((g) => !won(g)).length];
  const h2h = Object.values(
    all.reduce((acc, g) => {
      const o = opp(g);
      const r = (acc[o] ||= { opp: o, n: 0, w: 0, hits: 0, m: 0 });
      r.n++;
      if (won(g)) r.w++;
      if (counts(g, model)) {
        r.m++;
        if (isHit(g, model)) r.hits++;
      }
      return acc;
    }, {})
  ).sort((x, y) => y.n - x.n || x.opp.localeCompare(y.opp));
  const list = showAll ? [...all].reverse() : all.slice(-12).reverse();
  const allRecord = [all.filter(won).length, all.filter((g) => !won(g)).length];

  return (
    <div className="tv">
      <div className="tv-controls">
        <label>
          <span>Model</span>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            {Object.entries(MODELS).map(([k, m]) => (
              <option key={k} value={k}>
                {m.name}: {m.long}, {backtest && m.last !== "live" ? m.last : "pre-game"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <h3 className="tv-h">
        How well each team's games were called
        <Src kind={backtest ? MODELS[model].last : "live"} />
      </h3>
      <p className="note">Tap a team to follow it below. Sorted by the share of its games the {MODELS[model].name.toLowerCase()} model called right.</p>
      <ol className="tv-rank">
        {ranked.map((r) => {
          const sh = share(r);
          return (
            <li key={r.team}>
              <button type="button" className={r.team === team ? "on" : ""} aria-pressed={r.team === team} onClick={() => setTeam(r.team)}>
                <span className="tr-team">{r.team}</span>
                <span className="tr-bar">
                  <span style={{ width: `${sh * 100}%` }} />
                </span>
                <span className="tr-val">{r.m[model] ? `${r.hits[model]}/${r.m[model]}` : "none"}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="tv-focus" id="team-focus">
        <h3 className="tv-h">
          {team}, {all.length} {all.length === 1 ? "game" : "games"}, {rows.length} predicted before tip-off
        </h3>
        <ul className="tv-stats four">
          <li>
            <b>
              {allRecord[0]}-{allRecord[1]}
            </b>
            real record, all {all.length} games
          </li>
          <li>
            <b>{rows.length ? `${right}/${rows.length}` : "none"}</b>
            model record: games called right{rows.length ? `, ${pct(right / rows.length, 0)}` : ""}
          </li>
          <li>
            <b>
              {predictedWins}-{rows.length - predictedWins}
            </b>
            record the model predicted
          </li>
          <li>
            <b>
              {record[0]}-{record[1]}
            </b>
            real record in the predicted games
          </li>
        </ul>

        <p className="tv-sub">Last 10 games</p>
        <ol className="form">
          {all.slice(-10).map((g, i) => (
            <li key={i} className={won(g) ? "w" : "l"} title={`${shortDate(g.d)} ${g.h === team ? "vs" : "at"} ${opp(g)}`}>
              <span className="form-r">{won(g) ? "W" : "L"}</span>
              <span className="form-o">{opp(g)}</span>
              <span className={`form-c ${counts(g, model) ? (isHit(g, model) ? "ok" : "miss") : "nr"}`}>{callOf(g).toLowerCase()}</span>
            </li>
          ))}
        </ol>

        <div className="tv-strip" role="img" aria-label={`Win chance the model gave ${team} in each game, and the result`}>
          {all.filter((g) => g[model] != null).map((g, i) => (
            <span
              key={i}
              className={`tv-bar ${won(g) ? "w" : "l"}${counts(g, model) ? "" : " nr"}`}
              style={{ height: `${pTeam(g) * 100}%` }}
              title={`${shortDate(g.d)} ${g.h === team ? "vs" : "at"} ${opp(g)}: ${pct(pTeam(g), 0)}, ${won(g) ? "won" : "lost"}`}
            />
          ))}
        </div>
        <p className="note tv-legend">
          The whole season, one bar per game. Height is the win chance the model gave {team}; dark bars are wins, light
          bars losses. The dashed line is 50%.
        </p>

        <div className="tv-two">
          <table className="tv-table">
            <caption>Against each opponent</caption>
            <thead>
              <tr>
                <th scope="col">Opponent</th>
                <th scope="col" className="num">
                  Games
                </th>
                <th scope="col" className="num">
                  {team} W-L
                </th>
                <th scope="col" className="num">
                  Called right
                </th>
              </tr>
            </thead>
            <tbody>
              {h2h.map((r) => (
                <tr key={r.opp}>
                  <td>{r.opp}</td>
                  <td className="num">{r.n}</td>
                  <td className="num">
                    {r.w}-{r.n - r.w}
                  </td>
                  <td className="num">{r.m ? `${r.hits}/${r.m}` : "none"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className="tv-table">
            <caption>{showAll ? `All ${rows.length} games` : "Last 12 games"}</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Opponent</th>
                <th scope="col" className="num">
                  Win chance
                </th>
                <th scope="col">Result</th>
                <th scope="col">Call</th>
              </tr>
            </thead>
            <tbody>
              {list.map((g, i) => (
                <tr key={i}>
                  <td>{shortDate(g.d)}</td>
                  <td>
                    {g.h === team ? "vs" : "at"} {opp(g)}
                  </td>
                  <td className="num">{g[model] != null ? pct(pTeam(g), 0) : "n/a"}</td>
                  <td>
                    {won(g) ? "Won" : "Lost"}
                    {g.hs != null && ` ${g.h === team ? g.hs : g.as}-${g.h === team ? g.as : g.hs}`}
                  </td>
                  <td className={counts(g, model) ? (isHit(g, model) ? "ok" : "miss") : "nr"}>{callOf(g)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="link-button" onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Show the last 12 only" : `Show all ${all.length} games`}
        </button>
      </div>
    </div>
  );
}

// Bets on the side the model rates above the price, when its edge clears the threshold.
function simulate(games, key, { stake, fraction, minEdge }) {
  let bank = 100, peak = 100, worst = 0, bets = 0, wins = 0, staked = 0;
  const path = [];
  for (const g of games) {
    const p = g[key];
    if (p == null) {
      path.push(bank);
      continue;
    }
    const evH = p * g.oh - 1, evA = (1 - p) * g.oa - 1;
    const home = evH >= evA;
    const edge = home ? evH : evA;
    if (edge > minEdge) {
      const price = home ? g.oh : g.oa;
      const amount = stake === "flat" ? 1 : (bank * fraction * edge) / (price - 1);
      const won = home ? g.hw === 1 : g.hw === 0;
      bank += won ? amount * (price - 1) : -amount;
      staked += amount;
      bets++;
      if (won) wins++;
      peak = Math.max(peak, bank);
      worst = Math.max(worst, 1 - bank / peak);
    }
    path.push(bank);
  }
  return { path, bank, bets, wins, staked, worst };
}

export function BetView({ games }) {
  const withPrice = useMemo(() => priced(games), [games]);
  const [stake, setStake] = useState("kelly");
  const [fraction, setFraction] = useState(0.25);
  const [minEdge, setMinEdge] = useState(0);

  const runs = Object.keys(MODELS).map((k) => ({ k, ...simulate(withPrice, k, { stake, fraction, minEdge }) }));

  return (
    <div className="bv">
      <div className="bv-controls">
        <label>
          <span>Stake</span>
          <select value={stake} onChange={(e) => setStake(e.target.value)}>
            <option value="kelly">Kelly fraction of the bankroll</option>
            <option value="flat">€1 per bet</option>
          </select>
        </label>
        {stake === "kelly" && (
          <label>
            <span>Kelly fraction: {fraction.toFixed(2)}</span>
            <input type="range" min="0.05" max="1" step="0.05" value={fraction} onChange={(e) => setFraction(+e.target.value)} />
          </label>
        )}
        <label>
          <span>Only bet when the edge is above {pct(minEdge, 0)}</span>
          <input type="range" min="0" max="0.2" step="0.01" value={minEdge} onChange={(e) => setMinEdge(+e.target.value)} />
        </label>
      </div>

      <ul className="tv-stats">
        {runs.map((r) => (
          <li key={r.k}>
            <b className={r.bank < 100 ? "down" : ""}>{euro(r.bank)}</b>
            {MODELS[r.k].name}: {r.bets} bets, {r.bets ? pct(r.wins / r.bets, 0) : "no"} won, worst drop {pct(r.worst, 0)}
          </li>
        ))}
      </ul>

      {withPrice.length > 1 && (
        <LineChart
          title="Bankroll from €100, game by game"
          dates={withPrice.map((g) => g.d)}
          base={100}
          format={(v) => `€${v.toFixed(0)}`}
          series={runs.map((r) => ({ label: MODELS[r.k].name, values: r.path, className: r.k }))}
        />
      )}
      <p className="note">
        {withPrice.length} games with a stored price, {shortDate(withPrice[0].d)} to {shortDate(withPrice[withPrice.length - 1].d)}.
        The edge is how much the model's probability times the price exceeds 1. A few settings end a euro or two above
        €100, all at the smallest Kelly fractions; over 680 games that is noise, not an edge. The prices already knew most
        of what the models know.
      </p>
    </div>
  );
}
