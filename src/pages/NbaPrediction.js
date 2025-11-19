import { useState } from "react";
import PowerBIReport from "../components/PowerBIReport";
import "./NbaPrediction.css";

export default function NbaPrediction() {
  const teams = {
    "ATL": "Atlanta Hawks",
    "BOS": "Boston Celtics",
    "BKN": "Brooklyn Nets",
    "CHA": "Charlotte Hornets",
    "CHI": "Chicago Bulls",
    "CLE": "Cleveland Cavaliers",
    "DAL": "Dallas Mavericks",
    "DEN": "Denver Nuggets",
    "DET": "Detroit Pistons",
    "GSW": "Golden State Warriors",
    "HOU": "Houston Rockets",
    "IND": "Indiana Pacers",
    "LAC": "LA Clippers",
    "LAL": "LA Lakers",
    "MEM": "Memphis Grizzlies",
    "MIA": "Miami Heat",
    "MIL": "Milwaukee Bucks",
    "MIN": "Minnesota Timberwolves",
    "NOP": "New Orleans Pelicans",
    "NYK": "New York Knicks",
    "OKC": "Oklahoma City Thunder",
    "ORL": "Orlando Magic",
    "PHI": "Philadelphia 76ers",
    "PHX": "Phoenix Suns",
    "POR": "Portland Trail Blazers",
    "SAC": "Sacramento Kings",
    "SAS": "San Antonio Spurs",
    "TOR": "Toronto Raptors",
    "UTA": "Utah Jazz",
    "WAS": "Washington Wizards"
  };


  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [prediction, setPrediction] = useState(null);

  async function handlePredict() {
    if (!teamA || !teamB || teamA === teamB) {
      setPrediction("Please select two different teams.");
      return;
    }

    try {
      const res = await fetch(
        `http://16.171.238.233:8000/predict?team1=${teamA}&team2=${teamB}`

      );
      const data = await res.json();
      setPrediction(
        `Predicted winner: ${data.winner} (confidence ${data.confidence}%)`
      );
    } catch {
      setPrediction("Prediction service unavailable right now");
    }
  }

  return (
    <div className="nba-page">

      {/* TITLE */}
      <h1 className="nba-title">NBA Game Prediction Project</h1>

      {/* TLDR */}
      <section className="tldr-card">
        <h2>TL;DR Summary</h2>
        <p>
          This project predicts NBA game outcomes using a full Machine Learning pipeline 
          deployed on AWS. It collects game and team statistics, engineers features, trains 
          models, and serves predictions through a Dockerized FastAPI backend on EC2. 
          Results are stored in S3 and visualized in a Power BI dashboard. Read more about it on my{" "}
          <a 
            href="https://github.com/markusmuilu/Predicting-Nba" 
            target="_blank" 
            rel="noopener noreferrer"
            className="github-link"
          >
            GitHub
          </a>
          .
        </p>
      </section>


      {/*PREDICTOR SECTION (RESTORED) */}
      <section className="predictor-card">
        <h2>Try the Live Predictor</h2>

        <div className="predictor-inputs">
          {/* Team A */}
          <select value={teamA} onChange={(e) => setTeamA(e.target.value)}>
            <option value="">Select Team A</option>
            {Object.entries(teams).map(([abbr, name]) => (
              <option key={abbr} value={abbr}>
                {name}
              </option>
            ))}
          </select>

          {/* Team B */}
          <select value={teamB} onChange={(e) => setTeamB(e.target.value)}>
            <option value="">Select Team B</option>
            {Object.entries(teams).map(([abbr, name]) => (
              <option key={abbr} value={abbr}>
                {name}
              </option>
            ))}
          </select>

          {/* Predict Button */}
          <button onClick={handlePredict}>Predict</button>
        </div>

        {/* Prediction Result */}
        {prediction && <div className="prediction-output">{prediction}</div>}
      </section>

      {/* POWER BI */}
      <section className="pbi-section">
        <h2 className="pbi-title">Live Power BI Analytics</h2>
        <PowerBIReport />
      </section>
    </div>
  );
}
