import {Router} from "express";
import TeamService from "../services/teams-service";

const teamService = new TeamService();
const router = Router();

const toTeam = (team) => {
  let _team = {};
  if (!team) {
    return _team;
  }
  const {team_id, name, max_players, created_at, updated_at} = team;
  _team.teamId = team_id;
  _team.name = name;
  _team.maxPlayers = max_players;
  _team.audit = {createdAt: created_at, updatedAt: updated_at};
  return _team;
};

const getAllTeams = async (req, res) => {
  try {
    const teams = await teamService.getAllTeams();
    res.status(200).json({status: "success", data: teams.map(t => toTeam(t))});
  } catch (e) {
    console.error(e);
    res.status(500).json({status: "failed", error: "Something went wrong!"});
  }
}

const createTeam = async (req, res) => {
  try {
    const teamName = req.body.name;
    const team = await teamService.createTeam(teamName);
    res.status(201).json({status: "success", data: toTeam(team)});
  } catch (e) {
    console.error(e);
    res.status(500).json({status: "failed", error: `Error creating team. Reason: ${e.detail}`});
  }
};

const getTeam = async (req, res) => {
  try {
    const teamId = req.params["teamId"];
    const team = await teamService.getTeam(teamId);
    res.json({status: "success", data: toTeam(team)});
  } catch (e) {
    console.error(e);
    res.status(500).json({status: "failed", error: "Something went wrong!"});
  }
};

const updateTeam = async (req, res) => {
  try {
    const {teamId, name} = req.body;
    const team = await teamService.updateTeam(teamId, name);
    res.json({status: "success", data: toTeam(team)});
  } catch (e) {
    console.error(e);
    res.status(500).json({status: "failed", error: "Something went wrong!"});
  }
};

const deleteTeam = async (req, res) => {
  try {
    const teamId = req.params["teamId"];
    await teamService.deleteTeam(teamId);
    res.json({status: "success", message: "Deleted successfully"});
  } catch (e) {
    console.error(e);
    res.status(500).json({status: "failed", error: "Something went wrong!"});
  }
};

router.get("/api/v1/teams/all", getAllTeams);
router.get("/api/v1/teams/:teamId", getTeam);
router.post("/api/v1/teams", createTeam);
router.put("/api/v1/teams", updateTeam);
router.delete("/api/v1/teams/:teamId", deleteTeam);

export default router;
