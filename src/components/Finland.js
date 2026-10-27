import { useEffect, useState } from "react";
import Src from "./Src";
import useJson, { LIVE_DATA, NBA_LIVE } from "../lib/useJson";
import { pct, shortDate } from "../lib/ledger";

// Four leagues to choose from. Korisliiga and both I divisioona groups share one rating pool (so a promoted team
// keeps its rating); the II divisioona is its own model, learning from every region, shown for the southern group.
const LEAGUES = [
  ["KL", "Korisliiga", "national"],
  ["I-A", "I divisioona A", "national"],
  ["I-B", "I divisioona B", "national"],
  ["M2D", "II divisioona South", "m2d"],
];

const fixtureDate = (w) => {
  const d = new Date(w.replace(" ", "T"));
  return `${d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} ${w.slice(11, 16)}`;
};

// The prediction log, appended by the daily run and never rewritten: each game once when it first appears (early) and
// again on the morning of the game (gameday). A game's live prediction is the latest one logged before tip-off.
// Tip-off is Finnish time; reading it as UTC+3 errs early in winter.
const loggedBeforeTip = (r) => new Date(r.predicted_at) < new Date(`${r.when.replace(" ", "T")}:00+03:00`);

function usePredictionLog() {
  const [log, setLog] = useState(null);
  useEffect(() => {
    const get = (url) => {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 8000);
      return fetch(url, { signal: ctl.signal })
        .then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.status))))
        .finally(() => clearTimeout(timer));
    };
    get(`${NBA_LIVE}/finland_predictions.jsonl`)
      .catch(() => get(`${LIVE_DATA}/finland_predictions.jsonl`))
      .then((t) => {
        const byGame = new Map();
        for (const line of t.split("\n")) {
          if (!line.trim()) continue;
          const r = JSON.parse(line);
          const key = `${r.when}|${r.home}|${r.away}`;
          if (!loggedBeforeTip(r)) continue;
          const prev = byGame.get(key);
          if (!prev || r.predicted_at > prev.predicted_at) byGame.set(key, r);
        }
        setLog(byGame);
      })
      .catch(() => setLog(new Map()));
  }, []);
  return log;
}

