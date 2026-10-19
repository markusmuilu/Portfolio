// Where a number comes from, shown on the number itself so live and backtest results are never read as the same thing.
//   live      predicted before the game and stored, never changed afterwards
//   backtest  scored afterwards, on games the model was not trained on
const MEANING = {
  live: "Predicted before the game and stored. Never changed afterwards.",
  backtest: "Scored afterwards, on games the model was not trained on.",
};

export default function Src({ kind, lead = false }) {
  return (
    <span className={`src src-${kind}${lead ? " lead" : ""}`} title={MEANING[kind]}>
      {kind === "live" ? "Pre-game" : "Backtest"}
    </span>
  );
}

export function SrcKey() {
  return (
    <p className="src-key">
      <span>
        <Src kind="live" lead />
        predicted before the game and stored
      </span>
      <span>
        <Src kind="backtest" lead />
        scored afterwards, on games the model was not trained on
      </span>
    </p>
  );
}

// One row per number on the page: what it is, live or backtest, and what that means for it.
//   rows: [{ what, kind, detail }]
export function SourceTable({ rows, children }) {
  return (
    <div className="src-table">
      {children && <div className="src-why">{children}</div>}
      <ul className="src-rows">
        {rows.map((r) => (
          <li key={r.what}>
            <Src kind={r.kind} lead />
            <div>
              <b>{r.what}</b>
              <p>{r.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
