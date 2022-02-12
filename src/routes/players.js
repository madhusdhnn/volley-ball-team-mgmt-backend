import { Router } from "express";
import PlayerService from "../services/player-service";
import { toError, toPlayer } from "../utils/response-utils";
import {
  adminAuthorize,
  commonAuthorize,
  currentPlayerTeamAuthorize,
  samePlayerAuthorize,
  sameTeamAuthorize,
} from "./authorization";

const playerService = new PlayerService();
const playerRouter = Router();

const fetchPlayerUnitsMetadata = async (req, res) => {
  try {
    const playerUnits = await playerService.getPlayerUnits();
    playerUnits.status = "success";
    res.json(playerUnits);
  } catch (e) {
    console.error(e);
    res.status(500).json(toError());
  }
};

const createPlayer = async (req, res) => {
  try {
    const player = await playerService.createPlayer(req.body);
    res.status(201).json({ status: "success", data: toPlayer(player) });
  } catch (e) {
    console.error(e);
    res.status(500).json(toError(e, "PL_100", "Error creating player"));
  }
};

const getAllPlayers = async (req, res) => {
  try {
    const players = await playerService.getAllPlayers();
    res.json({ status: "success", data: players.map((pl) => toPlayer(pl)) });
  } catch (e) {
    console.error(e);
    res.status(500).json(toError());
  }
};

const getPlayer = async (req, res) => {
  try {
    const playerId = req.params["playerId"];
    const player = await playerService.getPlayer(playerId);
    res.json({ status: "success", data: toPlayer(player) });
  } catch (e) {
    console.error(e);
    res.status(500).json(toError());
  }
};

const getAllPlayersInTeam = async (req, res) => {
  try {
    const teamId = req.params["teamId"];
    const players = await playerService.getAllPlayersInTeam(teamId);
    res.json({ status: "success", data: players.map((pl) => toPlayer(pl)) });
  } catch (e) {
    console.error(e);
    res.status(500).json(toError());
  }
};

const updatePlayer = async (req, res) => {
  try {
    const player = await playerService.updatePlayer(req.body);
    res.json({ status: "success", data: toPlayer(player) });
  } catch (e) {
    console.error(e);
    res.status(500).json(toError());
  }
};

const deletePlayer = async (req, res) => {
  try {
    await playerService.deletePlayer(req.params["playerId"]);
    res.json({ status: "success", message: "Deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "failed", error: "Something went wrong!" });
  }
};

const assignToTeam = async (req, res) => {
  try {
    const { playerIds, teamId } = req.body;
    const resp = await playerService.assignToTeam(playerIds, teamId);
    if (resp.error) {
      res.status(400).json(resp);
    } else {
      res.json(resp);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({
      status: "failed",
      error: `Unable to assign to team. Reason: ${
        e.detail || e.message || "Something went wrong"
      }`,
    });
  }
};

const transferToTeam = async (req, res) => {
  try {
    const { playerId, currentTeamId, newTeamId } = req.body;
    const player = await playerService.transferToTeam(
      currentTeamId,
      newTeamId,
      playerId
    );
    if (player.error) {
      res.status(422).json({ status: "failed", error: player.error });
    } else {
      res.json({ status: "success", data: toPlayer(player) });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({
      status: "failed",
      error: `Unable to transfer the player to new team. Reason: ${e.detail}`,
    });
  }
};

const getAllPlayerNotInTeam = async (req, res) => {
  try {
    const players = await playerService.getAllPlayerNotInTeam();
    res.json({
      status: "success",
      data: players.map((_player) => toPlayer(_player)),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "failed", error: "Something went wrong!" });
  }
};

playerRouter.get(
  "/vbms/api/v1/players/metadata",
  commonAuthorize,
  fetchPlayerUnitsMetadata
);
playerRouter.get(
  "/vbms/api/v1/teams/:teamId/players",
  commonAuthorize,
  sameTeamAuthorize,
  getAllPlayersInTeam
);
playerRouter.get(
  "/vbms/api/v1/teams/:teamId/players/:playerId",
  commonAuthorize,
  currentPlayerTeamAuthorize,
  getPlayer
);
playerRouter.put(
  "/vbms/api/v1/players",
  commonAuthorize,
  samePlayerAuthorize,
  updatePlayer
);
playerRouter.get(
  "/vbms/api/v1/players/available",
  adminAuthorize,
  getAllPlayerNotInTeam
);
playerRouter.get("/vbms/api/v1/players", adminAuthorize, getAllPlayers);
playerRouter.post("/vbms/api/v1/players", adminAuthorize, createPlayer);
playerRouter.put("/vbms/api/v1/players/assign", adminAuthorize, assignToTeam);
playerRouter.put(
  "/vbms/api/v1/players/transfer",
  adminAuthorize,
  transferToTeam
);
playerRouter.delete(
  "/vbms/api/v1/players/:playerId",
  adminAuthorize,
  deletePlayer
);

export default playerRouter;
