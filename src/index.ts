import type { Serve } from "bun";
import { watch, type FSWatcher } from "fs";
import { injectHotReloader } from "./hot-reloader-injection";

const defaultHotReloadOptions = {
  path: "/bun-hot-reload",
  command: "reload",
};
type HotReloadOptions = typeof defaultHotReloadOptions & {
  buildConfig?: BuildConfig;
  watchPaths?: string[];
};
type BuildConfig = Parameters<typeof Bun.build>[0];

const buildByOptions = async (buildConfig?: BuildConfig) => {
  if (!buildConfig) return;
  await Bun.build(buildConfig);
};

const configureHotReload = <WebSocketDataType = undefined>(
  serveOptions: Serve<WebSocketDataType>,
  hotReloadOptions?: HotReloadOptions,
): Serve<WebSocketDataType> => {
  if (process.env.NODE_ENV === "production") return serveOptions;

  const hotReloadPath = hotReloadOptions?.path ?? defaultHotReloadOptions.path;

  buildByOptions(hotReloadOptions?.buildConfig);
  const watchers: FSWatcher[] =
    hotReloadOptions?.watchPaths?.map((path) => watch(path)) ?? [];

  return {
    ...serveOptions,

    fetch: async (req, server) => {
      const reqUrl = new URL(req.url);
      if (reqUrl.pathname === hotReloadPath) {
        if (server.upgrade(req)) {
          return;
        }
        console.error("Failed to upgrade websocket connection.");
        return new Response("Failed to upgrade websocket connection.", {
          status: 400,
        });
      }

      const response = await serveOptions.fetch(req, server);
      if (!response?.headers.get("Content-Type")?.startsWith("text/html")) {
        return response;
      }

      try {
        const html = await response.text();
        const htmlWithHotReload = injectHotReloader({
          html,
          hotReloadURL: `${reqUrl.host}${hotReloadPath}`,
          hotReloadCommand: defaultHotReloadOptions.command,
        });
        return new Response(htmlWithHotReload, response);
      } catch (error) {
        console.error(error);
        return response;
      }
    },

    websocket: {
      ...(serveOptions.websocket || {}),
      open: (ws) => {
        serveOptions.websocket?.open?.(ws);
        for (const watcher of watchers) {
          watcher.on("change", () => {
            buildByOptions(hotReloadOptions?.buildConfig);
            ws.send(defaultHotReloadOptions.command);
          });
        }
        console.log("Hot reload enabled...");
      },
    },
  };
};

export default configureHotReload;
