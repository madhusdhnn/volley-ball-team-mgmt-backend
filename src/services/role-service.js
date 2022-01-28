import volleyBallDb from "../config/db";
import {multipleRowsExtractor, singleRowExtractor} from "../utils/db-utils";

class RoleService {
  async getRoles() {
    try {
      const res = await volleyBallDb.query("SELECT r.name FROM roles r");
      return multipleRowsExtractor.extract(res);
    } catch (e) {
      throw e;
    }
  }

  async verifyRole(roleId) {
    try {
      const res = await volleyBallDb.query(`SELECT EXISTS(SELECT role_id FROM roles WHERE role_id = $1) as role_exists`, [roleId]);
      return singleRowExtractor.extract(res)["role_exists"];
    } catch (e) {
      throw e;
    }
  }
}

export default RoleService;
