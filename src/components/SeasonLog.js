import { useMemo, useState } from "react";
import Src from "./Src";
import { MODELS, isHit, pct } from "../lib/ledger";

// The season game by game, as the old Power BI report and the Streamlit app showed it: the games coming up with each
// model's pick, and every played game with its score and whether each model called it.
//   games:    { d, t, h, a, hw, hs, as, pm, ps, oh, oa, pa, xo }   (see lib/ledger.js; hs/as scores, pa predicted at,
//             xo [home, away] players removed as out). Last season's backtest rows have no t, scores, pa or xo.
//   schedule: { d, t, h, a } games not predicted yet

const fiTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Helsinki" });
const fiDay = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/Helsinki" });
const usDay = (d) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

const pick = (g, key, home = g.h, away = g.a) =>
  g[key] == null ? null : g[key] >= 0.5 ? { team: home, p: g[key] } : { team: away, p: 1 - g[key] };

function groupBy(rows, key) {
  const out = [];
  for (const r of rows) {
    const k = key(r);
    if (!out.length || out[out.length - 1].key !== k) out.push({ key: k, rows: [] });
    out[out.length - 1].rows.push(r);
  }
  return out;
}

function Pick({ g, k, played }) {
  const p = pick(g, k);
  if (!p) return <span className="na">n/a</span>;
  const hit = played ? isHit(g, k) : null;
  return (
    <span className={`gl-pick${hit === true ? " ok" : hit === false ? " miss" : ""}`}>
      {p.team} {pct(p.p, 0)}
      {hit != null && <span className="gl-mark" aria-label={hit ? "called right" : "called wrong"}>{hit ? "✓" : "✗"}</span>}
    </span>
  );
}

// Games coming up: predicted ones with both picks and the price, the rest with the time their prediction is due.
export function NextGames({ games, schedule = [], firstDayOnly = false }) {
  const [all, setAll] = useState(!firstDayOnly);
  const now = Date.now();
  const rows = [
    ...games.filter((g) => g.hw == null && g.t && new Date(g.t).getTime() > now - 3 * 3600e3),
    ...schedule.filter((g) => new Date(g.t).getTime() > now),
  ].sort((x, y) => x.t.localeCompare(y.t));
  if (!rows.length) return <p className="note">No games in the next three days.</p>;
  const days = groupBy(rows, (g) => fiDay(g.t));
  return (
    <div className="gl">
      <div className="gl-legend">
        <span>
          Each game is predicted twice: early, once both teams have played their previous game, and final, 60 to 75
          minutes before tip-off after the injury report. The record counts the final one. Times are Finnish time.
        </span>
      </div>
      {(all ? days : days.slice(0, 1)).map((day) => (
        <section key={day.key} className="gl-day">
          <h4>{day.key}</h4>
          {day.rows.map((g) => (
            <div key={g.t + g.h} className={`gl-row next${g.pm == null ? " waiting" : ""}`}>
              <span className="gl-time">{fiTime(g.t)}</span>
              <span className="gl-game">
                {g.a} at {g.h}
                {g.pm != null && (
                  <span className={`gl-round ${g.r === "early" ? "early" : "final"}`}>
                    {g.r === "early" ? `early, final by ${fiTime(new Date(new Date(g.t).getTime() - 3600e3).toISOString())}` : "final"}
                  </span>
                )}
              </span>
              {g.pm == null ? (
                <span className="gl-due">
                  Early prediction once both teams have played their previous game; final by{" "}
                  {fiTime(new Date(new Date(g.t).getTime() - 3600e3).toISOString())}
                </span>
              ) : (
                <>
                  <span className="gl-cell">
                    <small>Main</small>
                    <Pick g={g} k="pm" />
                  </span>
                  <span className="gl-cell">
                    <small>Shadow</small>
                    <Pick g={g} k="ps" />
                  </span>
                  <span className="gl-cell gl-price">
                    <small>Price away / home</small>
                    {g.oh ? `${g.oa.toFixed(2)} / ${g.oh.toFixed(2)}` : "none"}
                  </span>
                </>
              )}
            </div>
          ))}
        </section>
      ))}
      {days.length > 1 && (
        <button type="button" className="btn quiet gl-more" onClick={() => setAll(!all)}>
          {all ? "Show only the next game day" : `Show the next ${days.length} game days`}
        </button>
      )}
    </div>
  );
}

