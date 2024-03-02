const LOG_PREFIX = "[HMR]";

export const logger = {
  info: (message: unknown) => {
    console.info(`\x1b[34m${LOG_PREFIX} ${message}\x1b[0m`);
  },
  error: (message: unknown) => {
    console.error(`\x1b[31m${LOG_PREFIX} ${message}\x1b[0m`);
  },
  log: (message: unknown) => {
    console.log(`\x1b[34m${LOG_PREFIX} ${message}\x1b[0m`);
  },
};
