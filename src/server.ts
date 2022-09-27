import * as dotenv from "dotenv";
const NODE_ENV = process.env.NODE_ENV || "development";
if (NODE_ENV !== "production") {
  dotenv.config({
    path: `.env.${NODE_ENV}`,
  });
}

import { createApp } from "./app";
import logger from "./logger";
import AuthenticationRouter from "./routes/authentication";
import AdminRouter from "./routes/internal-admin";
import PlayerRouter from "./routes/players";
import ProfileRouter from "./routes/profile";
import PublicRouter from "./routes/public";
import TeamRouter from "./routes/teams";

const port = process.env.PORT || 5001;
const authPort = process.env.AUTH_PORT || 5002;
const adminPort = process.env.ADMIN_PORT || 5003;

const app = createApp([PublicRouter, TeamRouter, PlayerRouter, ProfileRouter]);
const authApp = createApp([AuthenticationRouter]);
const adminApp = createApp([AdminRouter]);

app.listen(port, () => logger.info(`Server is up and running on http://localhost:${port}`));
authApp.listen(authPort, () => logger.info(`Authentication Server is up and running on http://localhost:${authPort}`));
adminApp.listen(adminPort, () => logger.info(`Admin Server is up and running on http://localhost:${adminPort}`));
