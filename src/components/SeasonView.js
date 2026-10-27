import { useMemo } from "react";
import LineChart from "./LineChart";
import Src from "./Src";
import { BetView } from "./SeasonExplorer";
import { MODELS, euro, f1, flatLedger, isHit, kellyLedger, marketP, pct, played, priced, quality, shortDate, signedPct } from "../lib/ledger";

// A season at a glance and, behind drawers, in depth. The same component serves 2026-27 (both models pre-game) and
// 2025-26 (main model a backtest, regression pre-game). games: the rows that count in the record.

const kindOf = (key, backtest) => (backtest ? MODELS[key].last : "live");

function Card({ title, sub, kind, q, n, of, ll, f, note }) {
  return (
    <div className="sv-card">
      <p className="sv-name">
        {title}
        {kind && <Src kind={kind} />}
      </p>
      <p className="sv-sub">{sub}</p>
      <p className="sv-big">{q == null ? "n/a" : pct(q)}</p>
      <p className="sv-of">{n == null ? "no games yet" : `${n} of ${of} called right`}</p>
      <dl className="sv-metrics">
        <div>
          <dt>Log loss</dt>
          <dd>{ll == null ? "n/a" : ll.toFixed(3)}</dd>
        </div>
        <div>
          <dt>F1</dt>
          <dd>{f == null ? "n/a" : f.toFixed(3)}</dd>
        </div>
      </dl>
      {note && <p className="sv-note">{note}</p>}
    </div>
  );
}

export function SeasonCards({ games, backtest }) {
  const s = useMemo(() => {
    const done = played(games);
    const withPrice = priced(games);
    const model = (key) => {
      const d = done.filter((g) => g[key] != null);
      if (!d.length) return null;
      const q = quality(d, (g) => g[key]);
      return { n: d.length, right: d.filter((g) => isHit(g, key)).length, q, f: f1(d, (g) => g[key]) };
    };
    const both = done.filter((g) => g.pm != null && g.ps != null);
    const split = both.filter((g) => (g.pm >= 0.5) !== (g.ps >= 0.5));
    return {
      done,
      withPrice,
      pm: model("pm"),
      ps: model("ps"),
      market: withPrice.length
        ? { q: quality(withPrice, marketP), right: withPrice.filter((g) => (marketP(g) >= 0.5) === (g.hw === 1)).length, f: f1(withPrice, marketP) }
        : null,
      home: done.length ? { right: done.filter((g) => g.hw === 1).length, f: f1(done, () => 1) } : null,
      both: both.length,
      split: split.length,
      splitMain: split.filter((g) => isHit(g, "pm")).length,
    };
  }, [games]);

  if (!s.done.length) return <p className="note">No games played yet.</p>;
  return (
    <div className="sv">
      <div className="sv-cards">
        {["pm", "ps"].map((k) => (
          <Card
            key={k}
            title={MODELS[k].name}
            sub={MODELS[k].long}
            kind={kindOf(k, backtest)}
            q={s[k]?.q.accuracy}
            n={s[k]?.right}
            of={s[k]?.n}
            ll={s[k]?.q.logLoss}
            f={s[k]?.f}
          />
        ))}
        <Card
          title="Market"
          sub="the bookmaker's favourite"
          q={s.market?.q.accuracy}
          n={s.market?.right}
          of={s.withPrice.length}
          ll={s.market?.q.logLoss}
          f={s.market?.f}
          note={s.market ? `On the ${s.withPrice.length} games with a stored price.` : "No stored prices yet."}
        />
        <Card
          title="Always home"
          sub="pick the home team every time"
          q={s.home ? s.home.right / s.done.length : null}
          n={s.home?.right}
          of={s.done.length}
          f={s.home?.f}
          note="The floor every model has to beat."
        />
      </div>
      {s.both > 0 && (
        <p className="sv-compare">
          On the {s.both} games both models predicted, they disagreed on <b>{s.split}</b>
          {s.split > 0 && (
            <>
              , and the main model was right in <b>{s.splitMain}</b> of those
            </>
          )}
          .
        </p>
      )}
      <RunningAccuracy games={s.done} backtest={backtest} />
    </div>
  );
}

