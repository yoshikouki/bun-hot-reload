import { type FSWatcher, watch } from "fs";
import type {
  BuildConfig,
  Serve,
  Server,
  WebSocketHandler,
  WebSocketServeOptions,
} from "bun";

import { injectHotReloader } from "./hot-reloader-injection";
import { logger } from "./logger";

type InitServeOptions<WebSocketDataType = undefined> = Omit<
  WebSocketServeOptions<WebSocketDataType>,
  "fetch" | "websocket"
> & {
  fetch: (
    request: Request,
    server: Server,
  ) => Response | undefined | Promise<Response | undefined>;
  websocket?: WebSocketHandler<WebSocketDataType>;
};

type HotReloadOptions = Partial<typeof defaultHotReloadOptions> & {
  buildConfig?: BuildConfig;
  watchPaths?: string[];
};

const defaultHotReloadOptions = {
  hotReloadPath: "/bun-hot-reload",
  reloadCommand: "reload",
};

const buildByOptions = async (buildConfig?: BuildConfig) => {
  if (!buildConfig) return;
  await Bun.build(buildConfig);
  logger.log(`Built by options: ${JSON.stringify(buildConfig)}`);
};

const getHotReloadConfig = (hotReloadOptions?: HotReloadOptions) => {
  const hotReloadPath =
    hotReloadOptions?.hotReloadPath ?? defaultHotReloadOptions.hotReloadPath;
  const watchPaths =
    hotReloadOptions?.watchPaths && hotReloadOptions.watchPaths.length > 0
      ? hotReloadOptions.watchPaths
      : [`${process.cwd()}/src`];
  const reloadCommand =
    hotReloadOptions?.reloadCommand ?? defaultHotReloadOptions.reloadCommand;
  return {
    hotReloadPath,
    watchPaths,
    reloadCommand,
    buildConfig: hotReloadOptions?.buildConfig,
  };
};

const configureHotReload = <WebSocketDataType = undefined>(
  serveOptions: InitServeOptions<WebSocketDataType>,
  hotReloadOptions?: HotReloadOptions,
): Serve<WebSocketDataType> => {
  if (import.meta.env.NODE_ENV === "production") return serveOptions;

  const { hotReloadPath, watchPaths, reloadCommand, buildConfig } =
    getHotReloadConfig(hotReloadOptions);

  buildByOptions(buildConfig);
  const watchers: FSWatcher[] =
    watchPaths?.map((path) => watch(path, { recursive: true })) ?? [];
  logger.log(`Watching: ${JSON.stringify(watchPaths)}`);

  return {
    ...serveOptions,

    fetch: async (req, server) => {
      const reqUrl = new URL(req.url);
      if (reqUrl.pathname === hotReloadPath) {
        if (server.upgrade(req, { data: { hotReload: true } })) {
          return;
        }
        logger.error("Failed to upgrade websocket connection.");
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
          hotReloadCommand: reloadCommand,
        });
        return new Response(htmlWithHotReload, response);
      } catch (error) {
        logger.error(error);
        return response;
      }
    },

    websocket: {
      message: (ws, message) => {},
      ...(serveOptions.websocket || {}),
      open: (ws) => {
        if (ws.data?.hotReload) {
          for (const watcher of watchers) {
            watcher.on("change", () => {
              buildByOptions(buildConfig);
              ws.send(reloadCommand);
            });
          }
          logger.log("Hot reload enabled...");
        } else {
          serveOptions.websocket?.open?.(ws);
        }
      },
    },
  };
};

export default configureHotReload;
