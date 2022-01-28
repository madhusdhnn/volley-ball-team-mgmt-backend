import { Router } from "express";
import TeamService from "../services/teams-service";
import { toTeam } from "../utils/response-utils";

const teamService = new TeamService();
const router = Router();

const getAllTeams = async (req, res) => {
  try {
    const teams = await teamService.getAllTeams();
    res
      .status(200)
      .json({ status: "success", data: teams.map((t) => toTeam(t)) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "failed", error: "Something went wrong!" });
  }
};

const createTeam = async (req, res) => {
  try {
    const teamName = req.body.name;
    const team = await teamService.createTeam(teamName);
    res.status(201).json({ status: "success", data: toTeam(team) });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({
        status: "failed",
        error: `Error creating team. Reason: ${e.detail}`,
      });
  }
};

const getTeam = async (req, res) => {
  try {
    const teamId = req.params["teamId"];
    const team = await teamService.getTeam(teamId);
    res.json({ status: "success", data: toTeam(team) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "failed", error: "Something went wrong!" });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { teamId, name } = req.body;
    const team = await teamService.updateTeam(teamId, name);
    res.json({ status: "success", data: toTeam(team) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "failed", error: "Something went wrong!" });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const teamId = req.params["teamId"];
    await teamService.deleteTeam(teamId);
    res.json({ status: "success", message: "Deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "failed", error: "Something went wrong!" });
  }
};

router.get("/vbms/api/v1/teams/all", getAllTeams);
router.get("/vbms/api/v1/teams/:teamId", getTeam);
router.post("/vbms/api/v1/teams", createTeam);
router.put("/vbms/api/v1/teams", updateTeam);
router.delete("/vbms/api/v1/teams/:teamId", deleteTeam);

export default router;
