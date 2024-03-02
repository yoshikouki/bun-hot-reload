import { logger } from "../logger";

declare global {
  const location: {
    reload: () => void;
  };
}

const hotReload = (hotReloadURL: string, hotReloadCommand: string) => {
  const socket = new WebSocket(hotReloadURL);
  socket.onopen = () => {
    console.info("[HMR] Hot reload enabled...");
  };
  socket.onmessage = (message) => {
    if (message.data === hotReloadCommand) {
      location.reload();
    } else {
      console.warn("[HMR] Unknown message:", message.data);
    }
  };
  socket.onclose = () => {
    console.warn("[HMR] Hot reload disabled...");
  };
  socket.onerror = (error) => {
    console.error("[HMR] Hot reload error:", error);
  };
};

const generateHotReload = (hotReloadURL: string, hotReloadCommand: string) => {
  return `(${hotReload.toString()})("ws://${hotReloadURL}", "${hotReloadCommand}")`;
};

export const generateHotReloadScript = (
  hotReloadURL: string,
  hotReloadCommand: string,
) => {
  try {
    const hotReloader = generateHotReload(hotReloadURL, hotReloadCommand);
    return `<script type="text/javascript">${hotReloader}</script>`;
  } catch (error) {
    logger.error(error);
    return "";
  }
};
