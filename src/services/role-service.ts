import { QueryConfig } from "pg";
import db from "../config/db";
import { Role } from "../utils/types";
import {
  IRowMapper,
  nullableSingleResult,
  RowMapperResultSetExtractor,
} from "../utils/db-utils";

interface IRoleDao {
  role_id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

class RolesRowMapper implements IRowMapper<IRoleDao, Role> {
  mapRow(row: IRoleDao, _rowNumber: number): Role {
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
  private readonly rolesResultSetExtractor: RowMapperResultSetExtractor<
    IRoleDao,
    Role
  >;

  constructor() {
    this.rolesResultSetExtractor = new RowMapperResultSetExtractor<
      IRoleDao,
      Role
    >(new RolesRowMapper());
  }

  async getRoles(): Promise<Role[]> {
    try {
      const res = await db.query<IRoleDao>("SELECT name FROM roles");
      return this.rolesResultSetExtractor.extract(res);
    } catch (e) {
      throw e;
    }
  }

  async getByName(name: string): Promise<Role> {
    try {
      const sql: QueryConfig = {
        text: "SELECT * FROM roles WHERE name = $1",
        values: [name],
      };
      const res = await db.query<IRoleDao>(sql);
      return nullableSingleResult(this.rolesResultSetExtractor.extract(res));
    } catch (e) {
      throw e;
    }
  }

  async getRole(roleId: number): Promise<Role> {
    try {
      const sql: QueryConfig = {
        text: `SELECT * FROM roles WHERE role_id = $1`,
        values: [roleId],
      };
      const res = await db.query<IRoleDao>(sql);
      return nullableSingleResult(this.rolesResultSetExtractor.extract(res));
    } catch (e) {
      throw e;
    }
  }
}

export default RoleService;