const dayMonth = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export default function Finland() {
  const data = useJson(`${NBA_LIVE}/finland.json`, `${LIVE_DATA}/finland.json`, "/data/finland.json");
  const log = usePredictionLog();
  const [code, setCode] = useState("KL");
  const [team, setTeam] = useState(null);
  const [sortBy, setSortBy] = useState("rating");
  const [allGames, setAllGames] = useState(false);
  const [gameTeam, setGameTeam] = useState("");

  if (!data) return <p className="note">Loading the Finnish fixtures.</p>;
  if (data.error) return <p className="note">The Finnish fixtures could not be loaded.</p>;

  const [, name, poolKey] = LEAGUES.find((l) => l[0] === code);
  const p = data.pools[poolKey];
  const ratings = p.ratings.filter((r) => r.league === code);
  const winPct = (r) => (r.won + r.lost ? r.won / (r.won + r.lost) : 0);
  const shown = sortBy === "rating" ? ratings : [...ratings].sort((a, b) => winPct(b) - winPct(a) || b.won - a.won || b.rating - a.rating);
  const inLeague = new Set(ratings.map((r) => r.team));
  const next = p.upcoming.filter((u) => u.league === code).slice(0, 8);
  const test = code === "M2D" ? p.region_test || p.metrics.test : p.by_league_test?.[code];

  // A team's game as logged before tip-off, if it was.
  const logged = (name, g) => log?.get(g.venue === "home" ? `${g.when}|${name}|${g.opp}` : `${g.when}|${g.opp}|${name}`);
  const liveCall = (name, g) => {
    const r = logged(name, g);
    if (!r) return null;
    const pWin = g.venue === "home" ? r.p_home : 1 - r.p_home;
    return { pWin, correct: (pWin >= 0.5) === g.won };
  };

  // This season, each league game once from the teams' records: the replay (today's model run over the season) and,
  // separately, the games that were logged before tip-off.
  const seen = new Set();
  let played = 0, right = 0, livePlayed = 0, liveRight = 0;
  const games = [];
  for (const r of ratings) {
    for (const g of p.teams?.[r.team]?.games || []) {
      if (!inLeague.has(g.opp)) continue;
      const key = [g.when, ...[r.team, g.opp].sort()].join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      played++;
      if (g.correct) right++;
      const home = g.venue === "home";
      const [mine, theirs] = (g.score || "-").split("-");
      const entry = logged(r.team, g);
      games.push({
        when: g.when,
        home: home ? r.team : g.opp,
        away: home ? g.opp : r.team,
        hs: home ? mine : theirs,
        as: home ? theirs : mine,
        homeWon: home ? g.won : !g.won,
        replay: home ? g.p_win : 1 - g.p_win,
        live: entry ? { p: entry.p_home, kind: entry.kind || "early" } : null,
      });
      const c = liveCall(r.team, g);
      if (c) {
        livePlayed++;
        if (c.correct) liveRight++;
      }
    }
  }
  const leagueLog = log ? [...log.values()].filter((r) => r.league === code) : [];
  const logStart = leagueLog.length ? leagueLog.reduce((a, r) => (r.predicted_at < a ? r.predicted_at : a), leagueLog[0].predicted_at) : null;

  games.sort((x, y) => y.when.localeCompare(x.when));
  const lastDay = games.length ? games[0].when.slice(0, 10) : null;
  const lastRound = games.filter((g) => g.when.slice(0, 10) === lastDay);
  const listed = games.filter((g) => !gameTeam || g.home === gameTeam || g.away === gameTeam);

  const pick = team && inLeague.has(team) && p.teams?.[team] ? team : ratings[0]?.team;
  const t = p.teams?.[pick];
  const rec = ratings.find((r) => r.team === pick);
  const rank = ratings.findIndex((r) => r.team === pick) + 1;

  return (
    <div className="fin">
      <div className="switch fin-leagues" role="group" aria-label="League">
        {LEAGUES.map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={code === key}
            onClick={() => {
              setCode(key);
              setTeam(null);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="fin-summary fin-summary-list">
        <li>
          <Src kind="live" lead />
          {!log ? (
            "Loading the prediction log."
          ) : !leagueLog.length ? (
            "No logged predictions for this league yet."
          ) : livePlayed ? (
            <span>
              <b>
                {liveRight} of {livePlayed}
              </b>{" "}
              called right since logging began on {dayMonth(logStart)}, {leagueLog.length} games logged in all.
            </span>
          ) : (
            <span>
              Logging began on {dayMonth(logStart)}: {leagueLog.length} games logged, none played yet.
            </span>
          )}
        </li>
        {played > 0 && (
          <li>
            <Src kind="backtest" lead />
            <span>
              This season replayed: {right} of {played}, rerun each morning with the current model.
            </span>
          </li>
        )}
        {test && (
          <li>
            <Src kind="backtest" lead />
            <span>
              2025-26: <b>{pct(test.accuracy)}</b> of {test.n} {name} games called right.
            </span>
          </li>
        )}
      </ul>

      {lastRound.length > 0 && (
        <div className="fin-round">
          <h3 className="tv-h">Last round, {fiDate(lastDay)}</h3>
          <FinGames games={lastRound} />
        </div>
      )}

      <div className="tv-two fin-two">
        <table className="tv-table">
          <caption>
            Ratings <span className="cap-note">sorted by {sortBy === "rating" ? "rating" : "record"}; tap W-L or Rating to change</span>
          </caption>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Team</th>
              <th scope="col" className="num" aria-sort={sortBy === "record" ? "descending" : "none"}>
                <button type="button" className={`th-sort${sortBy === "record" ? " on" : ""}`} onClick={() => setSortBy("record")}>
                  W-L
                </button>
              </th>
              <th scope="col" className="num" aria-sort={sortBy === "rating" ? "descending" : "none"}>
                <button type="button" className={`th-sort${sortBy === "rating" ? " on" : ""}`} onClick={() => setSortBy("rating")}>
                  Rating
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={r.team} className={r.team === pick ? "on" : ""}>
                <td>{i + 1}</td>
                <td>
                  <button type="button" className="fin-team-btn" onClick={() => setTeam(r.team)}>
                    {r.team}
                  </button>
                </td>
                <td className="num">
                  {r.won}-{r.lost}
                </td>
                <td className="num">{r.rating > 0 ? `+${r.rating.toFixed(1)}` : r.rating.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {next.length > 0 ? (
          <table className="fixtures">
            <caption>
              Next games <span className="cap-note">final prediction on game day, around 11:00</span>
            </caption>
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">Home</th>
                <th scope="col" className="num">
                  Home win
                </th>
                <th scope="col">Away</th>
              </tr>
            </thead>
            <tbody>
              {next.map((f) => (
                <tr key={f.when + f.home}>
                  <td className="mono">{fixtureDate(f.when)}</td>
                  <td className={f.p_home >= 0.5 ? "fav" : ""}>{f.home}</td>
                  <td className="num">{pct(f.p_home, 0)}</td>
                  <td className={f.p_home < 0.5 ? "fav" : ""}>{f.away}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="note">No {name} games in the next three weeks.</p>
        )}
      </div>

      {t && rec && (
        <div className="fin-team">
          <h3 className="tv-h">
            {pick}, rated {rank} of {ratings.length}
          </h3>
          <p className="note">Pick a team in the ratings table to follow it.</p>
          <ul className="tv-stats">
            <li>
              <b>
                {rec.won}-{rec.lost}
              </b>
              record this season
            </li>
            <li>
              <b>{rec.rating > 0 ? `+${rec.rating.toFixed(1)}` : rec.rating.toFixed(1)}</b>
              expected points against an average team
            </li>
            <li>
              <b>
                {t.games.length
                  ? `${t.games.filter((g) => { const c = liveCall(pick, g); return c ? c.correct : g.correct; }).length}/${t.games.length}`
                  : "none yet"}
              </b>
              of its games called right, pre-game where logged
            </li>
          </ul>
          <div className="tv-two">
            <table className="tv-table">
              <caption>Played: replayed, unless marked pre-game</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Opponent</th>
                  <th scope="col" className="num">
                    Win chance
                  </th>
                  <th scope="col">Score</th>
                </tr>
              </thead>
              <tbody>
                {[...t.games].reverse().map((g) => {
                  const c = liveCall(pick, g);
                  return (
                  <tr key={g.when}>
                    <td>{fixtureDate(g.when).slice(0, -6)}</td>
                    <td>
                      {g.venue === "home" ? "vs" : "at"} {g.opp}
                    </td>
                    <td className="num">
                      {pct(c ? c.pWin : g.p_win, 0)}
                      {c && <Src kind="live" />}
                    </td>
                    <td className={g.won ? "ok" : "miss"}>
                      {g.won ? "W" : "L"} {g.score}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            <table className="tv-table">
              <caption>Next</caption>
              <thead>
                <tr>
                  <th scope="col">When</th>
                  <th scope="col">Opponent</th>
                  <th scope="col" className="num">
                    Win chance
                  </th>
                </tr>
              </thead>
              <tbody>
                {t.next.length ? (
                  t.next.map((g) => (
                    <tr key={g.when}>
                      <td>{fixtureDate(g.when)}</td>
                      <td>
                        {g.venue === "home" ? "vs" : "at"} {g.opp}
                      </td>
                      <td className="num">{pct(g.p_win, 0)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No games in the next three weeks.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="drawers">
        <button type="button" className="drawer-btn" aria-expanded={allGames} onClick={() => setAllGames(!allGames)}>
          Every {name} game this season
        </button>
      </div>
      {allGames && (
        <div className="drawer">
          <div className="gl-controls">
            <label>
              <span>Team</span>
              <select value={gameTeam} onChange={(e) => setGameTeam(e.target.value)}>
                <option value="">All teams</option>
                {[...inLeague].sort().map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <FinGames games={listed} withDate />
        </div>
      )}

      <p className="note">
        Ratings move with each final score. Updated {shortDate(data.generated_at.slice(0, 10))} {data.generated_at.slice(0, 4)}. There are no betting prices for
        these leagues in any open data source, so nothing here is compared with a bookmaker.
      </p>
    </div>
  );
}

const fiDate = (d) => new Date(`${d}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

// Played games: score, the chance the model gave the home team, whether it was right, and where the chance comes
// from: the prediction stored before tip-off (pre-game) or today's model replayed over the season (backtest).
function FinGames({ games, withDate = false }) {
  if (!games.length) return <p className="note">No games played yet.</p>;
  return (
    <div className="fin-games">
      {games.map((g) => {
        const p = g.live ? g.live.p : g.replay;
        const hit = (p >= 0.5) === g.homeWon;
        return (
          <div key={g.when + g.home} className="fin-game">
            {withDate && <span className="fg-date">{fiDate(g.when.slice(0, 10))}</span>}
            <span className="fg-match">
              <span className={g.homeWon ? "" : "win"}>{g.away}</span> <span className="gl-score">{g.as}</span>
              <span className="gl-at"> at </span>
              <span className={g.homeWon ? "win" : ""}>{g.home}</span> <span className="gl-score">{g.hs}</span>
            </span>
            <span className="fg-call">
              {p >= 0.5 ? g.home : g.away} {Math.round(Math.max(p, 1 - p) * 100)}%
              <span className={`gl-mark ${hit ? "ok" : "miss"}`}>{hit ? "✓" : "✗"}</span>
            </span>
            <span className="fg-src">
              <Src kind={g.live ? "live" : "backtest"} lead />
              {g.live ? (g.live.kind === "gameday" ? "game day" : "early") : "replay"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
