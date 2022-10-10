import * as dotenv from "dotenv";
import path from "path";

if (isDevOrTetEnv()) {
  dotenv.config({
    path: path.resolve(__dirname, "..", `.env.${process.env.NODE_ENV as string}`),
  });
}

import { createApp } from "./app";
import logger from "./logger";
import AuthenticationRouter from "./routes/authentication";
import AdminRouter from "./routes/admin";
import PlayerRouter from "./routes/players";
import ProfileRouter from "./routes/profile";
import PublicRouter from "./routes/public";
import TeamRouter from "./routes/teams";
import { isDevOrTetEnv } from "./utils/env-utils";

const port = process.env.PORT || 5001;
const authPort = process.env.AUTH_PORT || 5002;
const adminPort = process.env.ADMIN_PORT || 5003;

const app = createApp([PublicRouter, TeamRouter, PlayerRouter, ProfileRouter]);
const authApp = createApp([AuthenticationRouter]);
const adminApp = createApp([AdminRouter]);

app.listen(port, () => logger.info(`Server is up and running on http://localhost:${port}`));
authApp.listen(authPort, () => logger.info(`Authentication Server is up and running on http://localhost:${authPort}`));
adminApp.listen(adminPort, () => logger.info(`Admin Server is up and running on http://localhost:${adminPort}`));
