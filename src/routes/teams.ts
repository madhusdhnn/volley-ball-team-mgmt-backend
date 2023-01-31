import { Router } from "express";
import { createTeam, deleteTeam, getAllTeams, getTeam, updateTeam } from "../controllers/teams-controller";
import { adminAuthorize, commonAuthorize, requestBodyValidator, sameTeamAuthorize } from "./authorization-middleware";

const teamRouter = Router();

teamRouter.get("/v1/vtms/api/teams/:teamId", commonAuthorize, sameTeamAuthorize, getTeam);
teamRouter.get("/v1/vtms/api/teams", adminAuthorize, getAllTeams);
teamRouter.post("/v1/vtms/api/teams", requestBodyValidator, adminAuthorize, createTeam);
teamRouter.put("/v1/vtms/api/teams/:teamId", requestBodyValidator, adminAuthorize, updateTeam);
teamRouter.delete("/v1/vtms/api/teams/:teamId", adminAuthorize, deleteTeam);

export default teamRouter;
