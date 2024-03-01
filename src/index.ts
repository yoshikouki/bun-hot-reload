import type { Serve } from "bun";

const configureHotReload = (options: Serve): Serve => {
  return {
    fetch: async (req) => {
      return new Response("Hello, World!", {
        headers: { "Content-Type": "text/plain" },
      });
    },
  };
};

export default configureHotReload;
