import db from "../config/db";
import { ITeamDao } from "../utils/dao";
import { IRowMapper, nullableSingleResult, RowMapperResultSetExtractor } from "../utils/db-utils";
import { InvalidStateError } from "../utils/error-utils";
import { INewTeam, ITeam } from "../utils/types";

class TeamRowMapper implements IRowMapper<ITeamDao, ITeam> {
  mapRow(row: ITeamDao, _rowNumber: number): ITeam {
    return {
      id: row.team_id,
      name: row.name,
      maxPlayers: row.max_players,
      audit: {
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    };
  }
}

class TeamsService {
  private readonly teamRSE: RowMapperResultSetExtractor<ITeamDao, ITeam>;
  private static readonly MAX_PLAYERS: number = 6;

  constructor() {
    const teamRM = new TeamRowMapper();
    this.teamRSE = new RowMapperResultSetExtractor<ITeamDao, ITeam>(teamRM);
  }

  async getAllTeams(): Promise<ITeam[]> {
    const res = await db<ITeamDao>("teams").select("*");
    return this.teamRSE.extract(res);
  }

  async getTeam(teamId: number): Promise<ITeam> {
    const res = await db<ITeamDao>("teams").select("*").where("team_id", "=", teamId);
    return nullableSingleResult(this.teamRSE.extract(res));
  }

  async createTeam(payload: INewTeam): Promise<ITeam> {
    const { teamName } = payload;
    const teamNameFormatted = teamName.substring(0, 1).toUpperCase() + teamName.substring(1);

    const nowTime = db.fn.now();
    const teamData = {
      name: teamNameFormatted,
      max_players: TeamsService.MAX_PLAYERS,
      created_at: nowTime,
      updated_at: nowTime,
    };

    const res = await db<ITeamDao>("teams").insert(teamData, "*");
    return nullableSingleResult(this.teamRSE.extract(res));
  }

  async updateTeam(teamId: number, teamName: string): Promise<void> {
    const rowCount = await db<ITeamDao>("teams").update({ name: teamName }).where("team_id", "=", teamId);
    if (rowCount < 1) {
      throw new InvalidStateError(`Team - ${teamName} does not exists`);
    }
  }

  async deleteTeam(teamId: number): Promise<void> {
    const rowCount = await db<ITeamDao>("teams").delete().where("team_id", "=", teamId);
    if (rowCount < 1) {
      throw new InvalidStateError(`Team - ${teamId} does not exists`);
    }
  }
}

export default TeamsService;
