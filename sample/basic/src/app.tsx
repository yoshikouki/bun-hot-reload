export const App = () => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Bun Hot Reload</title>
      </head>
      <body>
        <h1>Hello, Bun!</h1>
        <p>{new Date().toISOString()}</p>
      </body>
    </html>
  );
};
