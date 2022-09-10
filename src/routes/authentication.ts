import { Request, Response, Router } from "express";
import logger from "../logger";
import AuthenticationService from "../services/authentication-service";
import { AuthenticationError } from "../utils/error-utils";
import { toError } from "../utils/response-utils";
import { IAuthenticableRequest, IAuthPayload, INewUserData } from "../utils/types";
import { adminAuthorize, commonAuthorize, requestBodyValidator } from "./authorization";

const authenticationService = new AuthenticationService();
const router = Router();

const register = async (req: Request, res: Response) => {
  try {
    const newUser = await authenticationService.register(req.body as INewUserData);
    res.status(201).json({ status: "success", data: newUser });
  } catch (e) {
    if (e instanceof AuthenticationError) {
      const { errorCode, message } = e as AuthenticationError;
      logger.error(e, `Error while registering new user. ${errorCode}-${message}`);
      if (errorCode === "ROLE_ERR_404") {
        res.status(404).json(toError(e, errorCode, message));
        return;
      }
      res.status(409).json(toError(e, errorCode, message));
      return;
    }
    res.status(500).json(toError(e));
  }
};

const signin = async (req: Request, res: Response) => {
  try {
    const authentication = await authenticationService.signin(req.body as IAuthPayload);
    res.status(200).json(authentication);
  } catch (e) {
    if (e instanceof AuthenticationError) {
      const { errorCode, message } = e as AuthenticationError;
      logger.error(e, `Error while signing in user. ${errorCode}-${message}`);
      if (errorCode === "AUTH_401") {
        res.status(401).json(toError(e, errorCode, message));
        return;
      }

      if (errorCode === "AUTH_403") {
        res.status(403).json(toError(e, errorCode, message));
        return;
      }
    }
    logger.error(e);
    res.status(500).json(toError(e));
  }
};

const allUsers = async (_req: Request, res: Response) => {
  try {
    const users = await authenticationService.getAllUsers();
    res.status(200).json({ status: "success", data: users });
  } catch (e) {
    logger.error(e, "Error while fetching all users");
    res.status(500).json(toError(e));
  }
};
const signout = async (req: IAuthenticableRequest, res: Response) => {
  try {
    const jwtToken = req.authentication || "";
    const user = req.user;
    const logoutAllSessions = req.body.logoutAllSessions;

    await authenticationService.signout(user.username, jwtToken);

    if (logoutAllSessions) {
      await authenticationService.signoutAllSessions(user.username);
    }

    res.status(200).json({ status: "success" });
  } catch (e) {
    logger.error(e, "Error while signing out user");
    res.status(500).json(toError(e));
  }
};

router.post("/vtms/auth/register", requestBodyValidator, register);
router.post("/vtms/auth/signin", signin);
router.get("/vtms/auth/all-users", adminAuthorize, allUsers);
router.post("/vtms/auth/signout", commonAuthorize, signout);

export default router;
