import { QueryConfig } from "pg";
import db from "../config/db";
import { IPlayer, IPlayerUnits } from "../utils/types";
import { IRowMapper, nullableSingleResult, RowMapperResultSetExtractor } from "../utils/db-utils";
import AuthenticationService from "./authentication-service";
import { AuthenticationError, IllegalArgumentError } from "../utils/error-utils";

interface IPlayerDao {
  player_id: number;
  username: string;
  name: string;
  team_id?: number;
  team_name?: string;
  shirt_no: number;
  age?: number;
  height?: number;
  weight?: number;
  power?: number;
  speed?: number;
  location?: string;
  favourite_positions?: string;
  created_at: Date;
  updated_at: Date;
}

interface IPlayerUnitsDao {
  id: number;
  name: string;
  value: string;
}

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
      initials: initials,
      photoUrl: undefined,
      shirtNo: row.shirt_no,
      team: team,
      additionalInfo: additionalInfo,
      audit: audit,
    };
  }
}

class PlayerUnitsRowMapper implements IRowMapper<IPlayerUnitsDao, IPlayerUnits> {
  mapRow(row: IPlayerUnitsDao, _rowNumber: number): IPlayerUnits {
    return {
      id: row.id,
      name: row.name,
      value: row.value,
    };
  }
}

class PlayerService {
  private authService: AuthenticationService;
  private readonly playerResultSetExtractor: RowMapperResultSetExtractor<IPlayerDao, IPlayer>;

  private readonly playerUnitsResultSetExtractor: RowMapperResultSetExtractor<IPlayerUnitsDao, IPlayerUnits>;

  constructor() {
    this.authService = new AuthenticationService();
    this.playerResultSetExtractor = new RowMapperResultSetExtractor<IPlayerDao, IPlayer>(new PlayerRowMapper());

    this.playerUnitsResultSetExtractor = new RowMapperResultSetExtractor<IPlayerUnitsDao, IPlayerUnits>(
      new PlayerUnitsRowMapper(),
    );
  }

  async getPlayer(playerId: number): Promise<IPlayer> {
    const sql: QueryConfig = {
      text: `
      SELECT p.*, t.name AS team_name 
      FROM players p 
      LEFT JOIN teams t 
        ON p.team_id = t.team_id 
      WHERE p.player_id = $1`,
      values: [playerId],
    };

    const res = await db.query<IPlayerDao>(sql);
    return nullableSingleResult(this.playerResultSetExtractor.extract(res));
  }

  async getAllPlayers(): Promise<IPlayer[]> {
    const sql = `
      SELECT p.*, t.name AS team_name 
      FROM players p 
      LEFT JOIN teams t 
        ON p.team_id = t.team_id`;
    const res = await db.query<IPlayerDao>(sql);
    return this.playerResultSetExtractor.extract(res);
  }

  async getAllPlayersInTeam(teamId: number): Promise<IPlayer[]> {
    const sql: QueryConfig = {
      text: `
      SELECT p.*, t.name AS team_name 
      FROM players p 
      JOIN teams t 
        ON p.team_id = t.team_id 
      WHERE p.team_id = $1`,
      values: [teamId],
    };
    const res = await db.query<IPlayerDao>(sql);
    return this.playerResultSetExtractor.extract(res);
  }

  async createPlayer(player: Partial<IPlayer>): Promise<IPlayer> {
    const isUserRegistered = await this.authService.isUsernameExists(player.username || "");

    if (!isUserRegistered) {
      throw new AuthenticationError("ACC_PLAYER_400", "User not registered");
    }

    const sql: QueryConfig = {
      text: "INSERT INTO players (username, name, shirt_no, created_at, updated_at) VALUES ($1, $2, $3, now(), now()) RETURNING *",
      values: [player.username, player.name, player.shirtNo],
    };
    const res = await db.query<IPlayerDao>(sql);
    return nullableSingleResult(this.playerResultSetExtractor.extract(res));
  }

  async getPlayerUnits(): Promise<IPlayerUnits[]> {
    const res = await db.query<IPlayerUnitsDao>("SELECT * FROM player_units");
    return this.playerUnitsResultSetExtractor.extract(res);
  }

