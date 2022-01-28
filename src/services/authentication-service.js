import crypto from "crypto";
import volleyBallDb from "../config/db";
import { singleRowExtractor } from "../utils/db-utils";
import RoleService from "./role-service";
import jwt from "jsonwebtoken";
import { BcryptPasswordEncoder } from "../utils/auth-utils";

class AuthenticationService {
  constructor() {
    this.passwordEncoder = new BcryptPasswordEncoder();
    this.roleService = new RoleService();
  }

  generateSecureRandomKey() {
    return crypto.randomBytes(32).toString("hex");
  }

  async register(userData) {
    const { username, password, roleId } = userData;
    const roleExists = await this.roleService.verifyRole(roleId);
    if (!roleExists) {
      return {
        status: "failure",
        code: "ROLE_ERR_404",
        error: `Role with id ${roleId} does not exists`,
      };
    }
    const hashed = this.passwordEncoder.encode(password);
    await volleyBallDb.query(
      `INSERT INTO users (username, password, enabled, role_id, created_at, updated_at)
          VALUES ($1, $2, $3, $4, now(), now())`,
      [username, hashed, true, roleId]
    );
    return { status: "success" };
  }

  async authenticate(payload) {
    const res = await volleyBallDb.query(
      `SELECT u.username,
              u.password,
              u.enabled,
              r.role_id,
              r.name AS role_name,
              u.created_at,
              u.updated_at
        FROM users u
              JOIN roles r ON u.role_id = r.role_id
        WHERE username = $1`,
      [payload.username]
    );
    const user = singleRowExtractor.extract(res);

    if (!user) {
      return {
        status: "failed",
        code: "AUTH_401",
        error: "Username and password does not match",
      };
    }

    if (!this.passwordEncoder.matches(payload.password, user.password)) {
      return {
        status: "failed",
        code: "AUTH_401",
        error: "Password is wrong",
      };
    }

    if (!user.enabled) {
      return { status: "failed", code: "AUTH_403", error: "User disabled" };
    }

    const { username, enabled, role_id: roleId, role_name: roleName } = user;

    const secretKey = this.generateSecureRandomKey();
    let token = jwt.sign(
      {
        user: { username, enabled, roleId, roleName },
      },
      secretKey,
      {
        expiresIn: "1h",
        issuer: "VolleyBallGameService",
      }
    );

    await volleyBallDb.query(
      `INSERT INTO user_tokens (username, secret_key, token, last_used)
          VALUES ($1, $2, $3, now())`,
      [username, secretKey, token]
    );

    return { status: "success", accessToken: token };
  }

  async logout(user, jwtToken) {
    await volleyBallDb.query(
      `DELETE FROM user_tokens WHERE username = $1 AND token = $2`,
      [user.username, jwtToken]
    );
    return { status: "success", code: "AUTH_CLEAR_200" };
  }
}

export default AuthenticationService;
