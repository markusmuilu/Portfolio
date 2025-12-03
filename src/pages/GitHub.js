import React from "react";
import "./GitHub.css";

export default function Github() {
  return (
    <div className="github-page">
      <h1>My GitHub</h1>

      <p>
        Building new projects that I showcase on my GitHub. I'm currently learning Computer Vision and exploring how to apply it to a basketball-related project.
        Feel free to follow my progress and check out what I'm working on:
      </p>

      <a
        href="https://github.com/markusmuilu"
        target="_blank"
        rel="noopener noreferrer"
        className="github-btn"
      >
        Visit my GitHub →
      </a>
    </div>
  );
}
