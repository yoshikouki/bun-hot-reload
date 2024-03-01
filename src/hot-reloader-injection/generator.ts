declare global {
  let location: {
    reload: () => void;
  };
}

const hotReload = (hotReloadURL: string, hotReloadCommand: string) => {
  const socket = new WebSocket(hotReloadURL);
  socket.onopen = () => {
    console.info("Hot reload enabled...");
  };
  socket.onmessage = (message) => {
    if (message.data === hotReloadCommand) {
      location.reload();
    }
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
    console.error(error);
    return "";
  }
};
