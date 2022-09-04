import db from "../config/db";
import jwt from "jsonwebtoken";
import { BcryptPasswordEncoder, generateSecureRandomKey } from "../utils/auth-utils";
import { IRowMapper, nullableSingleResult, RowMapperResultSetExtractor } from "../utils/db-utils";
import { IUser, INewUserData, IAuthPayload } from "../utils/types";
import { QueryConfig } from "pg";
import { IUserTokenDao } from "./authorization-service";
import { AuthenticationError } from "../utils/error-utils";
import RoleService from "./role-service";

interface IUserDao {
  username: string;
  password: string;
  enabled: boolean;
  first_name: string;
  last_name: string;
  profile_image_url?: string;
  email_id?: string;
  role_id?: number;
  role_name?: string;
  created_at: Date;
  updated_at: Date;
}

class UserRowMapper implements IRowMapper<IUserDao, IUser> {
  mapRow(row: IUserDao, _rowNumber: number): IUser {
    return {
      username: row.username,
      enabled: row.enabled,
      firstName: row.first_name,
      lastName: row.last_name,
      emailAddress: row.email_id,
      profileImageUrl: row.profile_image_url,
      role: {
        id: row.role_id,
        name: row.role_name,
      },
      audit: {
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    };
  }
}

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
      throw new Error("Role does not exists");
    }

    if (await this.isUsernameExists(username)) {
      throw new AuthenticationError("REG_409", "Username already exists");
    }

    if (await this.isEmailExists(emailAddress)) {
      throw new AuthenticationError("REG_409", "Email Address already exists");
    }

    const hashed = this.passwordEncoder.encode(password);
    const sql: QueryConfig = {
      text: `
      INSERT INTO users (username, password, first_name, last_name, email_id, role_id, enabled, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, true, now(), now()) RETURNING *`,
      values: [username, hashed, firstName, lastName, emailAddress, theRole.id],
    };
    const res = await db.query<IUserDao>(sql);

    return nullableSingleResult(this.userAuthResultSetExtractor.extract(res));
  }

  async getAllUsers(): Promise<IUser[]> {
    const res = await db.query<IUserDao>(
      "SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.role_id",
    );
    return this.userAuthResultSetExtractor.extract(res);
  }

  async signin(payload: IAuthPayload) {
    let sql: QueryConfig = {
      text: `
        SELECT u.*, r.name AS role_name 
        FROM users u 
        JOIN roles r 
          ON u.role_id = r.role_id 
        WHERE u.username = $1`,
      values: [payload.username],
    };
    const res = await db.query<IUserDao>(sql);
    const user: IUser = nullableSingleResult(this.userAuthResultSetExtractor.extract(res));

    if (!user) {
      throw new AuthenticationError("AUTH_401", "Username and password does not match");
    }

    if (!user.enabled) {
      throw new AuthenticationError("AUTH_403", "IUser disabled");
    }

    const password = payload.password;
    const savedPassword = res.rows[0].password;
    const isSame = this.passwordEncoder.matches(password, savedPassword);

    if (!isSame) {
      throw new AuthenticationError("AUTH_401", "Password is wrong");
    }

    const { username, enabled, firstName, lastName, role, profileImageUrl, emailAddress: email } = user;

    const secretKey = generateSecureRandomKey();

    const userTokenData = {
      username,
      enabled,
      firstName,
      lastName,
      fullName: firstName + " " + lastName,
      role,
      profileImageUrl,
      email,
    };

    const token = jwt.sign({ user: { ...userTokenData } }, secretKey, {
      expiresIn: process.env.AUTH_TOKEN_EXPIRY,
      issuer: process.env.ISSUER,
      subject: userTokenData.username,
    });

    sql = {
      text: `INSERT INTO user_tokens (username, secret_key, token, last_used) VALUES ($1, $2, $3, now())`,
      values: [username, secretKey, token],
    };
    await db.query<IUserTokenDao>(sql);

    return {
      status: "success",
      data: {
        accessToken: token,
        expiresIn: 3600,
        user: { ...userTokenData },
      },
    };
  }

  async signout(username: string, jwtToken: string): Promise<void> {
    const sql: QueryConfig = {
      text: `DELETE FROM user_tokens WHERE username = $1 AND token = $2`,
      values: [username, jwtToken],
    };
    await db.query<IUserTokenDao>(sql);
  }

  async signoutAllSessions(username: string): Promise<void> {
    await db.query(`DELETE FROM user_tokens WHERE username = $1`, [username]);
  }

  public async isUsernameExists(username: string): Promise<boolean> {
    if (!username) {
      throw new Error("Username field is empty or null");
    }

    const sql: QueryConfig = {
      text: "SELECT username FROM users WHERE username = $1",
      values: [username],
    };
    const res = await db.query(sql);
    return res.rows.length === 1;
  }

  public async isEmailExists(emailAddress: string): Promise<boolean> {
    if (!emailAddress) {
      throw new Error("Username field is empty or null");
    }

    const sql: QueryConfig = {
      text: "SELECT email_id FROM users WHERE email_id = $1",
      values: [emailAddress],
    };
    const res = await db.query(sql);
    return res.rows.length === 1;
  }
}

export default AuthenticationService;
