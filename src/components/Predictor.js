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

// Asks the deployed service on Fly.io for a win probability between two teams.
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
      const res = await fetch(`https://predicting-nba.fly.dev/predict?team1=${home}&team2=${away}`, { signal: controller.signal });
      if (res.status === 429) throw new Error("rate_limited");
      if (!res.ok) throw new Error("not_ok");
      const data = await res.json();
      if (!data.winner) throw new Error("not_ok");
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
        Pick two teams and the service on Fly.io returns its probability. This calls the deployed regression, not the
        player model. The first request can take a while if the machine is asleep.
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
        <p className="predictor-result" aria-live="polite">
          <b>{teams[result.winner] || result.winner}</b>
          {result.confidence != null && ` to win, ${Number(result.confidence).toFixed(1)}%`}
        </p>
      )}
    </form>
  );
}
