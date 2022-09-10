import pino from "pino";

const pinoTarget = process.env.NODE_ENV === "development" ? "pino-pretty" : "pino/file";

const transportOpts =
  process.env.NODE_ENV === "development"
    ? { translateTime: "SYS:standard" }
    : {
        destination: `${__dirname}/../logs/service.log`,
        mkdir: true,
      };

const pinoConfig = {
  name: "VTMSLogger",
  nestedKey: "data",
  base: undefined,
  formatters: {
    level(label: string, _number: number) {
      return { level: label };
    },
  },
  transport: {
    target: pinoTarget,
    options: transportOpts,
  },
};

const logger = pino(pinoConfig);
export default logger;
