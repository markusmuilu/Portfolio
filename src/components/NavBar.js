import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";

const links = [
  { to: "/", label: "Home" },
  { to: "/nba_prediction", label: "NBA Prediction" },
  { to: "/thesis", label: "Bachelor's Thesis" },
  { to: "/home_heating", label: "Building Automation" },
  { to: "/github", label: "GitHub" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const panelRef = useRef(null);

  // Close on navigation, so tapping a link in the drawer does not leave it open.
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes, and the page behind the drawer should not scroll with it.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.querySelector("a")?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo-link">
          <span className="logo">Markus Muilu</span>
        </Link>
      </div>

      <ul className="navbar-links">
        {links.map(({ to, label }) => (
          <li key={to}>
            <Link to={to} className={pathname === to ? "active" : ""}>
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <button
        ref={toggleRef}
        type="button"
        className={`navbar-toggle${open ? " open" : ""}`}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="navbar-drawer"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="toggle-bar" />
        <span className="toggle-bar" />
        <span className="toggle-bar" />
      </button>

      {/* Portalled to the body on purpose: the bar's backdrop-filter makes it
          the containing block for fixed descendants, which would clip the
          drawer to the height of the bar. */}
      {typeof document !== "undefined" && createPortal(
        <>
          <div
            className={`navbar-backdrop${open ? " open" : ""}`}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div
            id="navbar-drawer"
            ref={panelRef}
            className={`navbar-drawer${open ? " open" : ""}`}
            aria-hidden={!open}
          >
            <ul>
              {links.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={pathname === to ? "active" : ""}
                    tabIndex={open ? 0 : -1}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>,
        document.body
      )}
    </nav>
  );
}
