import { Request, Response, Router } from "express";
import { DatabaseError } from "pg";
import logger from "../logger";
import TeamService from "../services/teams-service";
import { toError } from "../utils/response-utils";
import { INewTeam } from "../utils/types";
import { adminAuthorize, commonAuthorize, requestBodyValidator, sameTeamAuthorize } from "./authorization";

const teamService = new TeamService();
const teamRouter = Router();

const getAllTeams = async (_req: Request, res: Response) => {
  try {
    const teams = await teamService.getAllTeams();
    res.status(200).json({ status: "success", data: teams });
  } catch (e) {
    logger.error(e);
    res.status(500).json(toError(e));
  }
};

const createTeam = async (req: Request, res: Response) => {
  try {
    const team = await teamService.createTeam(req.body as INewTeam);
    res.status(201).json({ status: "success", data: { ...team } });
  } catch (e) {
    if (e instanceof DatabaseError) {
      logger.error(e, e.detail);
      res.status(400).json(toError(e, "ACC_TEAM_400", e.detail));
      return;
    }

    logger.error(e);
    res.status(500).json(toError(e, "ERR_500", "Error creating team"));
  }
};

const getTeam = async (req: Request, res: Response) => {
  try {
    const teamId = req.params["teamId"];
    const team = await teamService.getTeam(parseInt(teamId));
    res.json({ status: "success", data: team });
  } catch (e) {
    logger.error(e);
    res.status(500).json(toError(e));
  }
};

const updateTeam = async (req: Request, res: Response) => {
  try {
    const { name, coachUserId } = req.body;
    const teamId = req.params["teamId"];
    await teamService.updateTeam(parseInt(teamId), name, coachUserId);
    res.status(204).end();
  } catch (e) {
    logger.error(e);
    res.status(500).json(toError(e));
  }
};

const deleteTeam = async (req: Request, res: Response) => {
  try {
    const teamId = req.params["teamId"];
    await teamService.deleteTeam(parseInt(teamId));
    res.status(204).end();
  } catch (e) {
    logger.error(e);
    res.status(500).json(toError(e));
  }
};

teamRouter.get("/v1/vtms/api/teams/:teamId", commonAuthorize, sameTeamAuthorize, getTeam);
teamRouter.get("/v1/vtms/api/teams", adminAuthorize, getAllTeams);
teamRouter.post("/v1/vtms/api/teams", requestBodyValidator, adminAuthorize, createTeam);
teamRouter.put("/v1/vtms/api/teams/:teamId", requestBodyValidator, adminAuthorize, updateTeam);
teamRouter.delete("/v1/vtms/api/teams/:teamId", adminAuthorize, deleteTeam);

export default teamRouter;
