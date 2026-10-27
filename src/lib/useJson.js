import { useEffect, useState } from "react";

// Live data, read first, with the copy bundled with the site as the fallback:
// NBA_LIVE: the prediction service on Fly.io, updated every 15 minutes by the player model's loop.
// LIVE_DATA: the Predicting-Nba repository's `data` branch, a copy that is no longer updated (the Finnish leagues moved to Fly on 22 Oct 2026), kept as a second source.
export const NBA_LIVE = "https://predicting-nba.fly.dev/portfolio";
export const LIVE_DATA = "https://raw.githubusercontent.com/markusmuilu/Predicting-Nba/data";

// Fetches JSON from the first URL that answers. Returns null until it arrives (and during prerender), or { error }.
export default function useJson(...urls) {
  const [data, setData] = useState(null);
  const key = urls.join("|");
  useEffect(() => {
    let live = true;
    const list = key.split("|");
    // A source that does not answer within 8 seconds counts as down, so the next one is tried instead of waiting.
    const tryAt = (i) => {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 8000);
      return fetch(list[i], { signal: ctl.signal })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
        .finally(() => clearTimeout(timer))
        .catch((e) => (i + 1 < list.length ? tryAt(i + 1) : Promise.reject(e)));
    };
    tryAt(0)
      .then((d) => live && setData(d))
      .catch((e) => live && setData({ error: String(e) }));
    return () => {
      live = false;
    };
  }, [key]);
  return data;
}
