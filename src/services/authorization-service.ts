import jwt from "jsonwebtoken";
import db from "../config/db";
import { IUserToken } from "../utils/types";
import { IUserTokenDao } from "../utils/dao";

import { IRowMapper, nullableSingleResult, RowMapperResultSetExtractor } from "../utils/db-utils";
import { AuthenticationError } from "../utils/error-utils";

class UserTokenRowMapper implements IRowMapper<IUserTokenDao, IUserToken> {
  mapRow(row: IUserTokenDao): IUserToken {
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
  private readonly authResultSetExtractor: RowMapperResultSetExtractor<IUserTokenDao, IUserToken>;

  constructor() {
    this.authResultSetExtractor = new RowMapperResultSetExtractor<IUserTokenDao, IUserToken>(new UserTokenRowMapper());
  }

  async verifyToken(jwtToken: string): Promise<jwt.JwtPayload> {
    if (!jwtToken) {
      throw new AuthenticationError("AUTH_ERR_401", "Auth token not found in the request");
    }

    const res = await db<IUserTokenDao>("user_tokens").select("*").where("token", "=", jwtToken);
    const userToken = nullableSingleResult(this.authResultSetExtractor.extract(res));

    if (!userToken) {
      throw new AuthenticationError("AUTH_ERR_401", "Invalid Auth token");
    }

    const jwtPayload = jwt.verify(jwtToken, userToken.secretKey, {
      issuer: process.env.ISSUER,
    }) as jwt.JwtPayload;

    return jwtPayload;
  }
}

export default AuthorizationService;
