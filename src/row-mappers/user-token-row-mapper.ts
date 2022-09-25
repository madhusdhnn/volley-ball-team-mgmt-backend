import { IUserTokenDao } from "../utils/dao";
import { IRowMapper } from "../utils/db-utils";
import { IUserToken } from "../utils/types";

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

export default UserTokenRowMapper;
