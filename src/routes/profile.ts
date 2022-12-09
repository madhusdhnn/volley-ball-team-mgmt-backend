import { Response, Router } from "express";
import logger from "../logger";
import { toError } from "../utils/response-utils";
import { IAuthenticableRequest } from "../utils/types";
import { commonAuthorize } from "./authorization";

const router = Router();

const getProfile = async (req: IAuthenticableRequest, res: Response) => {
  try {
    const user = req.user;
    res.status(200).json({ status: "success", data: user });
  } catch (e) {
    logger.error(e);
    res.status(500).json(toError(e));
  }
};

router.get("/v1/vtms/api/profile", commonAuthorize, getProfile);

export default router;
