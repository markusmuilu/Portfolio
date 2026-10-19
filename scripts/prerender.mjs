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
    title: "NBA Game Prediction | Markus Muilu",
    description:
      "Predicts every NBA game before tip-off and keeps a public ledger: a PyTorch player model against a logistic regression shadow, with accuracy, log loss and what flat and Kelly stakes would have returned. Plus ratings for the Finnish men's leagues.",
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
    path: "/finnish_basketball",
    title: "Finnish Basketball Predictions | Markus Muilu",
    description:
      "Win chances for every men's Korisliiga, I divisioona and southern II divisioona game, from point-margin team ratings tuned on ten seasons of results, with the modelling decisions shown.",
  },
  {
    path: "/github",
    title: "Repositories | Markus Muilu",
    description: "Public code by Markus Muilu: NBA game prediction, a building automation bridge over Modbus RTU, bachelor's thesis code and a training planner.",
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
    `<meta property="og:type" content="website"/>`;
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
