// The main NBA model drawn as the pipeline it is: every shape here is the real one (research/model.py,
// DeepSetsMatchup; production weights in models/player_model/meta.json). Each step pairs a small picture of the
// numbers at that point with what happens to them.

const CELL = 5, GAP = 1;

// rows x cols of small squares; tone picks the colour.
function Grid({ rows, cols, tone = "in" }) {
  const w = cols * (CELL + GAP) - GAP, h = rows * (CELL + GAP) - GAP;
  const cells = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) cells.push(<rect key={`${r}-${c}`} x={c * (CELL + GAP)} y={r * (CELL + GAP)} width={CELL} height={CELL} rx={1} />);
  return (
    <svg className={`pn-grid pn-${tone}`} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      {cells}
    </svg>
  );
}

// Layer widths as centred strips, one per layer, top to bottom. Cells shrink so the widest layer fits 210px.
function Layers({ widths, tones }) {
  const max = Math.max(...widths);
  const cell = Math.min(CELL, Math.floor((210 + GAP) / max) - GAP);
  const W = max * (cell + GAP) - GAP, rowGap = 10;
  const H = widths.length * CELL + (widths.length - 1) * rowGap;
  return (
    <svg className="pn-grid" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {widths.map((n, i) => {
        const x0 = (W - (n * (cell + GAP) - GAP)) / 2;
        return (
          <g key={i} className={`pn-${tones[i]}`}>
            {Array.from({ length: n }, (_, c) => (
              <rect key={c} x={x0 + c * (cell + GAP)} y={i * (CELL + rowGap)} width={cell} height={CELL} rx={1} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

const STEPS = [
  {
    shape: "15 players × 23 numbers",
    pic: <Grid rows={15} cols={23} />,
    title: "Each player",
    text: "Up to 15 players per team, from the team's previous game; the running model also drops anyone the injury report lists as out. Each player is 23 numbers: last-10-game form (minutes, points, rebounds, assists, steals, blocks, turnovers, plus-minus), season averages, shooting and usage rates per 36 minutes, and how many games and days of rest are behind him.",
  },
  {
    shape: "23 → 32 → 16, per player",
    pic: <Layers widths={[23, 32, 16]} tones={["in", "mid", "out"]} />,
    title: "One small network for every player",
    text: "The same two-layer network reads each player and turns his 23 numbers into 16 that describe what he adds to a team. It is the same weights for every player, 1,296 of them, so it learns what kind of player matters rather than who he is.",
  },
  {
    shape: "15 × 16 → 16",
    pic: (
      <div className="pn-pool">
        <Grid rows={15} cols={16} tone="out" />
        <span className="pn-arrow">→</span>
        <Grid rows={1} cols={16} tone="team" />
      </div>
    ),
    title: "A team is its players, weighted by minutes",
    text: "The 16-number player vectors are averaged, weighted by the minutes each player has averaged over his last 10 games. The order of the players does not matter, which is what the name Deep Sets refers to: the network sees a set, not a list.",
  },
  {
    shape: "54 → 32 → 1",
    pic: <Layers widths={[54, 32, 1]} tones={["team", "mid", "team"]} />,
    title: "The matchup",
    text: "Home team, away team and their difference (48 numbers), plus each side's rest days, back-to-back flag and games into the season (6 more) go through a second small network to one score. It runs a second time with the teams swapped and takes the difference, so swapping home and away flips the answer exactly. A learned home-court term is added.",
  },
  {
    shape: "5 copies → 1 probability",
    pic: (
      <div className="pn-pool">
        <Grid rows={5} cols={1} tone="team" />
        <span className="pn-arrow">→</span>
        <span className="pn-result">
          62%<small>for example</small>
        </span>
      </div>
    ),
    title: "Five copies, averaged",
    text: "The whole network is trained five times from different random starting weights. Their five scores are averaged, divided by a temperature fitted so that a 70% means 70%, and turned into the home team's win probability. Averaging five copies removes most of the luck of any single training run.",
  },
];

export default function PlayerNet() {
  return (
    <div className="pn">
      <ol className="pn-steps">
        {STEPS.map((s) => (
          <li key={s.title} className="pn-step">
            <div className="pn-vis">
              {s.pic}
              <span className="pn-shape">{s.shape}</span>
            </div>
            <div className="pn-text">
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="pn-facts">
        <p>
          <b>Which model runs.</b> The set: all five copies, every day. They were trained in PyTorch on 2020-21 to
          2024-25, each stopped at the epoch where its 2025-26 log loss was lowest (between 9 and 16 epochs), and
          retrained on 16 October 2026. On the server the same weights run in NumPy, which keeps
          PyTorch out of the 512 MB container; the two agree to within 0.0000002.
        </p>
        <p>
          <b>Why the backtest is still clean.</b> The 2025-26 backtest on this page comes from an earlier copy, trained
          only up to 2023-24 with 2024-25 for stopping, so it never saw a 2025-26 game. The copy running now has seen
          2025-26, so it can only be judged on 2026-27.
        </p>
        <p>
          <b>Size.</b> About 3,100 weights per copy, small on purpose: there are only about 6,000 games to learn from.
          A deeper network with game sequences scored slightly better, but within noise, so the simpler one runs.
        </p>
      </div>
    </div>
  );
}
