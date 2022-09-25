import { IRoleDao } from "../utils/dao";
import { IRowMapper } from "../utils/db-utils";
import { IRole } from "../utils/types";

class RolesRowMapper implements IRowMapper<IRoleDao, IRole> {
  mapRow(row: IRoleDao, _rowNumber: number): IRole {
    return {
      id: row.role_id,
      name: row.name,
      audit: {
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    };
  }
}

export default RolesRowMapper;
