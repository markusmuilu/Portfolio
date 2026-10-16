import { isHit, monthName, played } from "../lib/ledger";

// Share of games called right, one bar per month. Bars start at zero so their heights compare honestly.
export default function MonthBars({ games, modelKey }) {
  const months = [];
  for (const g of played(games)) {
    const key = g.d.slice(0, 7);
    if (!months.length || months[months.length - 1].key !== key) months.push({ key, name: monthName(g.d), n: 0, hits: 0 });
    const m = months[months.length - 1];
    m.n++;
    if (isHit(g, modelKey)) m.hits++;
  }
  return (
    <ol className="month-bars" aria-label="Share of games called right, by month">
      {months.map((m) => {
        const share = m.hits / m.n;
        return (
          <li key={m.key}>
            <span className="mb-area">
              <span className="mb-pct">{Math.round(share * 100)}%</span>
              <span className="mb-bar" style={{ height: `${share * 80}px` }} aria-hidden="true" />
            </span>
            <span className="mb-name">{m.name}</span>
          </li>
        );
      })}
    </ol>
  );
}
