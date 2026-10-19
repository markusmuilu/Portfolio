import { useEffect, useRef, useState } from "react";
import "./charts.css";

// Small SVG charts for the modelling decisions. Colours: main model #1f5fb0, shadow/second series #00897b (checked
// with the dataviz palette validator against white), everything else a labelled grey. Every mark has a hover
// tooltip, and each chart has its numbers in a table for screen readers.

function Tip({ tip }) {
  if (!tip) return null;
  return (
    <div className="ch-tip" style={{ left: tip.x, top: tip.y }} role="status">
      {tip.text}
    </div>
  );
}

const useTip = () => {
  const [tip, setTip] = useState(null);
  const show = (e, text) => {
    const box = e.currentTarget.closest(".ch").getBoundingClientRect();
    setTip({ x: e.clientX - box.left + 12, y: e.clientY - box.top - 10, text });
  };
  return [tip, show, () => setTip(null)];
};

// Below this width a chart stacks each label above its own track, so a phone never scrolls sideways.
const useNarrow = (limit = 560) => {
  const ref = useRef(null);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < limit));
    ro.observe(el);
    return () => ro.disconnect();
  }, [limit]);
  return [ref, narrow];
};

// Dot plot: one row per item, a dot at its value, an optional interval line. Lower is better unless told otherwise.
// rows: [{ label, value, lo, hi, tone: "main" | "second" | "other", note }]
export function DotPlot({ rows, domain, format, axisLabel, caption, ticks }) {
  const [tip, show, hide] = useTip();
  const [ref, narrow] = useNarrow();
  // Wide: labels in a left column sized to the longest label (about 7.4 units a character at 14px).
  // Narrow: each label on its own line above the dot, and the track uses the full width.
  const L = narrow ? 8 : Math.min(340, Math.max(140, Math.max(...rows.map((r) => r.label.length)) * 7.4 + 16));
  const W = narrow ? 360 : 640, R = 56, rowH = narrow ? 50 : 34, T = 8, B = 34;
  const H = T + rows.length * rowH + B;
  const x = (v) => L + ((v - domain[0]) / (domain[1] - domain[0])) * (W - L - R);
  const tks = ticks || [domain[0], (domain[0] + domain[1]) / 2, domain[1]];
  return (
    <figure className="ch" ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={caption}>
        {tks.map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={T} y2={H - B + 4} className="ch-grid" />
            <text x={x(t)} y={H - B + 20} className="ch-axis" textAnchor="middle">
              {format(t)}
            </text>
          </g>
        ))}
        {axisLabel && (
          <text x={W - R} y={H - 2} className="ch-axis" textAnchor="end">
            {axisLabel}
          </text>
        )}
        {rows.map((r, i) => {
          const cy = T + i * rowH + (narrow ? 34 : rowH / 2);
          const text = `${r.label}: ${format(r.value)}${r.lo != null ? ` (interval ${format(r.lo)} to ${format(r.hi)})` : ""}${r.note ? `. ${r.note}` : ""}`;
          return (
            <g key={r.label} className={`ch-row tone-${r.tone || "other"}`} onMouseMove={(e) => show(e, text)} onMouseLeave={hide}>
              <rect x={0} y={T + i * rowH} width={W} height={rowH} className="ch-hit" />
              <text x={narrow ? L : L - 12} y={narrow ? cy - 16 : cy + 5} className="ch-label" textAnchor={narrow ? "start" : "end"}>
                {r.label}
              </text>
              {r.lo != null && <line x1={x(r.lo)} x2={x(r.hi)} y1={cy} y2={cy} className="ch-ci" />}
              <circle cx={x(r.value)} cy={cy} r={6} className="ch-dot" />
              <text x={(r.hi != null ? x(r.hi) : x(r.value)) + 12} y={cy + 4} className="ch-val">
                {format(r.value)}
              </text>
            </g>
          );
        })}
      </svg>
      <Tip tip={tip} />
      {caption && <figcaption>{caption}</figcaption>}
      <table className="sr-only">
        <caption>{caption}</caption>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              <td>{format(r.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

// Before and after per row: two dots joined by a line. a = "before" (grey), b = "after" (main colour).
export function Dumbbell({ rows, domain, format, labels, caption }) {
  const [tip, show, hide] = useTip();
  const [ref, narrow] = useNarrow();
  const W = narrow ? 360 : 640, L = narrow ? 8 : 110, R = narrow ? 16 : 40, rowH = narrow ? 48 : 34, T = narrow ? 8 : 34, B = 30;
  const H = T + rows.length * rowH + B;
  const x = (v) => L + ((v - domain[0]) / (domain[1] - domain[0])) * (W - L - R);
  const tks = [domain[0], (domain[0] + domain[1]) / 2, domain[1]];
  return (
    <figure className="ch" ref={ref}>
      <div className="ch-legend">
        <span>
          <i className="lg-dot tone-other" /> {labels[0]}
        </span>
        <span>
          <i className="lg-dot tone-main" /> {labels[1]}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={caption}>
        {tks.map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={narrow ? T : T - 8} y2={H - B + 4} className="ch-grid" />
            <text x={x(t)} y={H - B + 20} className="ch-axis" textAnchor="middle">
              {format(t)}
            </text>
          </g>
        ))}
        {rows.map((r, i) => {
          const cy = narrow ? T + i * rowH + 32 : T + i * rowH + rowH / 2 - 8;
          const text = `${r.label}: ${labels[0]} ${format(r.a)}, ${labels[1]} ${format(r.b)}`;
          return (
            <g key={r.label} className="ch-row" onMouseMove={(e) => show(e, text)} onMouseLeave={hide}>
              <rect x={0} y={narrow ? T + i * rowH : cy - rowH / 2} width={W} height={rowH} className="ch-hit" />
              <text x={narrow ? L : L - 12} y={narrow ? cy - 14 : cy + 5} className="ch-label" textAnchor={narrow ? "start" : "end"}>
                {r.label}
              </text>
              <line x1={x(r.a)} x2={x(r.b)} y1={cy} y2={cy} className="ch-link" />
              <circle cx={x(r.a)} cy={cy} r={6} className="ch-dot tone-other" />
              <circle cx={x(r.b)} cy={cy} r={6} className="ch-dot tone-main" />
            </g>
          );
        })}
      </svg>
      <Tip tip={tip} />
      {caption && <figcaption>{caption}</figcaption>}
      <table className="sr-only">
        <caption>{caption}</caption>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              <td>
                {labels[0]} {format(r.a)}, {labels[1]} {format(r.b)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

// Heatmap: rows x columns of numbers on one blue scale, lighter = lower, with the value in every cell (the grid is
// small enough to read). base marks the break-even value, drawn with a thicker outline.
export function Heatmap({ rows, cols, value, rowLabel, colLabel, format, base, caption }) {
  const [tip, show, hide] = useTip();
  const vals = rows.flatMap((r) => cols.map((c) => value(r, c))).filter((v) => v != null);
  const hi = Math.max(...vals);
  // Linear from 0 to the largest value: lighter = less left. (A log scale squeezed 0.56 and 0.88 together.)
  const t = (v) => (hi > 0 ? Math.max(0, v) / hi : 0);
  const shade = (v) => `hsl(213 70% ${96 - t(v) * 58}%)`;
  return (
    <figure className="ch">
      <div className="hm" style={{ gridTemplateColumns: `minmax(64px, auto) repeat(${cols.length}, minmax(0, 1fr))` }}>
        <span className="hm-corner">
          {rowLabel} \ {colLabel}
        </span>
        {cols.map((c) => (
          <span key={c} className="hm-head">
            {c.label}
          </span>
        ))}
        {rows.map((r) => (
          <div className="hm-row" key={r.label}>
            <span className="hm-rowhead">{r.label}</span>
            {cols.map((c) => {
              const v = value(r, c);
              const dark = v != null && t(v) > 0.55;
              return (
                <span
                  key={c.label}
                  className={`hm-cell${base != null && v >= base ? " above" : ""}`}
                  style={{ background: v == null ? "transparent" : shade(v), color: dark ? "#fff" : "var(--ink)" }}
                  onMouseMove={(e) => show(e, `${rowLabel} ${r.label}, ${colLabel} ${c.label}: ${v == null ? "no bets" : format(v)}`)}
                  onMouseLeave={hide}
                >
                  {v == null ? "-" : format(v)}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <Tip tip={tip} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

// Calibration: predicted probability against how often it happened, per bin. On the diagonal = honest probabilities.
// Dot area grows with the number of games in the bin.
export function Calibration({ bins, caption }) {
  const [tip, show, hide] = useTip();
  const S = 300, P = 40;
  const x = (v) => P + v * (S - P - 10);
  const y = (v) => S - P - v * (S - P - 10);
  const maxN = Math.max(...bins.map((b) => b.count));
  return (
    <figure className="ch ch-cal">
      <svg viewBox={`0 0 ${S} ${S}`} width="100%" role="img" aria-label={caption}>
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={y(0)} y2={y(1)} className="ch-grid" />
            <line x1={x(0)} x2={x(1)} y1={y(t)} y2={y(t)} className="ch-grid" />
            <text x={x(t)} y={S - P + 18} className="ch-axis" textAnchor="middle">{`${t * 100}%`}</text>
            <text x={P - 8} y={y(t) + 4} className="ch-axis" textAnchor="end">{`${t * 100}%`}</text>
          </g>
        ))}
        <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} className="ch-diag" />
        <text x={x(0.5)} y={S - 4} className="ch-axis" textAnchor="middle">predicted home win</text>
        {bins.map((b) => (
          <circle
            key={b.bin}
            cx={x(b.mean_pred)}
            cy={y(b.observed)}
            r={4 + 8 * Math.sqrt(b.count / maxN)}
            className="ch-dot tone-main"
            onMouseMove={(e) => show(e, `Predicted ${Math.round(b.mean_pred * 100)}%, happened ${Math.round(b.observed * 100)}%, ${b.count} games`)}
            onMouseLeave={hide}
          />
        ))}
      </svg>
      <Tip tip={tip} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
