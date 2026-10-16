import { useEffect, useState } from "react";

// Fetches a JSON file from public/. Returns null until it arrives (and during prerender), or { error } on failure.
export default function useJson(url) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let live = true;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then((d) => live && setData(d))
      .catch((e) => live && setData({ error: String(e) }));
    return () => {
      live = false;
    };
  }, [url]);
  return data;
}
