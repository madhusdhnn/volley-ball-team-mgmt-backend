import volleyBallDb from "../config/db";
import {multipleRowsExtractor, singleRowExtractor} from "../utils/db-utils";

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

  async getPlayer(playerId) {
    try {
      const res = await volleyBallDb.query("SELECT * FROM players WHERE player_id = $1", [playerId]);
      return singleRowExtractor.extract(res);
    } catch (e) {
      throw e;
    }
  }

  async getAllPlayers() {
    try {
      const res = await volleyBallDb.query("SELECT * FROM players");
      return multipleRowsExtractor.extract(res);
    } catch (e) {
      throw e;
    }
  }

  async getAllPlayersInTeam(teamId) {
    try {
      const res = await volleyBallDb.query("SELECT * FROM players where team_id = $1", [teamId]);
      return multipleRowsExtractor.extract(res);
    } catch (e) {
      throw e;
    }
  }

  async createPlayer(player) {
    try {
      const rs1 = await volleyBallDb.query("INSERT INTO players (name, created_at, updated_at) VALUES ($1, now(), now()) RETURNING (player_id)", [player.name]);
      const playerId = singleRowExtractor.extract(rs1);

      const rs2 = await volleyBallDb.query("SELECT * FROM players WHERE player_id = $1", [playerId]);
      return singleRowExtractor.extract(rs2);
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
        value: fields[k]
      }));

      fieldsToUpdate.fields = updateFields.map(uf => uf.field).join(",");
      fieldsToUpdate.values = updateFields.map(uf => uf.value);

      const updateQuery = `UPDATE players
                           SET ${fieldsToUpdate.fields},
                               updated_at = now()
                           WHERE player_id = $${Object.keys(fields).length + 1}`;

      await volleyBallDb.query(updateQuery, [...fieldsToUpdate.values, player.playerId]);
      return this.getPlayer(player.playerId);
    } catch (e) {
      throw e;
    }
  }

  async deletePlayer(playerId) {
    try {
      await volleyBallDb.query("DELETE FROM players WHERE player_id = $1", [playerId]);
    } catch (e) {
      throw e;
    }
  }

  async assignToTeam(playerId, teamId) {
    try {
      await volleyBallDb.query("UPDATE players SET team_id = $1 WHERE player_id = $2", [teamId, playerId]);
      return this.getPlayer(playerId);
    } catch (e) {
      throw e;
    }
  }

  async transferToTeam(currentTeamId, newTeamId, playerId) {
    try {
      const res = await volleyBallDb.query("SELECT count(*) as total_players_in_team FROM players WHERE team_id = $1", [currentTeamId]);
      const totalPlayers = singleRowExtractor.extract(res)["total_players_in_team"];

      if (totalPlayers > 6) {
        return {error: "Team can contain only 6 players at a time"};
      }

      await volleyBallDb.query("UPDATE players SET team_id = $3 WHERE player_id = $1 AND team_id = $2", [playerId, currentTeamId, newTeamId]);
      return this.getPlayer(playerId);
    } catch (e) {
      throw e;
    }
  }
}

export default PlayerService;
