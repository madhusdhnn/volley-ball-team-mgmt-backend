import { NextFunction, Request, Response } from "express";
import AuthorizationService from "../services/authorization-service";
import PlayerService from "../services/player-service";
import TeamsService from "../services/teams-service";
import { IAuthenticableRequest, IPlayer } from "../utils/types";
import { toError } from "../utils/response-utils";
import { DatabaseError } from "pg";

const authorizationService = new AuthorizationService();
const teamService = new TeamsService();
const playerService = new PlayerService();

const getCurrentPlayer = async (username: string): Promise<IPlayer> => {
  return await playerService.getCurrentPlayer(username);
};

type Authorization = {
  status: "failed" | "success";
  code?: string;
  message?: string;
  user?: any;
  authentication?: string;
};

/**
 * Perform the authorization with necessary details
 */
const authorize = async (jwtToken: string, roleNames: string[] = []): Promise<Authorization> => {
  try {
    const jwtDecoded = await authorizationService.verifyToken(jwtToken);
    if (!roleNames.includes(jwtDecoded.user.role.name)) {
      return {
        status: "failed",
        code: "AUTH_ROLE_401",
        message: `You are not authorized to perform this action`,
      };
    }
    return {
      status: "success",
      user: jwtDecoded.user,
      authentication: jwtToken,
    };
  } catch (e) {
    if (e.name && e.name === "AuthenticationError") {
      return { status: "failed", code: "AUTH_ERR_401", message: e.message };
    }

    if (e.name && e.name === "TokenExpiredError") {
      return { status: "failed", code: "AUTH_EXP_401", message: "Auth token expired" };
    }

    return { status: "failed", code: "ERR_500", message: e.message };
  }
};

/**
 * Prepare authorization by doing necessary validations for the request and then performs authorization
 */
const authorizeUser = async (
  req: IAuthenticableRequest,
  res: Response,
  next: NextFunction,
  roleNames: string[] = [],
) => {
  const authHeader = req.headers.authorization;
  const jwtToken = authHeader?.split(" ")[1];

  if (!jwtToken) {
    res.status(401).json({
      status: "failed",
      code: "AUTH_401",
      error: "Unauthorized! Auth token not found in header",
    });
    return;
  }

  const authorization = await authorize(jwtToken, roleNames);

  if (authorization.status === "failed") {
    res.status(401).json(authorization);
    return;
  }

  req.user = authorization.user;
  req.authentication = authorization.authentication;
  req.isAdmin = authorization.user.role.name === "ADMIN";
  next();
};

/**
 * Authorize only ADMIN users
 */
const adminAuthorize = async (req: IAuthenticableRequest, res: Response, next: NextFunction) => {
  await authorizeUser(req, res, next, ["ADMIN"]);
};

/**
 * Authorize all kinds of users (ADMIN, PLAYER, etc)
 */
const commonAuthorize = async (req: IAuthenticableRequest, res: Response, next: NextFunction) => {
  await authorizeUser(req, res, next, ["ADMIN", "PLAYER"]);
};

/**
 * Authorize user to view the details of the team that he/ she belongs to.
 * NOTE: ADMIN user is always allowed.
 */
const sameTeamAuthorize = async (req: IAuthenticableRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const teamId = req.params["teamId"];

    if (!teamId) {
      res.status(401).json({
        status: "failed",
        code: "AUTH_TEAM_401",
        message: "Team ID not found in the request",
      });
      return;
    }

    const teamInRequest = await teamService.getTeam(parseInt(teamId));
    const currentPlayer = await getCurrentPlayer(user.username);

    if (req.isAdmin || currentPlayer.team?.id === teamInRequest.id) {
      req.player = currentPlayer;
      next();
      return;
    }

    res.status(401).json({
      status: "failed",
      code: "AUTH_TEAM_401",
      message: "You are not authorized to perform this action",
    });
  } catch (e) {
    res.status(500).json(toError(e));
  }
};

/**
 * Authorize user to update only his/ her own profile details.
 * NOTE: ADMIN user can perform this action by default.
 */
const samePlayerAuthorize = async (req: IAuthenticableRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const playerId = req.params["playerId"] || req.body["playerId"] || req.body["id"];

    const currentPlayer = await getCurrentPlayer(user.username);
    const playerInRequest = await playerService.getPlayer(parseInt(playerId));

    if (req.isAdmin || currentPlayer.id === playerInRequest.id) {
      req.player = currentPlayer;
      next();
      return;
    }
    res.status(401).json({
      status: "failed",
      code: "AUTH_PLAYER_401",
      message: "You are not authorized to perform this action",
    });
  } catch (e) {
    console.log(JSON.stringify(e));
    console.log(JSON.stringify(e instanceof DatabaseError ? (e as DatabaseError) : "{}"));

    res.status(500).json(toError(e));
  }
};

/**
 * Authorize user to view a player details if the player and the authenticated user are in same team.
 * NOTE: ADMIN user is always allowed.
 */
const currentPlayerTeamAuthorize = async (req: IAuthenticableRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const playerId = req.params["playerId"];

    const currentPlayer = await getCurrentPlayer(user.username);
    const playerInRequest = await playerService.getPlayer(parseInt(playerId));

    if (req.isAdmin || currentPlayer.team?.id === playerInRequest.team?.id) {
      req.player = currentPlayer;
      next();
      return;
    }

    res.status(401).json({
      status: "failed",
      code: "AUTH_PLAYER_401",
      message: "You are not authorized to perform this action",
    });
  } catch (e) {
    res.status(500).json(toError(e));
  }
};

/**
 * Ensure request body is sent for those requests that supports
 */
const requestBodyValidator = async (req: Request, res: Response, next: NextFunction) => {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({ status: "failed", message: "Request body is missing" });
    return;
  }
  next();
};

const internalAdminAuthorize = async (req: Request, res: Response, next: NextFunction) => {
  const adminApiKey = req.headers["x-api-key"];
  if (!adminApiKey || adminApiKey !== process.env.ADMIN_API_KEY) {
    res.status(403).json({ error: "You are not authorized to perform this action" });
    return;
  }
  next();
};

export {
  adminAuthorize,
  commonAuthorize,
  sameTeamAuthorize,
  samePlayerAuthorize,
  currentPlayerTeamAuthorize,
  requestBodyValidator,
  internalAdminAuthorize,
};
