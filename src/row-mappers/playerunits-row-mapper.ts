import { IPlayerUnitsDao } from "../utils/dao";
import { IRowMapper } from "../utils/db-utils";
import { IPlayerUnits } from "../utils/types";

class PlayerUnitsRowMapper implements IRowMapper<IPlayerUnitsDao, IPlayerUnits> {
  mapRow(row: IPlayerUnitsDao, _rowNumber: number): IPlayerUnits {
    return {
      id: row.id,
      name: row.name,
      value: row.value,
    };
  }
}

export default PlayerUnitsRowMapper;
