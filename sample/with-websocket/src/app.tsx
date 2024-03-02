export const App = () => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Bun Hot Reload</title>
        <script src="/dist/client.js" defer />
      </head>
      <body>
        <div id="root" />
      </body>
    </html>
  );
};
