import { Request, Response } from "express";
import logger from "../logger";
import PlayerService from "../services/player-service";
import { AuthenticationError, IllegalArgumentError, InvalidStateError } from "../utils/error-utils";
import { parsePaginationInput } from "../utils/request-utils";
import { toError } from "../utils/response-utils";
import { IAssignPlayerPayload, IAuthenticableRequest, IPlayer } from "../utils/types";

const playerService = new PlayerService();
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

const getAllPlayers = async (req: Request, res: Response) => {
  try {
    const { page, count } = parsePaginationInput(req);
    const type = req.query["type"] as string;

    const result = await playerService.getAllPlayers(type?.toUpperCase(), page, count);
    res.json({ status: "success", data: { players: result.data, pagination: result.pagination } });
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
    res.status(204).end();
  } catch (e) {
    logger.error(e);
    res.status(500).json(toError(e));
  }
};

const deletePlayer = async (req: Request, res: Response) => {
  try {
    const playerId = req.params["playerId"];
    await playerService.deletePlayer(parseInt(playerId));
    res.status(204).end();
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
    res.status(204).end();
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
    res.status(204).end();
  } catch (e) {
    logger.error(e);
    res.status(500).json(toError(e, "ERR_500", "Unable to remove player from the team."));
  }
};

const transferToTeam = async (req: Request, res: Response) => {
  try {
    const { fromTeamId, toTeamId, playerId } = req.body;
    await playerService.transferToTeam(fromTeamId, toTeamId, playerId);
    res.status(204).end();
  } catch (e) {
    logger.error(e);
    if (e instanceof IllegalArgumentError) {
      res.status(400).json(toError(e, "ACC_PLAYER_400"));
      return;
    }
    res.status(500).json(toError(e));
  }
};

export {
  createPlayer,
  fetchPlayerUnitsMetadata,
  getAllPlayersInTeam,
  getPlayer,
  getAllPlayers,
  updatePlayer,
  unassignFromTeam,
  assignToTeam,
  transferToTeam,
  deletePlayer,
};
