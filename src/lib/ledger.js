// Scores a season of predictions from per-game rows:
//   { d: date, h: home, a: away, hw: 1 | 0 | null (not played yet), pm: main P(home win), ps: shadow P(home win),
//     oh / oa: decimal home / away prices, or null when no price was stored }
// The same functions run on last season's backtest and on the live season.

export const MODELS = {
  pm: { name: "Main", long: "PyTorch player model", last: "backtest" },
  ps: { name: "Shadow", long: "Logistic regression", last: "live" },
};

const clip = (p) => Math.min(Math.max(p, 1e-9), 1 - 1e-9);

export const played = (games) => games.filter((g) => g.hw === 0 || g.hw === 1);
export const priced = (games) => played(games).filter((g) => g.oh && g.oa);

// Bookmaker probability with the margin removed.
export const marketP = (g) => (1 / g.oh) / (1 / g.oh + 1 / g.oa);

export function quality(games, prob) {
  if (!games.length) return null;
  let hits = 0, ll = 0;
  for (const g of games) {
    const p = clip(prob(g));
    if ((p >= 0.5) === (g.hw === 1)) hits++;
    ll -= g.hw === 1 ? Math.log(p) : Math.log(1 - p);
  }
  return { n: games.length, accuracy: hits / games.length, logLoss: ll / games.length };
}

export const isHit = (g, key) => (g[key] >= 0.5) === (g.hw === 1);

// 1 euro on the model's pick in every priced game.
export function flatLedger(games, key) {
  const path = [];
  const profits = [];
  let total = 0;
  for (const g of games) {
    const home = g[key] >= 0.5;
    const price = home ? g.oh : g.oa;
    const p = isHit(g, key) ? price - 1 : -1;
    profits.push(p);
    total += p;
    path.push(total);
  }
  return { path, profit: total, staked: games.length, roi: games.length ? total / games.length : 0, interval: bootstrap(profits) };
}

// Quarter Kelly from 100 euros, on whichever side the model rates as positive expected value.
export function kellyLedger(games, key, fraction = 0.25, start = 100) {
  let bank = start, peak = start, maxDrawdown = 0, bets = 0;
  const path = [];
  for (const g of games) {
    const p = g[key];
    const evHome = p * g.oh - 1;
    const evAway = (1 - p) * g.oa - 1;
    const home = evHome >= evAway;
    const edge = home ? evHome : evAway;
    if (edge > 0) {
      const price = home ? g.oh : g.oa;
      const stake = (bank * fraction * edge) / (price - 1);
      const won = home ? g.hw === 1 : g.hw === 0;
      bank += won ? stake * (price - 1) : -stake;
      peak = Math.max(peak, bank);
      maxDrawdown = Math.max(maxDrawdown, 1 - bank / peak);
      bets++;
    }
    path.push(bank);
  }
  return { path, final: bank, start, bets, maxDrawdown };
}

// 95% interval of the mean, resampling games. Seeded so the page shows the same numbers on every load.
function bootstrap(values, n = 1000) {
  if (values.length < 20) return null;
  let seed = 7;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const means = [];
  for (let b = 0; b < n; b++) {
    let s = 0;
    for (let i = 0; i < values.length; i++) s += values[Math.floor(rand() * values.length)];
    means.push(s / values.length);
  }
  means.sort((x, y) => x - y);
  return [means[Math.floor(n * 0.025)], means[Math.floor(n * 0.975)]];
}

export const pct = (x, digits = 1) => `${(x * 100).toFixed(digits)}%`;
export const euro = (x, sign = false) => `${sign && x > 0 ? "+" : x < 0 ? "−" : ""}€${Math.abs(x).toFixed(2)}`;
export const signedPct = (x, digits = 1) => `${x > 0 ? "+" : x < 0 ? "−" : ""}${Math.abs(x * 100).toFixed(digits)}%`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const monthName = (d) => MONTHS[Number(d.slice(5, 7)) - 1];
export const shortDate = (d) => `${Number(d.slice(8, 10))} ${monthName(d)}`;

// F1 with "the home team wins" as the positive class: the balance between how many predicted home wins came true
// (precision) and how many real home wins were predicted (recall). 1 is perfect.
export function f1(games, prob) {
  let tp = 0, fp = 0, fn = 0;
  for (const g of games) {
    const home = prob(g) >= 0.5;
    if (home && g.hw === 1) tp++;
    else if (home) fp++;
    else if (g.hw === 1) fn++;
  }
  return tp ? (2 * tp) / (2 * tp + fp + fn) : 0;
}
