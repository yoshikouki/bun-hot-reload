import { type FSWatcher, watch } from "fs";
import type { Serve } from "bun";

const defaultHotReloadOptions = {
  path: "/bun-hot-reload",
  command: "reload",
};
type HotReloadOptions = typeof defaultHotReloadOptions & {
  buildConfig?: BuildConfig;
  watchPaths?: string[];
};
type BuildConfig = Parameters<typeof Bun.build>[0];

const makeLiveReloadScript = (hotReloadURL: string) => `
<!-- start bun live reload script -->
<script type="text/javascript">
  (() => {
    const socket = new WebSocket("ws://${hotReloadURL}");
    socket.onopen = () => {
      console.info("Hot reload enabled...");
    }
    socket.onmessage = (message) => {
      if(message.data === '${defaultHotReloadOptions.command}') {
        location.reload()
      }
    };
  })();
</script>
<!-- end bun live reload script -->
`;

const buildByOptions = async (buildConfig?: BuildConfig) => {
  if (!buildConfig) return;
  await Bun.build(buildConfig);
};

const configureHotReload = <WebSocketDataType = undefined>(
  serveOptions: Serve<WebSocketDataType>,
  hotReloadOptions?: HotReloadOptions,
): Serve<WebSocketDataType> => {
  const hotReloadPath = hotReloadOptions?.path ?? defaultHotReloadOptions.path;

  buildByOptions(hotReloadOptions?.buildConfig);
  const watchers: { filepath: string; watcher: FSWatcher }[] =
    hotReloadOptions?.watchPaths?.map((path) => ({
      filepath: path,
      watcher: watch(path),
    })) ?? [];

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

      const originalHtml = await response.text();
      const liveReloadScript = makeLiveReloadScript(
        `${reqUrl.host}${hotReloadPath}`,
      );
      const htmlWithLiveReload = originalHtml + liveReloadScript;

      return new Response(htmlWithLiveReload, response);
    },

    websocket: {
      ...(serveOptions.websocket || {}),
      open: (ws) => {
        serveOptions.websocket?.open?.(ws);
        for (const { filepath, watcher } of watchers) {
          watcher.on("change", () => {
            console.log(`File changed: ${filepath}`);
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
