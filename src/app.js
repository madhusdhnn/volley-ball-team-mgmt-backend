import express from "express";
import cors from "cors";
import AuthenticationRouter from "./routes/authentication";
import TeamRouter from "./routes/teams";
import PlayerRouter from "./routes/players";

const createApp = (...routes) => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.get("/health", (req, res) =>
    res.json({
      status: "success",
      message: "Server is running..",
    })
  );
  routes.forEach((route) => app.use(route));
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

const app = createApp([TeamRouter, PlayerRouter]);

const authApp = createApp(AuthenticationRouter);

app.listen(port, () =>
  console.log(`Server is up and running on http://localhost:${port}`)
);
authApp.listen(authPort, () =>
  console.log(
    `Authentication Server is up and running on http://localhost:${authPort}`
  )
);
