import { QueryConfig } from "pg";
import db from "../config/db";
import { INewTeam, ITeam } from "../utils/types";
import { IRowMapper, nullableSingleResult, RowMapperResultSetExtractor } from "../utils/db-utils";

interface ITeamDao {
  team_id: number;
  name: string;
  max_players: number;
  created_at: Date;
  updated_at: Date;
}

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
    const res = await db.query<ITeamDao>("SELECT * FROM teams");
    return this.teamRSE.extract(res);
  }

  async getTeam(teamId: number): Promise<ITeam> {
    const sql: QueryConfig = {
      text: "SELECT * FROM teams WHERE team_id = $1",
      values: [teamId],
    };
    const res = await db.query<ITeamDao>(sql);
    return nullableSingleResult(this.teamRSE.extract(res));
  }

  async createTeam(payload: INewTeam): Promise<ITeam> {
    const { teamName } = payload;

    const teamNameFormatted = teamName.substring(0, 1).toUpperCase() + teamName.substring(1);

    const sql: QueryConfig = {
      text: "INSERT INTO teams (name, max_players, created_at, updated_at) VALUES ($1, $2, now(), now()) RETURNING *",
      values: [teamNameFormatted, TeamsService.MAX_PLAYERS],
    };

    const data = await db.query<ITeamDao>(sql);
    return nullableSingleResult(this.teamRSE.extract(data));
  }

  async updateTeam(teamId: number, teamName: string): Promise<void> {
    const sql: QueryConfig = {
      text: "UPDATE teams SET name = $1, updated_at = now() where team_id = $2",
      values: [teamName, teamId],
    };
    await db.query(sql);
  }

  async deleteTeam(teamId: number): Promise<void> {
    const sql: QueryConfig = {
      text: "DELETE FROM teams where team_id = $1",
      values: [teamId],
    };
    await db.query(sql);
  }
}

export default TeamsService;
