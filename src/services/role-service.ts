import { QueryConfig } from "pg";
import db from "../config/db";
import { IRole } from "../utils/types";
import { IRowMapper, nullableSingleResult, RowMapperResultSetExtractor } from "../utils/db-utils";

interface IRoleDao {
  role_id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

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
    const res = await db.query<IRoleDao>("SELECT name FROM roles");
    return this.rolesResultSetExtractor.extract(res);
  }

  async getByName(name: string): Promise<IRole> {
    const sql: QueryConfig = {
      text: "SELECT * FROM roles WHERE name = $1",
      values: [name],
    };
    const res = await db.query<IRoleDao>(sql);
    return nullableSingleResult(this.rolesResultSetExtractor.extract(res));
  }

  async getRole(roleId: number): Promise<IRole> {
    const sql: QueryConfig = {
      text: `SELECT * FROM roles WHERE role_id = $1`,
      values: [roleId],
    };
    const res = await db.query<IRoleDao>(sql);
    return nullableSingleResult(this.rolesResultSetExtractor.extract(res));
  }
}

export default RoleService;
