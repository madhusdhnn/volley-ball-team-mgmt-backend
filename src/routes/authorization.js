import AuthorizationService from "../services/authorization-service";
import PlayerService from "../services/player-service";
import TeamsService from "../services/teams-service";
import { toPlayer, toTeam } from "../utils/response-utils";

const authorizationService = new AuthorizationService();
const teamService = new TeamsService();
const playerService = new PlayerService();

const getCurrentPlayer = async (user) => {
  const currentPlayer = await playerService.getCurrentPlayer(user.username);
  return toPlayer(currentPlayer);
};

const authorize = async (jwtToken, roleNames = []) => {
  const decoded = await authorizationService.verifyToken(jwtToken);
  if (!decoded) {
    return {
      status: "failed",
      code: "AUTH_ERR_401",
      message: "Auth token is invalid",
    };
  }

  if (decoded.code && decoded.code === "AUTH_EXP_401") {
    return { ...decoded };
  }

  if (!roleNames.includes(decoded.user.roleName)) {
    return {
      status: "failed",
      code: "AUTH_ROLE_401",
      message: `You are not authorized to perform this action`,
    };
  }

  return {
    status: "success",
    user: decoded.user,
    authentication: jwtToken,
  };
};

const adminAuthorize = async (req, res, next) => {
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
      const auth = await authorize(jwtToken, "ADMIN");
      if (auth.status && auth.status === "failed") {
        res.status(401).json(auth);
      } else {
        req.user = auth.user;
        req.authentication = auth.authentication;
        req.isAdmin = auth.user.roleName === "ADMIN";
        next();
      }
    }
  } catch (e) {
    res.status(500).json({ error: e.message || "Something went wrong" });
  }
};

const playerAuthorize = async (req, res, next) => {
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
      const auth = await authorize(jwtToken, "PLAYER");
      if (auth.status && auth.status === "failed") {
        res.status(401).json(auth);
      } else {
        req.user = auth.user;
        req.authentication = auth.authentication;
        next();
      }
    }
  } catch (e) {
    res.status(500).json({ error: e.message || "Something went wrong" });
  }
};

const commonAuthorize = async (req, res, next) => {
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
      const auth = await authorize(jwtToken, ["ADMIN", "PLAYER"]);
      if (auth.status && auth.status === "failed") {
        res.status(401).json(auth);
      } else {
        req.user = auth.user;
        req.authentication = auth.authentication;
        req.isAdmin = auth.user.roleName === "ADMIN";
        next();
      }
    }
  } catch (e) {
    res.status(500).json({ error: e.message || "Something went wrong" });
  }
};

const sameTeamAuthorize = async (req, res, next) => {
  try {
    const user = req.user;
    const teamId = req.params["teamId"];

    if (!teamId) {
      res.status(401).json({
        status: "failed",
        code: "AUTH_TEAM_401",
        message: "Team Id not found in the request",
      });
    } else {
      const team = toTeam(await teamService.getTeam(teamId));
      const currentPlayer = await getCurrentPlayer(user);

      if (req.isAdmin || currentPlayer.team.id === team.teamId) {
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
    res.status(500).json({
      status: "failed",
      error: "Something went wrong",
    });
  }
};

const samePlayerAuthorize = async (req, res, next) => {
  try {
    const user = req.user;
    const playerId = req.params["playerId"] || req.body["playerId"];

    const currentPlayer = await getCurrentPlayer(user);
    const player = toPlayer(await playerService.getPlayer(playerId));

    if (currentPlayer.playerId === player.playerId) {
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
    res.status(500).json({
      status: "failed",
      error: "Something went wrong",
    });
  }
};

const currentPlayerTeamAuthorize = async (req, res, next) => {
  try {
    const user = req.user;
    const playerId = req.params["playerId"];

    const currentPlayer = await getCurrentPlayer(user);
    const player = toPlayer(await playerService.getPlayer(playerId));

    if (req.isAdmin || currentPlayer.team.id === player.team.id) {
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
    res.status(500).json({
      status: "failed",
      error: "Something went wrong",
    });
  }
};

export {
  adminAuthorize,
  playerAuthorize,
  commonAuthorize,
  sameTeamAuthorize,
  samePlayerAuthorize,
  currentPlayerTeamAuthorize,
};
