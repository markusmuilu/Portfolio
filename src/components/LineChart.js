import { monthName } from "../lib/ledger";

// A plain line chart drawn in SVG. Each series is labelled at its last point instead of in a legend.
// series: [{ label, values, className }], dates: one date per x position, base: reference line (0 or the start).
export default function LineChart({ series, dates, base, format, title }) {
  const W = 760, H = 220, L = 46, R = 92, T = 14, B = 26;
  const n = dates.length;
  const all = series.flatMap((s) => s.values).concat(base);
  let lo = Math.min(...all), hi = Math.max(...all);
  const pad = (hi - lo) * 0.08 || 1;
  lo -= pad;
  hi += pad;
  const x = (i) => L + (i / Math.max(n - 1, 1)) * (W - L - R);
  const y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);

  const ticks = niceTicks(lo, hi, 4);
  const months = [];
  dates.forEach((d, i) => {
    if (i === 0 || d.slice(5, 7) !== dates[i - 1].slice(5, 7)) months.push({ i, name: monthName(d) });
  });

  // Keep the end labels from landing on top of each other.
  const ends = series.map((s) => ({ s, y: y(s.values[s.values.length - 1]) })).sort((a, b) => a.y - b.y);
  for (let k = 1; k < ends.length; k++) ends[k].y = Math.max(ends[k].y, ends[k - 1].y + 15);

  return (
    <figure className="chart">
      <figcaption>{title}</figcaption>
      <div className="chart-scroll">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={title}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="grid" />
            <text x={L - 8} y={y(t) + 4} className="axis" textAnchor="end">
              {format(t)}
            </text>
          </g>
        ))}
        <line x1={L} x2={W - R} y1={y(base)} y2={y(base)} className="base" />
        {months.map((m) => (
          <text key={m.i} x={x(m.i)} y={H - 6} className="axis">
            {m.name}
          </text>
        ))}
        {series.map((s) => (
          <polyline
            key={s.label}
            className={`line ${s.className}`}
            fill="none"
            points={s.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")}
          />
        ))}
        {ends.map(({ s, y: ly }) => (
          <text key={s.label} x={W - R + 8} y={ly + 4} className={`end ${s.className}`}>
            {s.label} {format(s.values[s.values.length - 1])}
          </text>
        ))}
      </svg>
      </div>
    </figure>
  );
}

function niceTicks(lo, hi, count) {
  const raw = (hi - lo) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
  const out = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}
