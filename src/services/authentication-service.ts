import jwt from "jsonwebtoken";
import db from "../config/db";
import { BcryptPasswordEncoder, generateSecureRandomKey } from "../utils/auth-utils";

import { IRoleDao, IUserDao, IUserTokenDao } from "../utils/dao";
import { nullableSingleResult, RowMapperResultSetExtractor } from "../utils/db-utils";
import { AuthenticationError } from "../utils/error-utils";
import { IAuthPayload, INewUserData, IUser, JwtPayload } from "../utils/types";
import RoleService from "./role-service";
import UserRowMapper from "../row-mappers/user-row-mapper";

class AuthenticationService {
  private passwordEncoder: BcryptPasswordEncoder;
  private roleService: RoleService;
  private userAuthResultSetExtractor: RowMapperResultSetExtractor<IUserDao, IUser>;

  constructor() {
    this.roleService = new RoleService();
    this.passwordEncoder = new BcryptPasswordEncoder();
    this.userAuthResultSetExtractor = new RowMapperResultSetExtractor<IUserDao, IUser>(new UserRowMapper());
  }

  async register(userData: INewUserData): Promise<IUser> {
    const { username, firstName, lastName, password, emailAddress, role } = userData;

    const theRole = await this.roleService.getByName(role.toString());
    if (!theRole) {
      throw new AuthenticationError("ROLE_ERR_404", "Role does not exists");
    }

    if (await this.isUsernameExists(username)) {
      throw new AuthenticationError("REG_409", "Username already exists");
    }

    if (await this.isEmailExists(emailAddress)) {
      throw new AuthenticationError("REG_409", "Email Address already exists");
    }

    const hashed = this.passwordEncoder.encode(password);
    const newUserDao = {
      username,
      password: hashed,
      first_name: firstName,
      last_name: lastName,
      email_id: emailAddress,
      role_id: theRole.id,
      enabled: true,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    };

    const res = await db<IUserDao>("users").insert(newUserDao, "*");

    const user = nullableSingleResult(this.userAuthResultSetExtractor.extract(res));
    if (user) {
      user.role = { ...user.role, name: theRole.name };
    }
    return user;
  }

  async getAllUsers(): Promise<IUser[]> {
    const res = await db<IUserDao>({ u: "users" })
      .join<IRoleDao>({ r: "roles" }, "u.role_id", "=", "r.role_id")
      .select("u.*", { role_name: "r.name" });
    return this.userAuthResultSetExtractor.extract(res);
  }

  async getAllUsersByType(type: string): Promise<IUser[]> {
    const res = await db<IUserDao>({ u: "users" })
      .join<IRoleDao>({ r: "roles" }, "u.role_id", "=", "r.role_id")
      .select("u.*", { role_name: "r.name" })
      .where("r.name", "=", type);
    return this.userAuthResultSetExtractor.extract(res);
  }

  async signin(payload: IAuthPayload) {
    const res = await db<IUserDao>({ u: "users" })
      .join<IRoleDao>({ r: "roles" }, "u.role_id", "=", "r.role_id")
      .select("u.*", { role_name: "r.name" })
      .where("u.username", "=", payload.username);

    const user: IUser = nullableSingleResult(this.userAuthResultSetExtractor.extract(res));

    if (!user) {
      throw new AuthenticationError("AUTH_401", "User does not exists");
    }

    if (!user.enabled) {
      throw new AuthenticationError("AUTH_403", "IUser disabled");
    }

    const passwordInRequest = payload.password;
    const savedPassword = res[0].password;
    const isSame = this.passwordEncoder.matches(passwordInRequest, savedPassword);

    if (!isSame) {
      throw new AuthenticationError("AUTH_401", "Password is wrong");
    }

    const { username, enabled, firstName, lastName, role, profileImageUrl, emailAddress } = user;

    const secretKey = generateSecureRandomKey();

    const userTokenData: JwtPayload = {
      username,
      enabled,
      firstName,
      lastName,
      fullName: firstName + " " + lastName,
      role,
      profileImageUrl,
      emailAddress,
    };

    const token = jwt.sign({ user: userTokenData }, secretKey, {
      expiresIn: process.env.AUTH_TOKEN_EXPIRY,
      issuer: process.env.ISSUER,
      subject: userTokenData.username,
    });

    const userToken = { username, secret_key: secretKey, token, last_used: db.fn.now() };
    await db<IUserTokenDao>("user_tokens").insert(userToken);

    return {
      status: "success",
      data: {
        accessToken: token,
        tokenType: "Bearer",
        expiresIn: process.env.AUTH_TOKEN_EXPIRY,
      },
    };
  }

  async signout(username: string, jwtToken: string): Promise<void> {
    await db<IUserTokenDao>("user_tokens").delete().where("username", "=", username).andWhere("token", "=", jwtToken);
  }

  async signoutAllSessions(username: string): Promise<void> {
    await db<IUserTokenDao>("user_tokens").delete().where("username", "=", username);
  }

  public async isUsernameExists(username: string): Promise<boolean> {
    if (!username) {
      throw new Error("Username field is empty or null");
    }
    const res = await db.raw("SELECT 1 as user_exists FROM users WHERE username = ?", username);
    return res.rows[0]?.["user_exists"] === 1;
  }

  public async isEmailExists(emailAddress: string): Promise<boolean> {
    if (!emailAddress) {
      throw new Error("Email address field is empty or null");
    }
    const res = await db.raw("SELECT 1 as email_exists FROM users WHERE email_id = ?", emailAddress);
    return res.rows[0]?.["email_exists"] === 1;
  }
}

export default AuthenticationService;
