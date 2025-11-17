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
        `http://ec2-98-81-17-109.compute-1.amazonaws.com/predict?team1=${teamA}&team2=${teamB}`

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
          Results are stored in S3 and visualized in a Power BI dashboard. Read more about it in my github.
        </p>
      </section>

      

      {/* POWER BI */}
      <section className="pbi-section">
        <h2 className="pbi-title">Live Power BI Analytics</h2>
        <PowerBIReport />
      </section>
    </div>
  );
}
