import volleyBallDb from "../config/db";
import { multipleRowsExtractor, singleRowExtractor } from "../utils/db-utils";
class PlayerService {
  getFieldsToUpdate = (player) => {
    const fields = {};

    if (!player) {
      return fields;
    }

    if (player.name) {
      fields["name"] = player.name;
    }

    if (player.age) {
      fields["age"] = player.age;
    }

    if (player.height) {
      fields["height"] = player.height;
    }

    if (player.weight) {
      fields["weight"] = player.weight;
    }

    if (player.power) {
      fields["power"] = player.power;
    }

    if (player.speed) {
      fields["speed"] = player.speed;
    }

    if (player["favouritePositions"]) {
      fields["favourite_positions"] = player["favouritePositions"];
    }
    return Object.freeze(fields);
  };

  async getAllPlayerNotInTeam() {
    const query = `SELECT t.name AS team_name,
                          p.player_id,
                          p.username,
                          p.team_id,
                          p.name,
                          p.shirt_no,
                          p.age,
                          p.height,
                          p.weight,
                          p.power,
                          p.speed,
                          p.favourite_positions,
                          p.created_at,
                          p.updated_at
                      FROM players p
                          LEFT JOIN teams t ON t.team_id = p.team_id
                      WHERE p.team_id IS NULL`;
    const res = await volleyBallDb.query(query);
    return multipleRowsExtractor.extract(res);
  }

  async getTotalPlayersInTeam(currentTeamId) {
    const res = await volleyBallDb.query(
      "SELECT count(*) as total_players_in_team FROM players WHERE team_id = $1",
      [currentTeamId]
    );
    return singleRowExtractor.extract(res)["total_players_in_team"];
  }

  async getCurrentPlayer(username) {
    try {
      const query = `SELECT t.name AS team_name,
                            p.player_id,
                            p.username,
                            p.team_id,
                            p.name,
                            p.shirt_no,
                            p.age,
                            p.height,
                            p.weight,
                            p.power,
                            p.speed,
                            p.favourite_positions,
                            p.created_at,
                            p.updated_at
                     FROM players p
                              JOIN teams t ON t.team_id = p.team_id
                     WHERE p.username = $1`;

      const res = await volleyBallDb.query(query, [username]);
      return singleRowExtractor.extract(res);
    } catch (e) {
      throw e;
    }
  }
  async getPlayer(playerId) {
    try {
      const query = `SELECT t.name AS team_name,
                            p.player_id,
                            p.team_id,
                            p.name,
                            p.shirt_no,
                            p.age,
                            p.height,
                            p.weight,
                            p.power,
                            p.speed,
                            p.favourite_positions,
                            p.created_at,
                            p.updated_at
                     FROM players p
                              JOIN teams t ON t.team_id = p.team_id
                     WHERE p.player_id = $1`;

      const res = await volleyBallDb.query(query, [playerId]);
      return singleRowExtractor.extract(res);
    } catch (e) {
      throw e;
    }
  }

  async getAllPlayers() {
    try {
      const query = `SELECT t.name    AS team_name,
                            p.team_id AS team_id,
                            p.player_id,
                            p.shirt_no,
                            p.name,
                            p.age,
                            p.height,
                            p.weight,
                            p.power,
                            p.speed,
                            p.favourite_positions,
                            p.created_at,
                            p.updated_at
                     FROM players p
                              LEFT JOIN teams t ON t.team_id = p.team_id
                     ORDER BY p.player_id`;

      const res = await volleyBallDb.query(query);
      return multipleRowsExtractor.extract(res);
    } catch (e) {
      throw e;
    }
  }

  async getAllPlayersInTeam(teamId) {
    try {
      const query = `SELECT t.name AS team_name,
                            p.player_id,
                            p.team_id,
                            p.name,
                            p.age,
                            p.height,
                            p.weight,
                            p.power,
                            p.speed,
                            p.favourite_positions,
                            p.created_at,
                            p.updated_at
                     FROM players p
                              JOIN teams t ON t.team_id = p.team_id
                     where t.team_id = $1`;
      const res = await volleyBallDb.query(query, [teamId]);
      return multipleRowsExtractor.extract(res);
    } catch (e) {
      throw e;
    }
  }

  async createPlayer(player) {
    try {
      const rs1 = await volleyBallDb.query(
        "INSERT INTO players (name, shirt_no, created_at, updated_at) VALUES ($1, $2, now(), now()) RETURNING (player_id)",
        [player.name, player.shirtNo]
      );
      const playerId = singleRowExtractor.extract(rs1);
      return await this.getPlayer(playerId);
    } catch (e) {
      throw e;
    }
  }

  async getPlayerUnits() {
    try {
      const res = await volleyBallDb.query("SELECT * FROM player_units");
      return multipleRowsExtractor.extract(res);
    } catch (e) {
      throw e;
    }
  }

  async updatePlayer(player) {
    try {
      const fields = this.getFieldsToUpdate(player);
      const fieldsToUpdate = {};

      const updateFields = Object.keys(fields).map((k, i) => ({
        field: `${k}=$${i + 1}`,
        value: fields[k],
      }));

      fieldsToUpdate.fields = updateFields.map((uf) => uf.field).join(",");
      fieldsToUpdate.values = updateFields.map((uf) => uf.value);

      const updateQuery = `UPDATE players
                           SET ${fieldsToUpdate.fields},
                               updated_at = now()
                           WHERE player_id = $${
                             fieldsToUpdate.values.length + 1
                           }`;

      await volleyBallDb.query(updateQuery, [
        ...fieldsToUpdate.values,
        player.playerId,
      ]);
      return await this.getPlayer(player.playerId);
    } catch (e) {
      throw e;
    }
  }

  async deletePlayer(playerId) {
    try {
      await volleyBallDb.query("DELETE FROM players WHERE player_id = $1", [
        playerId,
      ]);
    } catch (e) {
      throw e;
    }
  }

  async assignToTeam(playerIds = [], teamId) {
    try {
      const totalPlayers = await this.getTotalPlayersInTeam(teamId);
      if (totalPlayers > 6) {
        return {
          status: "failed",
          error: "Team can contain only 6 players at a time",
        };
      }

      const res = await volleyBallDb.query(
        "UPDATE players SET team_id = $1 WHERE player_id = ANY ($2::bigint[]) returning player_id",
        [teamId, playerIds]
      );

      if (res.rowCount !== playerIds.length) {
        return {
          status: "failed",
          error: "Some of the players in input does not exist!",
        };
      }
      return { status: "success" };
    } catch (e) {
      throw e;
    }
  }

  async transferToTeam(currentTeamId, newTeamId, playerId) {
    try {
      const totalPlayers = await getTotalPlayersInTeam(currentTeamId);
      if (totalPlayers > 6) {
        return { error: "Team can contain only 6 players at a time" };
      }

      await volleyBallDb.query(
        "UPDATE players SET team_id = $3 WHERE player_id = $1 AND team_id = $2",
        [playerId, currentTeamId, newTeamId]
      );
      return await this.getPlayer(playerId);
    } catch (e) {
      throw e;
    }
  }
}

export default PlayerService;
