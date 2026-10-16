import { useMemo, useState } from "react";
import { isHit, marketP, monthName, pct, shortDate } from "../lib/ledger";

// Every game as one mark, grouped by month, the way a scorer tallies a season.
// Light: the model's pick won. Dark: it lost. Outline: not played yet.
export default function Tally({ games, modelKey }) {
  const [active, setActive] = useState(null);

  const months = useMemo(() => {
    const out = [];
    games.forEach((g, i) => {
      const key = g.d.slice(0, 7);
      if (!out.length || out[out.length - 1].key !== key) out.push({ key, name: monthName(g.d), games: [] });
      out[out.length - 1].games.push(i);
    });
    return out;
  }, [games]);

  const g = active == null ? null : games[active];
  const onOver = (e) => {
    const i = e.target.dataset?.i;
    if (i != null) setActive(Number(i));
  };

  return (
    <div className="tally">
      <div className="tally-months" onMouseOver={onOver} onMouseLeave={() => setActive(null)}>
        {months.map((m) => {
          const done = m.games.filter((i) => games[i].hw != null);
          const hits = done.filter((i) => isHit(games[i], modelKey)).length;
          return (
            <div className="tally-month" key={m.key}>
              <p className="tally-head">
                <b>{m.name}</b> {done.length ? `${hits}/${done.length}` : `${m.games.length} to play`}
              </p>
              <div className="tally-marks">
                {m.games.map((i) => {
                  const r = games[i];
                  const state = r.hw == null ? "open" : isHit(r, modelKey) ? "hit" : "miss";
                  return <span key={i} data-i={i} className={`mark ${state}${active === i ? " on" : ""}`} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
      <p className="tally-readout" aria-live="polite">
        {g ? <GameLine g={g} modelKey={modelKey} /> : "Point at a square to see the game."}
      </p>
    </div>
  );
}

function GameLine({ g, modelKey }) {
  const p = g[modelKey];
  const pick = p >= 0.5 ? g.h : g.a;
  const pickP = p >= 0.5 ? p : 1 - p;
  const result = g.hw == null ? "not played yet" : `${g.hw === 1 ? g.h : g.a} won`;
  const market = g.oh ? `, market ${pct(p >= 0.5 ? marketP(g) : 1 - marketP(g), 0)}` : "";
  return (
    <>
      <b>{shortDate(g.d)}</b> {g.a} at {g.h}. Picked {pick} at {pct(pickP, 0)}
      {market}. {result}.
    </>
  );
}
