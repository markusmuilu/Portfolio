import { useState } from "react";

const teams = {
  ATL: "Atlanta Hawks", BOS: "Boston Celtics", BKN: "Brooklyn Nets", CHA: "Charlotte Hornets", CHI: "Chicago Bulls",
  CLE: "Cleveland Cavaliers", DAL: "Dallas Mavericks", DEN: "Denver Nuggets", DET: "Detroit Pistons",
  GSW: "Golden State Warriors", HOU: "Houston Rockets", IND: "Indiana Pacers", LAC: "LA Clippers", LAL: "LA Lakers",
  MEM: "Memphis Grizzlies", MIA: "Miami Heat", MIL: "Milwaukee Bucks", MIN: "Minnesota Timberwolves",
  NOP: "New Orleans Pelicans", NYK: "New York Knicks", OKC: "Oklahoma City Thunder", ORL: "Orlando Magic",
  PHI: "Philadelphia 76ers", PHX: "Phoenix Suns", POR: "Portland Trail Blazers", SAC: "Sacramento Kings",
  SAS: "San Antonio Spurs", TOR: "Toronto Raptors", UTA: "Utah Jazz", WAS: "Washington Wizards",
};

// Asks the player model on Fly.io for any two teams, with each team's latest roster minus the players ESPN lists as
// out: the same inputs a real prediction uses.
export default function Predictor() {
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function predict(e) {
    e.preventDefault();
    if (loading) return;
    if (!home || !away) return setError("Choose both teams.");
    if (home === away) return setError("Choose two different teams.");
    setError("");
    setLoading(true);
    setResult(null);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);
    try {
      const res = await fetch(`https://predicting-nba.fly.dev/player/predict?home=${home}&away=${away}`, { signal: controller.signal });
      if (res.status === 429) throw new Error("rate_limited");
      if (!res.ok) throw new Error("not_ok");
      const data = await res.json();
      if (data.p_home == null) throw new Error("not_ok");
      setResult(data);
    } catch (err) {
      if (err.name === "AbortError") setError("The service did not answer within a minute. It may be starting up; try again.");
      else if (err.message === "rate_limited") setError("Too many requests. Wait a minute and try again.");
      else setError("The prediction service is not answering right now.");
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }

  return (
    <form className="predictor" onSubmit={predict}>
      <p className="note">
        Pick two teams and the player model on Fly.io answers with each team's latest roster, minus the players
        ESPN lists as out right now. Not stored and not part of the record.
      </p>
      <div className="predictor-fields">
        <label>
          <span>Home</span>
          <select value={home} onChange={(e) => setHome(e.target.value)}>
            <option value="">Choose a team</option>
            {Object.entries(teams).map(([abbr, name]) => (
              <option key={abbr} value={abbr}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Away</span>
          <select value={away} onChange={(e) => setAway(e.target.value)}>
            <option value="">Choose a team</option>
            {Object.entries(teams).map(([abbr, name]) => (
              <option key={abbr} value={abbr}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Asking the model" : "Get prediction"}
        </button>
      </div>
      {error && (
        <p className="predictor-error" role="alert">
          {error}
        </p>
      )}
      {result && (
        <div className="predictor-result" aria-live="polite">
          <p>
            <b>{teams[result.p_home >= 0.5 ? result.home : result.away]}</b> to win,{" "}
            {Math.round(Math.max(result.p_home, 1 - result.p_home) * 100)}%
            <span className="predictor-split">
              {" "}
              ({result.home} at home {Math.round(result.p_home * 100)}%, {result.away} {Math.round((1 - result.p_home) * 100)}%)
            </span>
          </p>
          <p className="note">
            Rosters from each team's game on {result.roster_from[result.home]} and {result.roster_from[result.away]}.{" "}
            {[...result.out[result.home], ...result.out[result.away]].length
              ? `Left out as injured: ${[...result.out[result.home], ...result.out[result.away]].join(", ")}.`
              : "Nobody on either roster is listed as out."}{" "}
            Injury list read {result.injuries_at}.
          </p>
        </div>
      )}
    </form>
  );
}
