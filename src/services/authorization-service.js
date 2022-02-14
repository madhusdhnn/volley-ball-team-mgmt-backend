import jwt from "jsonwebtoken";
import volleyBallDb from "../config/db";
import { singleRowExtractor } from "../utils/db-utils";
import crypto from "crypto";
import { generateHash } from "../utils/auth-utils";
class AuthorizationService {
  async deleteInActiveToken(refreshToken) {
    await volleyBallDb.query(
      `DELETE FROM user_tokens WHERE refresh_token = $1`,
      [refreshToken]
    );
  }

  async verifyToken(jwtToken) {
    try {
      if (!jwtToken) {
        return {
          status: "failed",
          code: "AUTH_ERR_401",
          message: "Auth token is invalid",
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

  async verifyRefreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        return {
          status: "failed",
          code: "AUTH_REFRESH_ERR_401",
          message: "Refresh token not found in the request",
        };
      }

      const res = await volleyBallDb.query(
        `SELECT * from user_tokens WHERE refresh_token = $1`,
        [refreshToken]
      );

      const userToken = singleRowExtractor.extract(res);
      if (!userToken) {
        return {
          status: "failed",
          code: "AUTH_REFRESH_ERR_401",
          message: "Invalid refresh token. Please sign-in to continue",
        };
      }

      const decoded = jwt.verify(refreshToken, userToken["refresh_secret"], {
        issuer: process.env.ISSUER,
      });

      const expectedHash = decoded.id;
      const actualHash = generateHash(decoded.username);

      if (actualHash !== expectedHash) {
        return {
          status: "failed",
          code: "AUTH_REFRESH_ERR_401",
          message: "Unauthorized client",
        };
      }

      return {
        status: "success",
        data: decoded.username,
      };
    } catch (e) {
      if (e.name && e.name === "TokenExpiredError") {
        await this.deleteInActiveToken(refreshToken);
        return {
          status: "failed",
          code: "AUTH_REFRESH_EXP_401",
          message: "Refresh token expired. Please sign-in to continue",
        };
      }
      throw e;
    }
  }
}

export default AuthorizationService;