// Share called right so far, game by game. Each series counts the games it predicted, so it ends on its card's number.
function RunningAccuracy({ games, backtest }) {
  const rows = games;
  if (rows.length < 2) return null;
  const run = (key) => {
    let hits = 0, n = 0;
    return rows.map((g) => {
      if (g[key] != null) {
        n++;
        if (isHit(g, key)) hits++;
      }
      return n ? hits / n : null;
    });
  };
  // The chart has no gaps, so a series that starts late takes its first value from the start.
  const filled = (values) => {
    const first = values.find((v) => v != null) ?? 0;
    return values.map((v) => (v == null ? first : v));
  };
  let home = 0;
  return (
    <div className="charts sv-chart">
      <LineChart
        title="Share called right so far"
        dates={rows.map((g) => g.d)}
        base={0.5}
        format={(v) => `${Math.round(v * 100)}%`}
        series={[
          { label: `Main${backtest ? ", backtest" : ""}`, values: filled(run("pm")), className: "pm" },
          { label: `Shadow${backtest ? ", pre-game" : ""}`, values: filled(run("ps")), className: "ps" },
          {
            label: "Always home",
            values: rows.map((g, i) => {
              if (g.hw === 1) home++;
              return home / (i + 1);
            }),
            className: "mk",
          },
        ]}
      />
    </div>
  );
}

// The money side: €1 on every pick, quarter Kelly, the market, the charts, and a simulator for other betting rules.
export function Betting({ games, backtest }) {
  const s = useMemo(() => {
    const withPrice = priced(games);
    const row = (key) => {
      const wp = withPrice.filter((g) => g[key] != null);
      if (!wp.length) return null;
      return { flat: flatLedger(wp, key), kelly: kellyLedger(wp, key), complete: wp.length === withPrice.length };
    };
    return {
      withPrice,
      pm: row("pm"),
      ps: row("ps"),
      marketFlat: flatLedger(
        withPrice.map((g) => ({ ...g, mk: marketP(g) })),
        "mk"
      ),
    };
  }, [games]);

  if (!s.withPrice.length) return <p className="note">No games with a stored price yet.</p>;
  const span = `${shortDate(s.withPrice[0].d)} to ${shortDate(s.withPrice[s.withPrice.length - 1].d)}`;
  return (
    <div className="season">
      <p className="season-scope">
        {s.withPrice.length} games with a price stored at prediction time ({span}). Paper bets only.
      </p>
      <div className="scroll-x">
        <table className="scoreboard">
          <thead>
            <tr>
              <th scope="col" />
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
            {["pm", "ps"]
              .filter((k) => s[k])
              .map((k) => (
                <tr key={k} className={k}>
                  <th scope="row">
                    <span className="swatch" aria-hidden="true" />
                    {MODELS[k].name}
                    <Src kind={kindOf(k, backtest)} />
                    <span className="sub">{MODELS[k].long}</span>
                  </th>
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
                <span className="sub">€1 on every favourite</span>
              </th>
              <td className={`num ${s.marketFlat.profit < 0 ? "neg" : ""}`}>{euro(s.marketFlat.profit, true)}</td>
              <td className="num">
                <span className="na">no bets</span>
              </td>
              <td className="num" />
            </tr>
          </tbody>
        </table>
      </div>
      {s.withPrice.length > 1 && (
        <div className="charts">
          <LineChart
            title="€1 on every pick: running profit"
            dates={s.withPrice.map((g) => g.d)}
            base={0}
            format={(v) => `${v < 0 ? "−" : ""}€${Math.abs(v).toFixed(0)}`}
            series={[
              s.pm?.complete && { label: backtest ? "Main, backtest" : "Main", values: s.pm.flat.path, className: "pm" },
              s.ps?.complete && { label: backtest ? "Shadow, pre-game" : "Shadow", values: s.ps.flat.path, className: "ps" },
            ].filter(Boolean)}
          />
        </div>
      )}
      <div className="reading">
        <h3>Reading these numbers</h3>
        <ul>
          <li>
            <b>Quarter Kelly</b> stakes a quarter of the Kelly fraction of the bankroll, only on a side the model rates
            above the price. Flat staking puts €1 on the model's pick in every priced game.
          </li>
          <li>
            The prices are the ones stored when each prediction was made, not closing prices.
            {backtest && " For 2025-26 they exist from 7 January."}
          </li>
          <li>Confirming a 1% edge would take tens of thousands of bets. {s.withPrice.length} games can only rule out large ones.</li>
        </ul>
      </div>
      <div className="sv-sim">
        <h3>Try other betting rules</h3>
        <BetView games={games} />
      </div>
    </div>
  );
}
