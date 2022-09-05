import db from "../config/db";
import { IRole } from "../utils/types";
import { IRoleDao } from "../utils/dao";
import { IRowMapper, nullableSingleResult, RowMapperResultSetExtractor } from "../utils/db-utils";

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

class RoleService {
  private readonly rolesResultSetExtractor: RowMapperResultSetExtractor<IRoleDao, IRole>;

  constructor() {
    this.rolesResultSetExtractor = new RowMapperResultSetExtractor<IRoleDao, IRole>(new RolesRowMapper());
  }

  async getRoles(): Promise<IRole[]> {
    const res = await db<IRoleDao>("roles").select("*");
    return this.rolesResultSetExtractor.extract(res);
  }

  async getByName(name: string): Promise<IRole> {
    const res = await db<IRoleDao>("roles").select("*").where("name", "=", name);
    return nullableSingleResult(this.rolesResultSetExtractor.extract(res));
  }

  async getRole(roleId: number): Promise<IRole> {
    const res = await db<IRoleDao>("roles").select("*").where("id", "=", roleId);
    return nullableSingleResult(this.rolesResultSetExtractor.extract(res));
  }
}

export default RoleService;
