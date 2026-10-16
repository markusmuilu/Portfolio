import { useState } from "react";
import useJson from "../lib/useJson";
import { pct } from "../lib/ledger";

const POOLS = [
  ["national", "Korisliiga and I divisioona"],
  ["m2d", "II divisioona, Eteläinen"],
];

const fixtureDate = (w) => {
  const d = new Date(w.replace(" ", "T"));
  return `${d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} ${w.slice(11, 16)}`;
};

// The Finnish men's leagues: team ratings from the federation's results service, the next fixtures with win chances,
// and one team followed through its season. The II divisioona model learns from every region; the page shows the
// southern group only.
export default function Finland() {
  const data = useJson("/data/finland.json");
  const [pool, setPool] = useState("national");
  const [team, setTeam] = useState(null);

  if (!data) return <p className="note">Loading the Finnish fixtures.</p>;
  if (data.error) return <p className="note">The Finnish fixtures could not be loaded.</p>;

  const p = data.pools[pool];
  const test = p.region_test || p.metrics.test;
  const sofar = p.season_so_far;
  const next = p.upcoming.slice(0, 8);
  const league = (code) => data.league_names[code] || code;
  const pick = team && p.teams?.[team] ? team : p.ratings[0]?.team;
  const t = p.teams?.[pick];
  const rank = p.ratings.findIndex((r) => r.team === pick) + 1;
  const rec = p.ratings.find((r) => r.team === pick);

  return (
    <div className="fin">
      <div className="switch" role="group" aria-label="League">
        {POOLS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={pool === key}
            onClick={() => {
              setPool(key);
              setTeam(null);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="fin-summary">
        On the 2025-26 season it called <b>{pct(test.accuracy)}</b> of {test.n} {p.region ? "southern group " : ""}games
        right.
        {!p.region && <> Picking the team with the better record so far called {pct(p.baseline_test.record_pick_accuracy)}.</>}
        {sofar.games > 0 && (
          <>
            {" "}
            This season so far: {sofar.correct} of {sofar.games}.
          </>
        )}
      </p>

      {next.length > 0 ? (
        <table className="fixtures">
          <caption>Next games</caption>
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
                <td className="mono">
                  {fixtureDate(f.when)}
                  <span className="lg">{league(f.league)}</span>
                </td>
                <td className={f.p_home >= 0.5 ? "fav" : ""}>{f.home}</td>
                <td className="num">{pct(f.p_home, 0)}</td>
                <td className={f.p_home < 0.5 ? "fav" : ""}>{f.away}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="note">No games in the next three weeks.</p>
      )}

      {t && (
        <div className="fin-team">
          <label className="fin-pick">
            <span>Follow a team</span>
            <select value={pick} onChange={(e) => setTeam(e.target.value)}>
              {p.ratings.map((r) => (
                <option key={r.team} value={r.team}>
                  {r.team}
                </option>
              ))}
            </select>
          </label>
          <ul className="tv-stats">
            <li>
              <b>
                {rank} / {p.ratings.length}
              </b>
              rating rank {p.region ? "in the southern group" : "across the three leagues"}
            </li>
            <li>
              <b>
                {rec.won}-{rec.lost}
              </b>
              record this season
            </li>
            <li>
              <b>{t.games.length ? `${t.games.filter((g) => g.correct).length}/${t.games.length}` : "none yet"}</b>
              of its games called right
            </li>
          </ul>
          <div className="tv-two">
            <table className="tv-table">
              <caption>Played</caption>
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
                {[...t.games].reverse().map((g) => (
                  <tr key={g.when}>
                    <td>{fixtureDate(g.when).slice(0, -6)}</td>
                    <td>
                      {g.venue === "home" ? "vs" : "at"} {g.opp}
                    </td>
                    <td className="num">{pct(g.p_win, 0)}</td>
                    <td className={g.won ? "ok" : "miss"}>
                      {g.won ? "W" : "L"} {g.score}
                    </td>
                  </tr>
                ))}
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

      <p className="note">
        Ratings move with each final score. Updated {data.generated_at.slice(0, 10)}. There are no betting prices for
        these leagues, so nothing here is compared with a market.
      </p>
    </div>
  );
}
