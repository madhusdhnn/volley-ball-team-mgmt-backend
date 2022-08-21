import volleyBallDb from "../config/db";
import { singleRowExtractor } from "../utils/db-utils";

class TeamsService {
  async getAllTeams() {
    try {
      const res = await volleyBallDb.query(
        "SELECT * FROM teams ORDER BY team_id ASC"
      );
      return res.rows;
    } catch (e) {
      throw e;
    }
  }

  async getTeam(teamId) {
    try {
      const res = await volleyBallDb.query(
        "SELECT * FROM teams WHERE team_id = $1",
        [teamId]
      );
      return singleRowExtractor.extract(res);
    } catch (e) {
      throw e;
    }
  }

  async createTeam(team) {
    try {
      const { teamName } = team;

      const teamNameFormatted =
        teamName.substring(0, 1).toUpperCase() + teamName.substring(1);

      const data = await volleyBallDb.query(
        "INSERT INTO teams (name, max_players, created_at, updated_at) VALUES ($1, $2, now(), now()) RETURNING team_id",
        [teamNameFormatted, 6]
      );

      return { teamId: data.rows[0]["team_id"] };
    } catch (e) {
      throw e;
    }
  }

  async updateTeam(teamId, teamName) {
    try {
      await volleyBallDb.query(
        "UPDATE teams SET name = $2, updated_at = now() where team_id = $1",
        [teamId, teamName]
      );
      return this.getTeam(teamId);
    } catch (e) {
      throw e;
    }
  }

  async deleteTeam(teamId) {
    try {
      await volleyBallDb.query("DELETE FROM teams where team_id = $1", [
        teamId,
      ]);
    } catch (e) {
      throw e;
    }
  }
}

export default TeamsService;
