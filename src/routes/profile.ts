import { Response, Router } from "express";
import { IAuthenticableRequest } from "../utils/types";
import { toError } from "../utils/response-utils";
import { commonAuthorize } from "./authorization";

const router = Router();

const getProfile = async (req: IAuthenticableRequest, res: Response) => {
  try {
    const user = req.user;
    res.status(200).json({ status: "success", data: user });
  } catch (e) {
    res.status(500).json(toError(e));
  }
};

router.get("/vtms/api/v1/profile", commonAuthorize, getProfile);

export default router;
