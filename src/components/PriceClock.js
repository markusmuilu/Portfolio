import { useEffect, useState } from "react";

// The next 24 hours of the Finnish electricity spot price around a 24-hour dial, one bar per quarter-hour.
// The inner ring lights the cheapest third, where price-optimised heating leans in.
// Live from spot-hinta.fi; falls back to a saved copy if the service does not answer.
const SOURCE = "https://api.spot-hinta.fi/TodayAndDayForward";
const FALLBACK = "/data/prices-snapshot.json";

const tod = (r) => +r.DateTime.slice(11, 13) * 60 + +r.DateTime.slice(14, 16); // minutes into the Finnish day

export default function PriceClock() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let live = true;
    fetch(SOURCE)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .catch(() => fetch(FALLBACK).then((r) => r.json()))
      .then((d) => live && setRows(d))
      .catch(() => live && setRows([]));
    return () => {
      live = false;
    };
  }, []);

  if (!rows || !rows.length) return <div className="clock-space" aria-hidden="true" />;

  const now = Date.now();
  let start = rows.findIndex((r) => new Date(r.DateTime).getTime() + 15 * 60000 > now);
  if (start < 0) start = Math.max(rows.length - 96, 0);
  const day = rows.slice(start, start + 96);
  const prices = day.map((r) => r.PriceWithTax * 100);
  const max = Math.max(...prices, 1);
  const cx = 300, cy = 300, r0 = 150, len = 120;
  const cheap = new Set([...prices.keys()].sort((a, b) => prices[a] - prices[b]).slice(0, Math.round(prices.length / 3)));
  const pt = (a, r) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  const lo = prices.indexOf(Math.min(...prices));
  const hand = (tod(day[0]) / 1440) * 2 * Math.PI;
  const [hx, hy] = pt(hand, r0 + len + 14);
  const [ix, iy] = pt(hand, r0 - 34);

  return (
    <svg
      className="clock"
      viewBox="0 0 600 600"
      role="img"
      aria-label={`Spot price for the next 24 hours. Now ${prices[0].toFixed(1)} cents per kWh; cheapest at ${day[lo].DateTime.slice(11, 16)}.`}
    >
      {prices.map((p, i) => {
        const a = ((tod(day[i]) + 7.5) / 1440) * 2 * Math.PI;
        const [x0, y0] = pt(a, r0);
        const [x1, y1] = pt(a, p >= 0 ? r0 + 4 + (p / max) * len : r0 + 4);
        const [ax, ay] = pt(a, r0 - 30);
        const [bx, by] = pt(a, r0 - 8);
        return (
          <g key={i}>
            <line className={`bar${cheap.has(i) ? " cheap" : ""}`} x1={x0} y1={y0} x2={x1} y2={y1}>
              <title>{`${day[i].DateTime.slice(11, 16)}  ${p.toFixed(2)} c/kWh`}</title>
            </line>
            <line className={cheap.has(i) ? "on" : "offmark"} x1={ax} y1={ay} x2={bx} y2={by} />
          </g>
        );
      })}
      {[0, 6, 12, 18].map((h) => {
        const [x, y] = pt((h / 24) * 2 * Math.PI, r0 - 54);
        return (
          <text key={h} className="hour" x={x} y={y + 5} textAnchor="middle">
            {String(h).padStart(2, "0")}
          </text>
        );
      })}
      <line className="hand" x1={ix} y1={iy} x2={hx} y2={hy} />
      <text className="big" x={cx} y={cy - 4} textAnchor="middle">
        {prices[0].toFixed(1)}
      </text>
      <text className="unit" x={cx} y={cy + 26} textAnchor="middle">
        c/kWh now
      </text>
      <text className="small" x={cx} y={cy + 58} textAnchor="middle">
        {`cheapest ${day[lo].DateTime.slice(11, 16)}, ${prices[lo].toFixed(1)}`}
      </text>
    </svg>
  );
}
