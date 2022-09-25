import { IPlayerDao } from "../utils/dao";
import { IRowMapper } from "../utils/db-utils";
import { IPlayer } from "../utils/types";

class PlayerRowMapper implements IRowMapper<IPlayerDao, IPlayer> {
  private parseInitials(name: string): string {
    if (!name) {
      return "";
    }

    const [firstName, lastName] = name.split(" ");
    const initials = firstName.substring(0, 1) + "" + (lastName ? lastName.substring(0, 1) : "");

    return initials;
  }

  mapRow(row: IPlayerDao, _rowNumber: number): IPlayer {
    const initials = this.parseInitials(row.name);

    const additionalInfo = {
      age: row.age,
      height: row.height,
      weight: row.weight,
      power: row.power,
      speed: row.speed,
      location: row.location,
      favouritePositions: row.favourite_positions ? row.favourite_positions.split(",") : [],
    };

    const audit = {
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    let team = null;
    if (row.team_id || row.team_name) {
      team = {
        id: row.team_id,
        name: row.team_name,
      };
    }

    return {
      id: row.player_id,
      name: row.name,
      username: row.username,
      initials,
      photoUrl: undefined,
      shirtNo: row.shirt_no,
      team,
      additionalInfo,
      audit,
    };
  }
}

export default PlayerRowMapper;
