import jwt from "jsonwebtoken";
import volleyBallDb from "../config/db";
import { singleRowExtractor } from "../utils/db-utils";

class AuthorizationService {
  async deleteInActiveToken(jwtToken) {
    await volleyBallDb.query(`DELETE FROM user_tokens WHERE token = $1`, [
      jwtToken,
    ]);
  }

  async verifyToken(jwtToken) {
    try {
      if (!jwtToken) {
        return null;
      }

      const res = await volleyBallDb.query(
        `SELECT * FROM user_tokens WHERE token = $1`,
        [jwtToken]
      );
      const userToken = singleRowExtractor.extract(res);

      if (!userToken) {
        return null;
      }

      return jwt.verify(jwtToken, userToken["secret_key"]);
    } catch (e) {
      if (e.name && e.name === "TokenExpiredError") {
        await this.deleteInActiveToken(jwtToken);
        return { status: "failed", code: "AUTH_EXP_401", message: e.message };
      }
      throw e;
    }
  }
}

export default AuthorizationService;