// One played game: score, both picks with right or wrong, price, and anything that makes it not count.
function PlayedRow({ g }) {
  const out = (g.xo || []).flat();
  return (
    <div className={`gl-row${g.r === "reconstructed" ? " recon" : ""}`}>
      <span className="gl-game">
        <span className={g.hw === 0 ? "win" : ""}>{g.a}</span>
        {g.as != null && <span className="gl-score">{g.as}</span>}
        <span className="gl-at">at</span>
        <span className={g.hw === 1 ? "win" : ""}>{g.h}</span>
        {g.hs != null && <span className="gl-score">{g.hs}</span>}
        {g.r === "reconstructed" && <Src kind="backtest" />}
      </span>
      <span className="gl-cell">
        <small>Main</small>
        <Pick g={g} k="pm" played />
      </span>
      <span className="gl-cell">
        <small>Shadow</small>
        <Pick g={g} k="ps" played />
      </span>
      <span className="gl-cell gl-price">
        <small>Price away / home</small>
        {g.oh ? `${g.oa.toFixed(2)} / ${g.oh.toFixed(2)}` : "none"}
      </span>
      {g.early && (
        <span className="gl-out">
          Early prediction: Main {pick(g.early, "pm", g.h, g.a).team} {pct(pick(g.early, "pm", g.h, g.a).p, 0)}
          {g.early.ps != null && `, Shadow ${pick(g.early, "ps", g.h, g.a).team} ${pct(pick(g.early, "ps", g.h, g.a).p, 0)}`}
        </span>
      )}
      {g.r === "early" && (
        <span className="gl-out">Only the early prediction was made; the final one was missed, so this game is not in the record.</span>
      )}
      {out.length > 0 && <span className="gl-out">Ruled out before the prediction: {out.join(", ")}</span>}
    </div>
  );
}

// Shown once above a day that has reconstructed games.
function ReconNote({ rows }) {
  if (!rows.some((g) => g.r === "reconstructed")) return null;
  return (
    <p className="gl-recon">
      <Src kind="backtest" lead />
      Not predicted before tip-off: the prediction loop ran out of memory. Computed on 22 October from the history
      before these games, without that day's injury list or prices, and not counted in the record.
    </p>
  );
}

// The most recent game day with results, as it finished.
export function LastNight({ games }) {
  const done = games.filter((g) => g.hw === 0 || g.hw === 1);
  if (!done.length) return null;
  const day = done.reduce((m, g) => (g.d > m ? g.d : m), done[0].d);
  const rows = done.filter((g) => g.d === day);
  const counted = rows.filter((g) => g.r !== "reconstructed" && g.r !== "early");
  const right = (k) => counted.filter((g) => g[k] != null && isHit(g, k)).length;
  return (
    <div className="gl">
      <p className="gl-legend">
        {usDay(day)}, US date.{" "}
        {counted.length > 0
          ? `Main ${right("pm")} of ${counted.length} right, Shadow ${right("ps")} of ${counted.filter((g) => g.ps != null).length}.`
          : "None of these games is in the record."}
      </p>
      <section className="gl-day">
        <ReconNote rows={rows} />
        {rows.map((g) => (
          <PlayedRow key={g.d + g.h} g={g} />
        ))}
      </section>
    </div>
  );
}

// Every played game, newest first, by day: score, both picks with right or wrong, the price, and who was ruled out.
export function GameLog({ games, perPage = 7 }) {
  const [team, setTeam] = useState("");
  const [disagree, setDisagree] = useState(false);
  const [days, setDays] = useState(perPage);
  const teams = useMemo(() => [...new Set(games.flatMap((g) => [g.h, g.a]))].sort(), [games]);
  const rows = games
    .filter((g) => g.hw === 0 || g.hw === 1)
    .filter((g) => !team || g.h === team || g.a === team)
    .filter((g) => !disagree || (g.pm >= 0.5) !== (g.ps >= 0.5))
    .slice()
    .reverse();
  const groups = groupBy(rows, (g) => g.d);
  // Games outside the record (reconstructed, or only the early prediction) are listed but not counted.
  const right = (k) => rows.filter((g) => g.r !== "reconstructed" && g.r !== "early" && g[k] != null && isHit(g, k)).length;

  return (
    <div className="gl">
      <div className="gl-controls">
        <label>
          <span>Team</span>
          <select value={team} onChange={(e) => setTeam(e.target.value)}>
            <option value="">All teams</option>
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="gl-check">
          <input type="checkbox" checked={disagree} onChange={(e) => setDisagree(e.target.checked)} />
          Only games where the models disagreed
        </label>
        {rows.length > 0 && (
          <p className="gl-count">
            {rows.length} {rows.length === 1 ? "game" : "games"}: {MODELS.pm.name} {right("pm")} right, {MODELS.ps.name}{" "}
            {right("ps")} right
          </p>
        )}
      </div>
      {!rows.length && <p className="note">No played games match.</p>}
      {groups.slice(0, days).map((day) => (
        <section key={day.key} className="gl-day">
          <h4>{usDay(day.key)}</h4>
          <ReconNote rows={day.rows} />
          {day.rows.map((g) => (
            <PlayedRow key={g.d + g.h} g={g} />
          ))}
        </section>
      ))}
      {groups.length > days && (
        <button type="button" className="btn quiet gl-more" onClick={() => setDays(days + perPage)}>
          Show {Math.min(perPage, groups.length - days)} more days
        </button>
      )}
    </div>
  );
}
