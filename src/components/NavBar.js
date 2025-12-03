import { Link } from "react-router-dom";
import "./NavBar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2 className="logo">Markus Muilu's Portfolio</h2>
      </div>

      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/nba_prediction">NBA Prediction</Link></li>
        <li><Link to="/github">GitHub</Link></li>
      </ul>
    </nav>
  );
}
