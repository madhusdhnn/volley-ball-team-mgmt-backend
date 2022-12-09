import db from "../config/db";
import TeamRowMapper from "../row-mappers/team-row-mapper";
import { ITeamDao } from "../utils/dao";
import { nullableSingleResult, RowMapperResultSetExtractor } from "../utils/db-utils";
import { InvalidStateError } from "../utils/error-utils";
import { INewTeam, ITeam } from "../utils/types";
import PlayerService from "./player-service";

class TeamsService {
  private teamRSE: RowMapperResultSetExtractor<ITeamDao, ITeam>;
  private static readonly MAX_PLAYERS: number = 6;

  private playerService: PlayerService;

  constructor() {
    const teamRM = new TeamRowMapper();
    this.playerService = new PlayerService();
    this.teamRSE = new RowMapperResultSetExtractor<ITeamDao, ITeam>(teamRM);
  }

  async getAllTeams(): Promise<ITeam[]> {
    const res = await db<ITeamDao>("teams").orderBy("team_id").select("*");
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
      coach_name: payload.coachName,
      max_players: TeamsService.MAX_PLAYERS,
      created_at: nowTime,
      updated_at: nowTime,
    };

    const res = await db<ITeamDao>("teams").insert(teamData, "*");
    return nullableSingleResult(this.teamRSE.extract(res));
  }

  async updateTeam(teamId: number, teamName: string, username?: string): Promise<void> {
    const updateFields: Partial<ITeamDao> = {
      name: teamName,
    };

    if (username) {
      const coach = await this.playerService.verifyAndGetCoach(username);
      updateFields["coach_name"] = coach.name;
    }

    const rowCount = await db<ITeamDao>("teams").update(updateFields).where("team_id", "=", teamId);

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
