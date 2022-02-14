import AuthorizationService from "../services/authorization-service";
import PlayerService from "../services/player-service";
import TeamsService from "../services/teams-service";
import { toError, toPlayer, toTeam } from "../utils/response-utils";

const authorizationService = new AuthorizationService();
const teamService = new TeamsService();
const playerService = new PlayerService();

const getCurrentPlayer = async (user) => {
  const currentPlayer = await playerService.getCurrentPlayer(user.username);
  return toPlayer(currentPlayer);
};

const authorize = async (jwtToken, roleNames = []) => {
  const authorization = await authorizationService.verifyToken(jwtToken);
  if (authorization.status === "failed") {
    return { ...authorization };
  }

  const { data } = authorization;

  if (!roleNames.includes(data.user.roleName)) {
    return {
      status: "failed",
      code: "AUTH_ROLE_401",
      message: `You are not authorized to perform this action`,
    };
  }

  return {
    status: "success",
    user: data.user,
    authentication: jwtToken,
  };
};

const authorizeUser = async (req, res, next, roleNames = []) => {
  try {
    const authHeader = req.headers["authorization"];
    const jwtToken = authHeader && authHeader.split(" ")[1];
    if (!jwtToken) {
      res.status(401).json({
        status: "failed",
        code: "AUTH_401",
        error: "Auth token not found in header",
      });
    } else {
      const authorization = await authorize(jwtToken, roleNames);
      if (authorization.status === "failed") {
        res.status(401).json(authorization);
      } else {
        req.user = authorization.user;
        req.authentication = authorization.authentication;
        req.isAdmin = authorization.user.roleName === "ADMIN";
        next();
      }
    }
  } catch (e) {
    res.status(500).json(toError(e));
  }
};

const adminAuthorize = async (req, res, next) => {
  await authorizeUser(req, res, next, ["ADMIN"]);
};

const commonAuthorize = async (req, res, next) => {
  await authorizeUser(req, res, next, ["ADMIN", "PLAYER"]);
};

const sameTeamAuthorize = async (req, res, next) => {
  try {
    const user = req.user;
    const teamId = req.params["teamId"];

    if (!teamId) {
      res.status(401).json({
        status: "failed",
        code: "AUTH_TEAM_401",
        message: "Team ID not found in the request",
      });
    } else {
      const teamInRequest = toTeam(await teamService.getTeam(teamId));
      const currentPlayer = await getCurrentPlayer(user);

      if (req.isAdmin || currentPlayer.team.id === teamInRequest.teamId) {
        req.player = currentPlayer;
        next();
      } else {
        res.status(401).json({
          status: "failed",
          code: "AUTH_TEAM_401",
          message: "You are not authorized to perform this action",
        });
      }
    }
  } catch (e) {
    console.error(e);
    res.status(500).json(toError(e));
  }
};

const samePlayerAuthorize = async (req, res, next) => {
  try {
    const user = req.user;
    const playerId = req.params["playerId"] || req.body["playerId"];

    const currentPlayer = await getCurrentPlayer(user);
    const playerInRequest = toPlayer(await playerService.getPlayer(playerId));

    if (req.isAdmin || currentPlayer.playerId === playerInRequest.playerId) {
      req.player = currentPlayer;
      next();
    } else {
      res.status(401).json({
        status: "failed",
        code: "AUTH_PLAYER_401",
        message: "You are not authorized to perform this action",
      });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json(toError(e));
  }
};

const currentPlayerTeamAuthorize = async (req, res, next) => {
  try {
    const user = req.user;
    const playerId = req.params["playerId"];

    const currentPlayer = await getCurrentPlayer(user);
    const playerInRequest = toPlayer(await playerService.getPlayer(playerId));

    if (req.isAdmin || currentPlayer.team.id === playerInRequest.team.id) {
      req.player = currentPlayer;
      next();
    } else {
      res.status(401).json({
        status: "failed",
        code: "AUTH_PLAYER_401",
        message: "You are not authorized to perform this action",
      });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json(toError(e));
  }
};
const refreshTokenAuthorize = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const authorization = await authorizationService.verifyRefreshToken(
      refreshToken
    );
    if (authorization.status === "failed") {
      res.status(401).json(authorization);
    } else {
      req.username = authorization.data;
      next();
    }
  } catch (e) {
    console.error(e);
    res.status(500).json(toError(e));
  }
};

export {
  adminAuthorize,
  commonAuthorize,
  sameTeamAuthorize,
  samePlayerAuthorize,
  currentPlayerTeamAuthorize,
  refreshTokenAuthorize,
};
