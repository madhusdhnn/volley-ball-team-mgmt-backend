import { Request, Response, Router } from "express";
import AuthenticationService from "../services/authentication-service";
import { AuthenticableRequest, AuthPayload, NewUserData } from "../utils/types";
import { AuthenticationError } from "../utils/error-utils";
import { toError } from "../utils/response-utils";
import {
  adminAuthorize,
  commonAuthorize,
  requestBodyValidator,
} from "./authorization";

const authenticationService = new AuthenticationService();
const router = Router();

const register = async (req: Request, res: Response) => {
  try {
    const newUser = await authenticationService.register(
      req.body as NewUserData
    );
    res.status(201).json({ status: "success", data: newUser });
  } catch (e) {
    console.error(e);
    if (e.name && e.name === "AuthenticationError") {
      const { errorCode, message } = e as AuthenticationError;
      res.status(409).json(toError(e, errorCode, message));
      return;
    }
    res.status(500).json(toError(e));
  }
};

const signin = async (req: Request, res: Response) => {
  try {
    const authentication = await authenticationService.signin(
      req.body as AuthPayload
    );
    res.status(200).json(authentication);
  } catch (e: any) {
    console.error(e);
    if (e.name && e.name === "AuthenticationError") {
      const { errorCode, message } = e as AuthenticationError;
      if (errorCode === "AUTH_401") {
        res.status(401).json(toError(e, errorCode, message));
        return;
      }

      if (errorCode === "AUTH_403") {
        res.status(403).json(toError(e, errorCode, message));
        return;
      }
    }
    res.status(500).json(toError(e));
  }
};

const allUsers = async (_req: Request, res: Response) => {
  try {
    const users = await authenticationService.getAllUsers();
    res.status(200).json({ status: "success", data: users });
  } catch (e) {
    res.status(500).json(toError(e));
  }
};
const signout = async (req: AuthenticableRequest, res: Response) => {
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
    console.error(e);
    res.status(500).json(toError(e));
  }
};

router.post("/vtms/auth/register", requestBodyValidator, register);
router.post("/vtms/auth/signin", signin);
router.get("/vtms/auth/all-users", adminAuthorize, allUsers);
router.post("/vtms/auth/signout", commonAuthorize, signout);

export default router;