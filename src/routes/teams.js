import { Router } from "express";
import TeamService from "../services/teams-service";
import { toError, toTeam } from "../utils/response-utils";
import { adminAuthorize, sameTeamAuthorize } from "../routes/authorization";

const teamService = new TeamService();
const teamRouter = Router();

const getAllTeams = async (req, res) => {
  try {
    const teams = await teamService.getAllTeams();
    res
      .status(200)
      .json({ status: "success", data: teams.map((t) => toTeam(t)) });
  } catch (e) {
    console.error(e);
    res.status(500).json(toError(e));
  }
};

const createTeam = async (req, res) => {
  try {
    const team = await teamService.createTeam(req.body);
    res.status(201).json({ status: "success", data: { ...team } });
  } catch (e) {
    console.error(e);
    res.status(500).json(toError(e, "ERR_500", "Error creating team"));
  }
};

const getTeam = async (req, res) => {
  try {
    const teamId = req.params["teamId"];
    const team = await teamService.getTeam(teamId);
    res.json({ status: "success", data: toTeam(team) });
  } catch (e) {
    console.error(e);
    res.status(500).json(toError(e));
  }
};

const updateTeam = async (req, res) => {
  try {
    const { teamId, name } = req.body;
    const team = await teamService.updateTeam(teamId, name);
    res.json({ status: "success", data: toTeam(team) });
  } catch (e) {
    console.error(e);
    res.status(500).json(toError(e));
  }
};

const deleteTeam = async (req, res) => {
  try {
    const teamId = req.params["teamId"];
    console.log(teamId);
    await teamService.deleteTeam(teamId);
    res.json({ status: "success", message: "Deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json(toError(e));
  }
};

teamRouter.get(
  "/vbms/api/v1/teams/:teamId",
  adminAuthorize,
  sameTeamAuthorize,
  getTeam
);
teamRouter.get("/vbms/api/v1/teams", adminAuthorize, getAllTeams);
teamRouter.post("/vbms/api/v1/teams", adminAuthorize, createTeam);
teamRouter.put("/vbms/api/v1/teams", adminAuthorize, updateTeam);
teamRouter.delete("/vbms/api/v1/teams/:teamId", adminAuthorize, deleteTeam);

export default teamRouter;
