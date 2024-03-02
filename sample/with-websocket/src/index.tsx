import configureHotReload from "bun-hot-reload";
import { renderToString } from "react-dom/server";
import { App } from "./app";

Bun.serve(
  configureHotReload(
    {
      fetch: async (req, server) => {
        const url = new URL(req.url);
        if (url.pathname === "/") {
          if (server.upgrade(req)) {
            return;
          }
          return new Response(renderToString(<App />), {
            headers: { "Content-Type": "text/html" },
          });
        }
        if (url.pathname === "/dist/client.js") {
          return new Response(Bun.file("dist/client.js"), {
            headers: { "Content-Type": "application/javascript" },
          });
        }
        return new Response("Not Found", { status: 404 });
      },

      websocket: {
        message(ws, message) {
          console.log("WebSocket message:", message);
          ws.send(new Date().toISOString());
        },
        open(ws) {
          console.log("WebSocket connected");
          setInterval(() => {
            ws.send(new Date().toISOString());
          }, 1000);
        },
        close(ws, code, message) {
          console.log("WebSocket disconnected");
        },
      },
    },
    {
      buildConfig: {
        entrypoints: ["src/client.tsx"],
        outdir: "dist",
      },
    },
  ),
);
