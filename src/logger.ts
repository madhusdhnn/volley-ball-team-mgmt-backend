import pino from "pino";

const pinoConfig = {
  name: "VTMSLogger",
  nestedKey: "data",
  base: undefined,
  formatters: {
    level(label: string, _number: number) {
      return { level: label };
    },
  },
  enabled: process.env.NODE_ENV !== "test",
};

const logger = pino(pinoConfig);
export default logger;
