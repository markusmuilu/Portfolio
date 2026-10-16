// Two or three numbers as horizontal bars on a shared scale, each labelled with its value.
// rows: [{ label, value, strong }], format: value -> string, max: scale end
export default function CompareBars({ rows, format, max, caption }) {
  const top = max ?? Math.max(...rows.map((r) => r.value));
  return (
    <figure className="cbars">
      {rows.map((r) => (
        <div className={`cbar${r.strong ? " strong" : ""}`} key={r.label}>
          <span className="cbar-label">{r.label}</span>
          <span className="cbar-track">
            <span className="cbar-fill" style={{ width: `${Math.max((r.value / top) * 100, 2)}%` }} />
          </span>
          <span className="cbar-value">{format(r.value)}</span>
        </div>
      ))}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
