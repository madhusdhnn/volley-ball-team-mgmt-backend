import { Router, Request, Response } from "express";
import TeamService from "../services/teams-service";
import { NewTeam } from "../utils/types";
import { toError } from "../utils/response-utils";
import {
  adminAuthorize,
  requestBodyValidator,
  sameTeamAuthorize,
} from "./authorization";

const teamService = new TeamService();
const teamRouter = Router();

const getAllTeams = async (_req: Request, res: Response) => {
  try {
    const teams = await teamService.getAllTeams();
    res.status(200).json({ status: "success", data: teams });
  } catch (e) {
    console.error(e);
    res.status(500).json(toError(e));
  }
};

const createTeam = async (req: Request, res: Response) => {
  try {
    const team = await teamService.createTeam(req.body as NewTeam);
    res.status(201).json({ status: "success", data: { ...team } });
  } catch (e) {
    console.error(e);
    if ((e as Error).message.includes("duplicate key")) {
      res.status(400).json({
        status: "failed",
        code: "ACC_TEAM_400",
        message: "Team already exists",
        detail: e.message,
      });
      return;
    }
    res.status(500).json(toError(e, "ERR_500", "Error creating team"));
  }
};

const getTeam = async (req: Request, res: Response) => {
  try {
    const teamId = req.params["teamId"];
    const team = await teamService.getTeam(parseInt(teamId));
    res.json({ status: "success", data: team });
  } catch (e) {
    console.error(e);
    res.status(500).json(toError(e));
  }
};

const updateTeam = async (req: Request, res: Response) => {
  try {
    const { teamId, name } = req.body;
    await teamService.updateTeam(teamId, name);
    res.json({ status: "success" });
  } catch (e) {
    console.error(e);
    res.status(500).json(toError(e));
  }
};

const deleteTeam = async (req: Request, res: Response) => {
  try {
    const teamId = req.params["teamId"];
    await teamService.deleteTeam(parseInt(teamId));
    res.json({ status: "success" });
  } catch (e) {
    console.error(e);
    res.status(500).json(toError(e));
  }
};

teamRouter.get(
  "/vtms/api/v1/teams/:teamId",
  adminAuthorize,
  sameTeamAuthorize,
  getTeam
);
teamRouter.get("/vtms/api/v1/teams", adminAuthorize, getAllTeams);
teamRouter.post(
  "/vtms/api/v1/teams",
  requestBodyValidator,
  adminAuthorize,
  createTeam
);
teamRouter.put(
  "/vtms/api/v1/teams",
  requestBodyValidator,
  adminAuthorize,
  updateTeam
);
teamRouter.delete("/vtms/api/v1/teams/:teamId", adminAuthorize, deleteTeam);

export default teamRouter;