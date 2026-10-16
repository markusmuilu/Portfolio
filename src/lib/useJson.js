import { useEffect, useState } from "react";

// The daily job publishes the season data to the Predicting-Nba repository's `data` branch twice a day. Pages read
// that first and fall back to the copy bundled with the site.
export const LIVE_DATA = "https://raw.githubusercontent.com/markusmuilu/Predicting-Nba/data";

// Fetches JSON from the first URL that answers. Returns null until it arrives (and during prerender), or { error }.
export default function useJson(...urls) {
  const [data, setData] = useState(null);
  const key = urls.join("|");
  useEffect(() => {
    let live = true;
    const list = key.split("|");
    const tryAt = (i) =>
      fetch(list[i])
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
        .catch((e) => (i + 1 < list.length ? tryAt(i + 1) : Promise.reject(e)));
    tryAt(0)
      .then((d) => live && setData(d))
      .catch((e) => live && setData({ error: String(e) }));
    return () => {
      live = false;
    };
  }, [key]);
  return data;
}
