import { IUserDao } from "../utils/dao";
import { IRowMapper } from "../utils/db-utils";
import { IUser } from "../utils/types";

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

export default UserRowMapper;
