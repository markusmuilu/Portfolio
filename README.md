# Portfolio Frontend

React portfolio website for Markus Muilu — an IT student at Aalto University focused on ML and cloud engineering.

Live at **markusmuilu.page**

---

## Purpose

- Present professional background, skills, education, and experience
- Showcase the NBA prediction ML project with a live predictor and analytics dashboard
- Showcase the bachelor's thesis — gym exercise recognition with LightGBM vs Random Forest
- Link out to GitHub and provide contact information

---

## NBA Prediction Project

The featured project is a fully automated NBA win probability prediction system.

This frontend provides:
- **Live predictor** — select two teams, get a real-time prediction from the deployed Fly.io API
- **Streamlit analytics dashboard** — embedded from `nba-ml-dashboard.streamlit.app`, showing model performance, team stats, upset analysis, and betting simulation across 5 tabs

The backend and ML pipeline live in a separate repository. The analytics layer was originally built with **Power BI** and the backend ran on **AWS EC2** with **AWS S3** for storage. Both have since been replaced — the dashboard is now a custom Streamlit app embedded from Streamlit Community Cloud, and the backend runs on Fly.io with Cloudflare R2 storage.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + React Router 7 |
| Build | Create React App 5 |
| Styling | Vanilla CSS — dark navy theme, CSS custom properties, glassmorphism |
| Font | Inter (Google Fonts) |
| State | React `useState` (local only) |
| Analytics | Streamlit Community Cloud (iframe embed) |
| Prediction API | FastAPI on Fly.io — `predicting-nba.fly.dev` |

---

## Routes

| Path | Description |
|---|---|
| `/` | Portfolio homepage — hero, highlights, skills, education, experience, projects |
| `/nba_prediction` | NBA project page — live predictor, Streamlit dashboard, system overview |
| `/thesis` | Bachelor's thesis page — results chart, method overview, links to GitHub and PDF |
| `/github` | GitHub page — featured repositories with descriptions and links |

---

## Running Locally

```bash
npm install
npm start
```

Runs on `localhost:3000`. No environment variables needed — the prediction API URL is hardcoded.

---

## Notes

This frontend is intentionally lightweight and decoupled from backend logic. All ML computation, automation, and data storage happen in the backend project.
