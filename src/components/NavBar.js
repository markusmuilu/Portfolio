import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo-link">
          <span className="logo">Markus Muilu</span>
        </Link>
      </div>

      <ul className="navbar-links">
        <li>
          <Link to="/" className={pathname === "/" ? "active" : ""}>Home</Link>
        </li>
        <li>
          <Link to="/nba_prediction" className={pathname === "/nba_prediction" ? "active" : ""}>
            NBA Prediction
          </Link>
        </li>
        <li>
          <Link to="/thesis" className={pathname === "/thesis" ? "active" : ""}>
            Bachelor's Thesis
          </Link>
        </li>
        <li>
          <Link to="/github" className={pathname === "/github" ? "active" : ""}>GitHub</Link>
        </li>
      </ul>
    </nav>
  );
}
