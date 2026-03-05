export const logger = {
  warn: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "test") {
      console.warn(message, meta);
    }
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "test") {
      console.error(message, meta);
    }
  },
};