  async updatePlayer(player: IPlayer): Promise<void> {
    const dbFields: Partial<IPlayerDao> = this.mapToDbFields(player);
    const fieldsToUpdate: string = Object.entries(dbFields)
      .map((entry) => `${entry[0]} = ${entry[1]}`)
      .join(", ");

    const sql: QueryConfig = {
      text: `UPDATE players SET ${fieldsToUpdate}, updated_at = now() WHERE player_id = $1`,
      values: [player.id],
    };
    await db.query(sql);
  }

  async deletePlayer(playerId: number): Promise<void> {
    const sql: QueryConfig = {
      text: "DELETE FROM players WHERE player_id = $1",
      values: [playerId],
    };
    await db.query(sql);
  }

  async getAllPlayersNotInTeam(): Promise<IPlayer[]> {
    const sql = `SELECT p.*, NULL AS team_name FROM players p WHERE p.team_id IS NULL`;
    const res = await db.query<IPlayerDao>(sql);
    return this.playerResultSetExtractor.extract(res);
  }

  async isTeamFull(teamId: number): Promise<boolean> {
    const sql: QueryConfig = {
      text: "SELECT (count(*) >= 6) AS is_full FROM players WHERE team_id = $1",
      values: [teamId],
    };
    const res = await db.query<{ is_full: boolean }>(sql);
    const row = res.rows[0];

    return !!row?.is_full;
  }

  async unassignFromTeam(playerId: number): Promise<void> {
    const sql: QueryConfig = {
      text: "UPDATE players SET team_id = NULL WHERE player_id = $1",
      values: [playerId],
    };
    await db.query(sql);
  }

  async getCurrentPlayer(username: string): Promise<IPlayer> {
    const sql: QueryConfig = {
      text: `
      SELECT p.*, t.name AS team_name 
      FROM players p 
      LEFT JOIN teams t 
        ON p.team_id = t.team_id 
      WHERE p.username = $1`,
      values: [username],
    };
    const res = await db.query<IPlayerDao>(sql);
    return nullableSingleResult(this.playerResultSetExtractor.extract(res));
  }

  async assignToTeam(playerIds: number[] = [], teamId: number): Promise<void> {
    const dbClient = await db.connect();
    try {
      const isTeamFull = await this.isTeamFull(teamId);
      if (isTeamFull) {
        throw new Error("Team is already full");
      }

      dbClient.query("BEGIN");

      const sql: QueryConfig = {
        text: "UPDATE players SET team_id = $1 WHERE player_id = ANY ($2::bigint[])",
        values: [teamId, playerIds],
      };

      const res = await dbClient.query(sql);

      if (res.rowCount !== playerIds.length) {
        await dbClient.query("ROLLBACK");
        throw new IllegalArgumentError("Some of the players in input does not exist!");
      }
      await dbClient.query("COMMIT");
    } finally {
      dbClient.release();
    }
  }

  async transferToTeam(toTeamId: number, playerId: number): Promise<void> {
    const isTeamFull = await this.isTeamFull(toTeamId);
    if (isTeamFull) {
      throw new Error("Team is already full");
    }

    const sql: QueryConfig = {
      text: "UPDATE players SET team_id = $1 WHERE player_id = $2",
      values: [toTeamId, playerId],
    };
    await db.query(sql);
  }

  private mapToDbFields = (player: Partial<IPlayer>): Partial<IPlayerDao> => {
    const fields: Partial<IPlayerDao> = {};

    if (!player) {
      return fields;
    }

    if (player.name) {
      fields["name"] = player.name;
    }

    if (player.shirtNo) {
      fields["shirt_no"] = player.shirtNo;
    }

    const additionalInfo = player.additionalInfo;

    if (additionalInfo?.age) {
      fields["age"] = additionalInfo.age;
    }

    if (additionalInfo?.height) {
      fields["height"] = additionalInfo.height;
    }

    if (additionalInfo?.weight) {
      fields["weight"] = additionalInfo.weight;
    }

    if (additionalInfo?.power) {
      fields["power"] = additionalInfo.power;
    }

    if (additionalInfo?.speed) {
      fields["speed"] = additionalInfo.speed;
    }

    if (additionalInfo?.favouritePositions) {
      fields["favourite_positions"] = additionalInfo.favouritePositions.join(",");
    }

    if (additionalInfo?.location) {
      fields["location"] = `'${additionalInfo.location}'`;
    }

    return Object.freeze(fields);
  };
}

export default PlayerService;
