import jwt from "jsonwebtoken";
import volleyBallDb from "../config/db";
import { singleRowExtractor } from "../utils/db-utils";

class AuthorizationService {
  async verifyToken(jwtToken) {
    try {
      if (!jwtToken) {
        return {
          status: "failed",
          code: "AUTH_ERR_401",
          message: "Auth token not found in the request",
        };
      }

      const res = await volleyBallDb.query(
        `SELECT * FROM user_tokens WHERE token = $1`,
        [jwtToken]
      );
      const userToken = singleRowExtractor.extract(res);

      if (!userToken) {
        return {
          status: "failed",
          code: "AUTH_ERR_401",
          message: "Invalid Auth token",
        };
      }

      return {
        status: "success",
        data: jwt.verify(jwtToken, userToken["secret_key"], {
          issuer: process.env.ISSUER,
        }),
      };
    } catch (e) {
      if (e.name && e.name === "TokenExpiredError") {
        return { status: "failed", code: "AUTH_EXP_401", message: e.message };
      }
      throw e;
    }
  }
}

export default AuthorizationService;
