import db from "../config/db";
import { IRole } from "../utils/types";
import { IRoleDao } from "../utils/dao";
import { nullableSingleResult, RowMapperResultSetExtractor } from "../utils/db-utils";
import { InvalidStateError } from "../utils/error-utils";
import RolesRowMapper from "../row-mappers/roles-row-mapper";

class RoleService {
  private rolesResultSetExtractor: RowMapperResultSetExtractor<IRoleDao, IRole>;

  constructor() {
    this.rolesResultSetExtractor = new RowMapperResultSetExtractor<IRoleDao, IRole>(new RolesRowMapper());
  }

  async createRole(roleName: string): Promise<IRole> {
    const nowTime = db.fn.now();
    const res = await db<IRoleDao>("roles").insert({ name: roleName, created_at: nowTime, updated_at: nowTime }, "*");
    return nullableSingleResult(this.rolesResultSetExtractor.extract(res));
  }

  async deleteRole(roleName: string): Promise<void> {
    const rowCount = await db<IRoleDao>("roles").delete().where("name", "=", roleName);
    if (rowCount < 1) {
      throw new InvalidStateError(`Role - ${roleName} does not exists`);
    }
  }

  async updateRole(roleId: number, roleName: string): Promise<void> {
    const rowCount = await db<IRoleDao>("roles")
      .update({ name: roleName, updated_at: db.fn.now() })
      .where("role_id", "=", roleId);
    if (rowCount < 1) {
      throw new InvalidStateError(`Role with ID ${roleId} does not exists`);
    }
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
