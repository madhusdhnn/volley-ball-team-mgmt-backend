import * as dotenv from "dotenv";
const NODE_ENV = process.env.NODE_ENV || "development";
if (NODE_ENV !== "production") {
  dotenv.config({
    path: `.env.${NODE_ENV}`,
  });
}

import cors from "cors";
import express, { Request, Response, Router } from "express";
import db from "./config/db";
import logger from "./logger";
import AuthenticationRouter from "./routes/authentication";
import AdminRouter from "./routes/internal-admin";
import PlayerRouter from "./routes/players";
import ProfileRouter from "./routes/profile";
import PublicRouter from "./routes/public";
import TeamRouter from "./routes/teams";

db.raw("select 1 as result")
  .then((r) => logger.info(r.rows))
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  });

const createApp = (routers: Router[]) => {
  const app: express.Application = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.get("/health", (_req: Request, res: Response) => res.json({ status: "success" }));

  routers.forEach((router) => app.use(router));
  app.use((req, res) => {
    res.status(404);

    if (req.accepts("json")) {
      res.json({ error: "Requested resource not found." });
      return;
    }

    res.type("txt").send("Resource not found");
  });
  return app;
};

const port = process.env.PORT || 5001;
const authPort = process.env.AUTH_PORT || 5002;
const adminPort = process.env.ADMIN_PORT || 5003;

const app = createApp([PublicRouter, TeamRouter, PlayerRouter, ProfileRouter]);
const authApp = createApp([AuthenticationRouter]);
const adminApp = createApp([AdminRouter]);

app.listen(port, () => logger.info(`Server is up and running on http://localhost:${port}`));
authApp.listen(authPort, () => logger.info(`Authentication Server is up and running on http://localhost:${authPort}`));
adminApp.listen(adminPort, () => logger.info(`Admin Server is up and running on http://localhost:${adminPort}`));
