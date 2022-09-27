import cors from "cors";
import express, { Request, Response, Router } from "express";

export const createApp = (routers: Router[]) => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.get("/health", (_req: Request, res: Response) => res.json({ message: "success" }));

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
