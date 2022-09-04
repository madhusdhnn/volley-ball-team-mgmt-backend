import { Request, Response, Router } from "express";
import PlayerService from "../services/player-service";
import { IAssignPlayerPayload, IAuthenticableRequest, IPlayer } from "../utils/types";
import { toError } from "../utils/response-utils";
import {
  adminAuthorize,
  commonAuthorize,
  currentPlayerTeamAuthorize,
  requestBodyValidator,
  samePlayerAuthorize,
  sameTeamAuthorize,
} from "./authorization";
import { AuthenticationError, IllegalArgumentError } from "../utils/error-utils";

const playerService = new PlayerService();
const playerRouter = Router();

const fetchPlayerUnitsMetadata = async (_req: Request, res: Response) => {
  try {
    const playerUnits = await playerService.getPlayerUnits();
    res.json({ status: "success", data: playerUnits });
  } catch (e) {
    res.status(500).json(toError(e));
  }
};

const createPlayer = async (req: IAuthenticableRequest, res: Response) => {
  try {
    const player = await playerService.createPlayer(req.body as Partial<IPlayer>);
    res.status(201).json({ status: "success", data: player });
  } catch (e) {
    if (e.name === "AuthenticationError") {
      const { errorCode } = e as AuthenticationError;
      res.status(400).json(toError(e, errorCode));
      return;
    }
    res.status(500).json(toError(e, "ERR_500", "Error creating player"));
  }
};

const getAllPlayers = async (_req: Request, res: Response) => {
  try {
    const players = await playerService.getAllPlayers();
    res.json({ status: "success", data: players });
  } catch (e) {
    res.status(500).json(toError(e));
  }
};

const getPlayer = async (req: Request, res: Response) => {
  try {
    const playerId = req.params["playerId"];
    const player = await playerService.getPlayer(parseInt(playerId));
    if (!player) {
      res.status(404).json({ status: "failed", message: "Data not found" });
      return;
    }
    res.json({ status: "success", data: player });
  } catch (e) {
    res.status(500).json(toError(e));
  }
};

const getAllPlayersInTeam = async (req: Request, res: Response) => {
  try {
    const teamId = req.params["teamId"];
    const players = await playerService.getAllPlayersInTeam(parseInt(teamId));
    res.json({ status: "success", data: players });
  } catch (e) {
    res.status(500).json(toError(e));
  }
};

const updatePlayer = async (req: Request, res: Response) => {
  try {
    await playerService.updatePlayer(req.body as IPlayer);
    res.json({ status: "success" });
  } catch (e) {
    res.status(500).json(toError(e));
  }
};

const deletePlayer = async (req: Request, res: Response) => {
  try {
    const playerId = req.params["playerId"];
    await playerService.deletePlayer(parseInt(playerId));
    res.json({ status: "success" });
  } catch (e) {
    res.status(500).json(toError(e));
  }
};

const assignToTeam = async (req: Request, res: Response) => {
  try {
    const { playerIds, teamId } = req.body as IAssignPlayerPayload;
    await playerService.assignToTeam(playerIds, teamId);
    res.json({ status: "success" });
  } catch (e) {
    if (e.name === "IllegalArgumentError") {
      res.status(400).json(toError(e as IllegalArgumentError, "ACC_PLAYER_400"));
      return;
    }
    res.status(500).json(toError(e, "ERR_500", "Unable to assign players to a team"));
  }
};

const unassignFromTeam = async (req: Request, res: Response) => {
  try {
    const playerId = req.params["playerId"];
    await playerService.unassignFromTeam(parseInt(playerId));
    res.status(200).json({ status: "success" });
  } catch (e) {
    res.status(500).json(toError(e, "ERR_500", "Unable to remove player from the team."));
  }
};

const transferToTeam = async (req: Request, res: Response) => {
  try {
    const { toTeamId, playerId } = req.body;
    await playerService.transferToTeam(toTeamId, playerId);
    res.json({ status: "success" });
  } catch (e) {
    res.status(500).json(toError(e, "ERR_500", "Unable to transfer the player to new team."));
  }
};

const getAllPlayerNotInTeam = async (_req: Request, res: Response) => {
  try {
    const players = await playerService.getAllPlayersNotInTeam();
    res.json({
      status: "success",
      data: players,
    });
  } catch (e) {
    res.status(500).json(toError(e));
  }
};

playerRouter.get("/vtms/api/v1/players/metadata", commonAuthorize, fetchPlayerUnitsMetadata);
playerRouter.get("/vtms/api/v1/teams/:teamId/players", commonAuthorize, sameTeamAuthorize, getAllPlayersInTeam);
playerRouter.get(
  "/vtms/api/v1/teams/:teamId/players/:playerId",
  commonAuthorize,
  currentPlayerTeamAuthorize,
  getPlayer,
);
playerRouter.put("/vtms/api/v1/players", adminAuthorize, samePlayerAuthorize, updatePlayer);
playerRouter.get("/vtms/api/v1/players/available", adminAuthorize, getAllPlayerNotInTeam);
playerRouter.put("/vtms/api/v1/players/unassign/:playerId", adminAuthorize, unassignFromTeam);
playerRouter.get("/vtms/api/v1/players/:playerId", adminAuthorize, getPlayer);
playerRouter.get("/vtms/api/v1/players", adminAuthorize, getAllPlayers);
playerRouter.post("/vtms/api/v1/players", requestBodyValidator, adminAuthorize, createPlayer);
playerRouter.put("/vtms/api/v1/players/assign", requestBodyValidator, adminAuthorize, assignToTeam);
playerRouter.put("/vtms/api/v1/players/transfer", requestBodyValidator, adminAuthorize, transferToTeam);
playerRouter.delete("/vtms/api/v1/players/:playerId", adminAuthorize, deletePlayer);

export default playerRouter;
