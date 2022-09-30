import { ITeamDao } from "../utils/dao";
import { IRowMapper } from "../utils/db-utils";
import { ITeam } from "../utils/types";

class TeamRowMapper implements IRowMapper<ITeamDao, ITeam> {
  mapRow(row: ITeamDao, _rowNumber: number): ITeam {
    return {
      id: row.team_id,
      name: row.name,
      coachName: row.coach_name,
      maxPlayers: row.max_players,
      audit: {
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    };
  }
}

export default TeamRowMapper;
