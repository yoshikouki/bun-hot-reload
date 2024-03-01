import { generateHotReloadScript } from "./generator";

export const injectHotReloader = ({
  html,
  hotReloadURL,
  hotReloadCommand,
}: {
  html: string;
  hotReloadURL: string;
  hotReloadCommand: string;
}) => {
  const hotReloadScript = generateHotReloadScript(
    hotReloadURL,
    hotReloadCommand,
  );
  const htmlWithHotReload = html.replace(
    "</body>",
    `${hotReloadScript}</body>`,
  );
  return htmlWithHotReload;
};
