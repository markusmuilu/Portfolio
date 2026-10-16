import { useEffect, useState } from "react";

// A project's public repository, read live from the GitHub API: language, last push and the latest commits.
export default function RepoActivity({ repo, commits = 5 }) {
  const [info, setInfo] = useState(null);
  const [log, setLog] = useState(null);

  useEffect(() => {
    let live = true;
    const get = (u) => fetch(u).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));
    get(`https://api.github.com/repos/markusmuilu/${repo}`).then((d) => live && setInfo(d)).catch(() => live && setInfo({ error: true }));
    get(`https://api.github.com/repos/markusmuilu/${repo}/commits?per_page=${commits}`)
      .then((d) => live && setLog(d))
      .catch(() => live && setLog([]));
    return () => {
      live = false;
    };
  }, [repo, commits]);

  const url = `https://github.com/markusmuilu/${repo}`;
  const day = (s) => new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="repo">
      <div className="repo-head">
        <a className="repo-name" href={url} target="_blank" rel="noopener noreferrer">
          markusmuilu/{repo}
        </a>
        {info && !info.error && (
          <span className="repo-meta">
            {info.language && <span>{info.language}</span>}
            <span>last push {day(info.pushed_at)}</span>
          </span>
        )}
      </div>
      {log && log.length > 0 && (
        <ol className="repo-log">
          {log.map((c) => (
            <li key={c.sha}>
              <a href={c.html_url} target="_blank" rel="noopener noreferrer">
                {c.commit.message.split("\n")[0]}
              </a>
              <span>{day(c.commit.author.date)}</span>
            </li>
          ))}
        </ol>
      )}
      {(info?.error || (log && log.length === 0)) && (
        <p className="note">
          Recent commits could not be loaded. The code is at{" "}
          <a href={url} target="_blank" rel="noopener noreferrer">
            github.com/markusmuilu/{repo}
          </a>
          .
        </p>
      )}
    </div>
  );
}
