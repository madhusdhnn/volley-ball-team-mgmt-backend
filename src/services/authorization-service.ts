import jwt from "jsonwebtoken";
import { QueryConfig } from "pg";
import db from "../config/db";
import { UserToken } from "../utils/types";
import {
  IRowMapper,
  nullableSingleResult,
  RowMapperResultSetExtractor,
} from "../utils/db-utils";
import { AuthenticationError } from "../utils/error-utils";

export interface IUserTokenDao {
  id: number;
  username: string;
  secret_key: string;
  token: string;
  last_used: Date;
}

class UserTokenRowMapper implements IRowMapper<IUserTokenDao, UserToken> {
  mapRow(row: IUserTokenDao): UserToken {
    return {
      id: row.id,
      username: row.username,
      secretKey: row.secret_key,
      token: row.token,
      lastUsed: row.last_used,
    };
  }
}

class AuthorizationService {
  private readonly authResultSetExtractor: RowMapperResultSetExtractor<
    IUserTokenDao,
    UserToken
  >;

  constructor() {
    this.authResultSetExtractor = new RowMapperResultSetExtractor<
      IUserTokenDao,
      UserToken
    >(new UserTokenRowMapper());
  }

  async verifyToken(jwtToken: string): Promise<jwt.JwtPayload> {
    try {
      if (!jwtToken) {
        throw new AuthenticationError(
          "AUTH_ERR_401",
          "Auth token not found in the request"
        );
      }

      const sql: QueryConfig = {
        text: `SELECT * FROM user_tokens WHERE token = $1`,
        values: [jwtToken],
      };
      const res = await db.query<IUserTokenDao>(sql);
      const userToken = nullableSingleResult(
        this.authResultSetExtractor.extract(res)
      );

      if (!userToken) {
        throw new AuthenticationError("AUTH_ERR_401", "Invalid Auth token");
      }

      const jwtPayload = jwt.verify(jwtToken, userToken.secretKey, {
        issuer: process.env.ISSUER,
      }) as jwt.JwtPayload;

      return jwtPayload;
    } catch (e) {
      throw e;
    }
  }
}

export default AuthorizationService;
