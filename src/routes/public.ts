import { Request, Response, Router } from "express";

const router = Router();

const responseCodes = Object.freeze({
  clientErrors: {
    unAuthorized: [
      "AUTH_401",
      "AUTH_ERR_401",
      "AUTH_EXP_401",
      "AUTH_REFRESH_ERR_401",
      "AUTH_ROLE_401",
      "AUTH_PLAYER_401",
      "ACC_401",
    ],
    badRequest: ["ACC_TEAM_400", "ACC_PLAYER_400"],
    forbidden: ["AUTH_403", "ACC_ROLE_403", "ACC_TEAM_403", "ACC_PLAYER_403"],
    notFound: ["AUTH_TEAM_404", "ROLE_ERR_404"],
  },
  serverErrors: ["ERR_500"],
});

const getResponseCodes = async (_req: Request, res: Response) => {
  res.status(200).json({ status: "success", data: responseCodes });
};

router.get("/vtms/api/v1/supported-response-codes", getResponseCodes);

export default router;
