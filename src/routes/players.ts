import { Request, Response, Router } from "express";
import logger from "../logger";
import PlayerService from "../services/player-service";
import { AuthenticationError, IllegalArgumentError, InvalidStateError } from "../utils/error-utils";
import { toError } from "../utils/response-utils";
import { IAssignPlayerPayload, IAuthenticableRequest, IPlayer } from "../utils/types";
import {
  adminAuthorize,
  commonAuthorize,
  currentPlayerTeamAuthorize,
  requestBodyValidator,
  samePlayerAuthorize,
  sameTeamAuthorize,
} from "./authorization";

const playerService = new PlayerService();
const playerRouter = Router();

const fetchPlayerUnitsMetadata = async (_req: Request, res: Response) => {
  try {
    const playerUnits = await playerService.getPlayerUnits();
    res.json({ status: "success", data: playerUnits });
  } catch (e) {
    logger.error(e);
    res.status(500).json(toError(e));
  }
};

const createPlayer = async (req: IAuthenticableRequest, res: Response) => {
  try {
    const player = await playerService.createPlayer(req.body as Partial<IPlayer>);
    res.status(201).json({ status: "success", data: player });
  } catch (e) {
    logger.error(e);
    if (e instanceof AuthenticationError) {
      const { errorCode } = e as AuthenticationError;
      res.status(400).json(toError(e, errorCode, e.message));
      return;
    }
    res.status(500).json(toError(e));
  }
};

const getAllPlayers = async (_req: Request, res: Response) => {
  try {
    const players = await playerService.getAllPlayers();
    res.json({ status: "success", data: players });
  } catch (e) {
    logger.error(e);
    res.status(500).json(toError(e));
  }
};

const getPlayer = async (req: Request, res: Response) => {
  try {
    const playerId = req.params["playerId"];
    const player = await playerService.getPlayer(parseInt(playerId));
    if (!player) {
      res.status(404).json({ status: "failed", message: "Player not found" });
      return;
    }
    res.json({ status: "success", data: player });
  } catch (e) {
    logger.error(e);
    res.status(500).json(toError(e));
  }
};

const getAllPlayersInTeam = async (req: Request, res: Response) => {
  try {
    const teamId = req.params["teamId"];
    const players = await playerService.getAllPlayersInTeam(parseInt(teamId));
    res.json({ status: "success", data: players });
  } catch (e) {
    logger.error(e);
    res.status(500).json(toError(e));
  }
};

const updatePlayer = async (req: Request, res: Response) => {
  try {
    await playerService.updatePlayer(req.body as IPlayer);
    res.json({ status: "success" });
  } catch (e) {
    logger.error(e);
    res.status(500).json(toError(e));
  }
};

const deletePlayer = async (req: Request, res: Response) => {
  try {
    const playerId = req.params["playerId"];
    await playerService.deletePlayer(parseInt(playerId));
    res.json({ status: "success" });
  } catch (e) {
    logger.error(e);
    if (e instanceof InvalidStateError) {
      res.status(400).json(toError(e as InvalidStateError, "ACC_PLAYER_400"));
      return;
    }
    res.status(500).json(toError(e));
  }
};

const assignToTeam = async (req: Request, res: Response) => {
  try {
    const { playerIds, teamId } = req.body as IAssignPlayerPayload;
    await playerService.assignToTeam(playerIds, teamId);
    res.json({ status: "success" });
  } catch (e) {
    logger.error(e);
    if (e instanceof IllegalArgumentError) {
      res.status(400).json(toError(e as IllegalArgumentError, "ACC_PLAYER_400", "Unable to assign players to a team"));
      return;
    }
    res.status(500).json(toError(e));
  }
};

const unassignFromTeam = async (req: Request, res: Response) => {
  try {
    const playerId = req.params["playerId"];
    await playerService.unassignFromTeam(parseInt(playerId));
    res.status(200).json({ status: "success" });
  } catch (e) {
    logger.error(e);
    res.status(500).json(toError(e, "ERR_500", "Unable to remove player from the team."));
  }
};

const transferToTeam = async (req: Request, res: Response) => {
  try {
    const { fromTeamId, toTeamId, playerId } = req.body;
    await playerService.transferToTeam(fromTeamId, toTeamId, playerId);
    res.json({ status: "success" });
  } catch (e) {
    logger.error(e);
    if (e instanceof IllegalArgumentError) {
      res.status(400).json(toError(e, "ACC_PLAYER_400"));
      return;
    }
    res.status(500).json(toError(e));
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
    logger.error(e);
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
