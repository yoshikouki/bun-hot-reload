# bun-hot-reload

The bun-hot-reload package is designed to enhance your Bun development experience by providing a seamless hot reloading feature. This tool watches for file changes in your project and automatically rebuilds your application, signaling the client to reload the updated content. It integrates directly into your Bun server, offering both ease of use and efficiency in development workflows.

## Features

- Automatic Rebuilding: Automatically rebuilds your application on file changes.
- Customizable Watch Paths: Allows specifying custom paths to watch for changes, tailoring the tool to your project's needs.
- Flexible Configuration: Offers options to customize the hot reload path, reload command, and more.
- Development Efficiency: Designed to save time during development by reducing the need for manual rebuilds and reloads.

## Installation

To install bun-hot-reload, you can use the Bun package manager:

```bash
bun add bun-hot-reload
```

## Usage

```ts
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
```

## Configuration

bun-hot-reload provides several options to customize the hot reloading behavior:

watchPaths: Specifies the paths that should be watched for changes. Defaults to the current working directory.
hotReloadPath: The path used for the hot reload WebSocket connection. Defaults to /bun-hot-reload.
reloadCommand: The command sent over WebSocket to trigger a reload. Defaults to reload.
buildConfig: Configuration options for Bun's build command, allowing for custom build processes.

## Development Notes

This package is intended for use in development environments only. It automatically disables itself in production environments to ensure performance and security.
Ensure your client-side code is capable of handling WebSocket connections for hot reloading to function correctly.


## Contributing

Contributions to bun-hot-reload are welcome!
Whether it's bug reports, feature requests, or pull requests, your input helps make this tool better for everyone.

## License

bun-hot-reload is released under the MIT License. See the LICENSE file for more details.

## Acknowledgements

This implementation is influenced by [bun-html-live-reload](https://github.com/aabccd021/bun-html-live-reload) and [code by Nullndr](https://stackoverflow.com/a/77805915).
