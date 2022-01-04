import {Router} from "express";
import PlayerService from "../services/player-service";

const playerService = new PlayerService();
const router = Router();

const toPlayer = (player) => {
  let _player = {};

  if (!player) {
    return _player;
  }

  const {age, height, weight, power, speed, favourite_positions} = player;

  _player.playerId = player["player_id"];
  _player.teamId = player["team_id"];
  _player.name = player.name;
  _player.additionalInfo = {age, height, weight, power, speed, favourite_positions};
  _player.audit = {createdAt: player["created_at"], updatedAt: player["updated_at"]}
  return _player;
};

const fetchPlayerUnitsMetadata = async (req, res) => {
  try {
    const playerUnits = await playerService.getPlayerUnits();
    playerUnits.status = "success";
    res.json(playerUnits);
  } catch (e) {
    console.error(e);
    res.status(500).json({status: "failed", error: "Something went wrong!"});
  }
}

const createPlayer = async (req, res) => {
  try {
    const player = await playerService.createPlayer(req.body);
    res.status(201).json({status: "success", data: toPlayer(player)});
  } catch (e) {
    console.error(e);
    res.status(500).json({status: "failed", error: `Error creating player. Reason: ${e.detail}`});
  }
};

const getAllPlayers = async (req, res) => {
  try {
    const players = await playerService.getAllPlayers();
    res.json({status: "success", data: players.map(pl => toPlayer(pl))});
  } catch (e) {
    console.error(e);
    res.status(500).json({status: "failed", error: "Something went wrong!"});
  }
};

const getPlayer = async (req, res) => {
  try {
    const playerId = req.params["playerId"];
    const player = await playerService.getPlayer(playerId);
    res.json({status: "success", data: toPlayer(player)});
  } catch (e) {
    console.error(e);
    res.status(500).json({status: "failed", error: "Something went wrong!"});
  }
};

const getAllPlayersInTeam = async (req, res) => {
  try {
    const teamId = req.params["teamId"];
    const players = await playerService.getAllPlayersInTeam(teamId);
    res.json({status: "success", data: players.map(pl => toPlayer(pl))});
  } catch (e) {
    console.error(e);
    res.status(500).json({status: "failed", error: "Something went wrong!"});
  }
};

const updatePlayer = async (req, res) => {
  try {
    const player = await playerService.updatePlayer(req.body);
    res.json({status: "success", data: toPlayer(player)});
  } catch (e) {
    console.error(e);
    res.status(500).json({error: "Something went wrong!"});
  }
};

const deletePlayer = async (req, res) => {
  try {
    await playerService.deletePlayer(req.params["playerId"]);
    res.json({status: "success", message: "Deleted successfully"});
  } catch (e) {
    console.error(e);
    res.status(500).json({status: "failed", error: "Something went wrong!"});
  }
};

const assignToTeam = async (req, res) => {
  try {
    const {playerId, teamId} = req.body;
    const player = await playerService.assignToTeam(playerId, teamId);
    res.json({status: "success", data: toPlayer(player)});
  } catch (e) {
    console.error(e);
    res.status(500).json({status: "failed", error: `Unable to assign to team. Reason: ${e.detail}`});
  }
};

const transferToTeam = async (req, res) => {
  try {
    const {playerId, currentTeamId, newTeamId} = req.body;
    const player = await playerService.transferToTeam(currentTeamId, newTeamId, playerId);
    if (player.error) {
      res.status(422).json({status: "failed", error: player.error});
    } else {
      res.json({status: "success", data: toPlayer(player)});
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({status: "failed", error: `Unable to transfer the player to new team. Reason: ${e.detail}`});
  }
};

router.get("/api/v1/players/metadata", fetchPlayerUnitsMetadata);
router.get("/api/v1/players/all", getAllPlayers);
router.get("/api/v1/players/all/:teamId", getAllPlayersInTeam);
router.get("/api/v1/players/:playerId", getPlayer);
router.post("/api/v1/players", createPlayer);
router.put("/api/v1/players", updatePlayer);
router.delete("/api/v1/players/:playerId", deletePlayer);
router.put("/api/v1/players/assign", assignToTeam);
router.put("/api/v1/players/transfer", transferToTeam);

export default router;
