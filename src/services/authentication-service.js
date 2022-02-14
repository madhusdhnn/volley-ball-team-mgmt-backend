import crypto from "crypto";
import volleyBallDb from "../config/db";
import { singleRowExtractor } from "../utils/db-utils";
import RoleService from "./role-service";
import jwt from "jsonwebtoken";
import {
  BcryptPasswordEncoder,
  generateHash,
  generateSecureRandomKey,
} from "../utils/auth-utils";

class AuthenticationService {
  constructor() {
    this.passwordEncoder = new BcryptPasswordEncoder();
    this.roleService = new RoleService();
  }

  async register(userData) {
    const { username, firstName, lastName, password, roleId } = userData;
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
      `INSERT INTO users (username, password, enabled, first_name, last_name, role_id, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, now(), now())`,
      [username, hashed, true, firstName, lastName, roleId]
    );
    return { status: "success" };
  }

  async authenticate(payload) {
    const res = await volleyBallDb.query(
      `SELECT u.username,
              u.password,
              u.enabled,
              u.first_name,
              u.last_name,
              u.profile_image_url,
              u.email_id,
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

    const {
      username,
      enabled,
      first_name: firstName,
      last_name: lastName,
      role_id: roleId,
      role_name: roleName,
      profile_image_url: profileImageUrl,
      email_id: emailId,
    } = user;

    const secretKey = generateSecureRandomKey();
    const refreshSecretKey = generateSecureRandomKey();

    const userTokenData = {
      username,
      enabled,
      firstName,
      lastName,
      fullName: firstName + " " + lastName,
      roleId,
      roleName,
      profileImageUrl,
      emailId,
    };

    let token = jwt.sign({ user: { ...userTokenData } }, secretKey, {
      expiresIn: "1h",
      issuer: "VBMSAuthService",
      subject: userTokenData.username,
    });

    let refreshToken = jwt.sign(
      { id: generateHash(username), username },
      refreshSecretKey,
      {
        expiresIn: "3h",
        issuer: "VBMSAuthService",
        subject: userTokenData.username,
      }
    );

    await volleyBallDb.query(
      `INSERT INTO user_tokens (username, secret_key, token, refresh_token, refresh_secret, last_used)
          VALUES ($1, $2, $3, $4, $5, now())`,
      [username, secretKey, token, refreshToken, refreshSecretKey]
    );

    return {
      status: "success",
      data: {
        accessToken: token,
        refreshToken: refreshToken,
        expiresIn: 3600,
        user: { ...userTokenData },
      },
    };
  }

  async logout(user, jwtToken) {
    await volleyBallDb.query(
      `DELETE FROM user_tokens WHERE username = $1 AND token = $2`,
      [user.username, jwtToken]
    );
    return { status: "success", code: "AUTH_CLEAR_200" };
  }

  async refreshToken(payload) {
    const res = await volleyBallDb.query(
      `SELECT u.username,
              u.password,
              u.enabled,
              u.first_name,
              u.last_name,
              u.profile_image_url,
              u.email_id,
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

    const {
      username,
      enabled,
      first_name: firstName,
      last_name: lastName,
      role_id: roleId,
      role_name: roleName,
      profile_image_url: profileImageUrl,
      email_id: emailId,
    } = user;

    const secretKey = generateSecureRandomKey();

    const userTokenData = {
      username,
      enabled,
      firstName,
      lastName,
      fullName: firstName + " " + lastName,
      roleId,
      roleName,
      profileImageUrl,
      emailId,
    };

    const jwtOptions = {
      expiresIn: process.env.AUTH_TOKEN_EXPIRY,
      issuer: process.env.ISSUER,
    };

    let token = jwt.sign({ user: { ...userTokenData } }, secretKey);

    await volleyBallDb.query(
      `UPDATE user_tokens SET token = $1, secret_key = $2 WHERE refresh_token = $3`,
      [token, secretKey, payload.refreshToken]
    );

    return {
      status: "success",
      data: {
        accessToken: token,
        refreshToken: payload.refreshToken,
        expiresIn: 3600,
        user: { ...userTokenData },
      },
    };
  }
}

export default AuthenticationService;
