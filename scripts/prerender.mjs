// Writes static HTML for each route into build/ so crawlers see content without running JS.
// The browser still loads the normal bundle, and React re-renders over the static markup.
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "build");
const site = "https://www.markusmuilu.page";

const pages = [
  {
    path: "/",
    title: "Markus Muilu | Portfolio",
    description:
      "Markus Muilu, Junior Data Scientist at Elo and M.Sc. student in Machine Learning, Data Science and AI at Aalto University. Projects in ML pipelines, data systems and building automation.",
  },
  {
    path: "/nba_prediction",
    title: "NBA Game Prediction Pipeline | Markus Muilu",
    description:
      "End-to-end NBA game prediction pipeline: automated data ingestion, feature engineering, daily predictions, a live predictor and an analytics dashboard.",
  },
  {
    path: "/thesis",
    title: "Bachelor's Thesis: Gym Exercise Recognition | Markus Muilu",
    description:
      "Aalto University bachelor's thesis, graded 5: LightGBM vs Random Forest for gym exercise recognition from wrist, leg and pocket sensor data.",
  },
  {
    path: "/home_heating",
    title: "Building Automation Bridge | Markus Muilu",
    description:
      "Replacement control system for a house's 24 heating zones: Raspberry Pi, Home Assistant and AppDaemon driving a Fidelix controller over Modbus RTU, shifting heating to cheaper spot-price hours.",
  },
  {
    path: "/github",
    title: "GitHub Projects | Markus Muilu",
    description: "Selected code repositories by Markus Muilu: ML pipelines, thesis code and other projects.",
  },
];

const ssrFile = join(root, "scripts", ".ssr-bundle.mjs");
await build({
  entryPoints: [join(root, "scripts", "ssr-entry.js")],
  bundle: true,
  platform: "node",
  format: "esm",
  jsx: "automatic",
  loader: { ".js": "jsx", ".jsx": "jsx", ".css": "empty", ".svg": "empty", ".png": "empty", ".jpg": "empty", ".jpeg": "empty" },
  packages: "external",
  outfile: ssrFile,
  logLevel: "warning",
});
const { render } = await import(pathToFileURL(ssrFile).href);
rmSync(ssrFile);

const template = readFileSync(join(out, "index.html"), "utf8");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

for (const page of pages) {
  const url = site + (page.path === "/" ? "/" : page.path);
  const head =
    `<title>${esc(page.title)}</title>` +
    `<meta name="description" content="${esc(page.description)}"/>` +
    `<link rel="canonical" href="${url}"/>` +
    `<meta property="og:title" content="${esc(page.title)}"/>` +
    `<meta property="og:description" content="${esc(page.description)}"/>` +
    `<meta property="og:url" content="${url}"/>` +
    `<meta property="og:type" content="website"/>` +
    `<noscript><style>.reveal{opacity:1!important;transform:none!important}</style></noscript>`;
  let html = template
    .replace(/<title>.*?<\/title>/s, "")
    .replace(/<meta name="description"[^>]*>/s, "")
    .replace("</head>", head + "</head>")
    .replace('<div id="root"></div>', `<div id="root">${render(page.path)}</div>`);
  const file = page.path === "/" ? join(out, "index.html") : join(out, page.path.slice(1), "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    pages.map((p) => `  <url><loc>${site}${p.path === "/" ? "/" : p.path}</loc><lastmod>${today}</lastmod></url>`).join("\n") +
    `\n</urlset>\n`
);
console.log(`Prerendered ${pages.length} pages and sitemap.xml`);
