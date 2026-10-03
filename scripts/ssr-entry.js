import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { AppRoutes } from "../src/App";

export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <AppRoutes />
    </StaticRouter>
  );
}
