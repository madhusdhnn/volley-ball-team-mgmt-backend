import express from "express";
import cors from "cors";
import TeamRouter from "./routes/teams";
import PlayerRouter from "./routes/players";

const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({extended: false}))
  app.get("/health", (req, res) => res.send("Server is running.."))
  app.use(TeamRouter);
  app.use(PlayerRouter);
  return app;
};

const port = process.env.PORT || 5001;

const app = createApp();
app.listen(port, () => console.log(`Server is up and running on http://localhost:${port}`))