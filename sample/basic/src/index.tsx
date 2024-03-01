import configureHotReload from "bun-hot-reload";
import { renderToString } from "react-dom/server";
import { App } from "./app";

Bun.serve(
  configureHotReload({
    fetch: async (_req) => {
      return new Response(renderToString(<App />), {
        headers: { "Content-Type": "text/html" },
      });
    },
  }),
);
