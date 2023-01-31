import { Router } from "express";
import {
  assignToTeam,
  createPlayer,
  deletePlayer,
  fetchPlayerUnitsMetadata,
  getAllPlayers,
  getAllPlayersInTeam,
  getPlayer,
  transferToTeam,
  unassignFromTeam,
  updatePlayer,
} from "../controllers/players-controller";
import {
  adminAuthorize,
  commonAuthorize,
  currentPlayerTeamAuthorize,
  requestBodyValidator,
  samePlayerAuthorize,
  sameTeamAuthorize,
} from "./authorization-middleware";

const playerRouter = Router();
const baseUrl = "/v1/vtms/api";
const playersUrl = `${baseUrl}/players`;

playerRouter.post(playersUrl, requestBodyValidator, adminAuthorize, createPlayer);
playerRouter.get(`${playersUrl}/metadata`, commonAuthorize, fetchPlayerUnitsMetadata);
playerRouter.get(`${playersUrl}/teams/:teamId`, commonAuthorize, sameTeamAuthorize, getAllPlayersInTeam);
playerRouter.get(`${playersUrl}/:playerId`, commonAuthorize, currentPlayerTeamAuthorize, getPlayer);
playerRouter.get(playersUrl, adminAuthorize, getAllPlayers);
playerRouter.put(playersUrl, commonAuthorize, samePlayerAuthorize, updatePlayer);
playerRouter.patch(`${playersUrl}/unassign/:playerId`, adminAuthorize, unassignFromTeam);
playerRouter.patch(`${playersUrl}/assign`, requestBodyValidator, adminAuthorize, assignToTeam);
playerRouter.patch(`${playersUrl}/transfer`, requestBodyValidator, adminAuthorize, transferToTeam);
playerRouter.delete(`${playersUrl}/:playerId`, adminAuthorize, deletePlayer);

export default playerRouter;
