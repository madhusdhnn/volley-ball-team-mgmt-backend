import { Knex } from "knex";
import db from "../config/db";
import { IPlayerDao, IPlayerUnitsDao, ITeamDao } from "../utils/dao";
import { IRowMapper, nullableSingleResult, RowMapperResultSetExtractor } from "../utils/db-utils";
import { AuthenticationError, IllegalArgumentError, InvalidStateError } from "../utils/error-utils";
import { IPlayer, IPlayerUnits } from "../utils/types";
import AuthenticationService from "./authentication-service";

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
    const res: IPlayerDao[] = await db<IPlayerDao>({ p: "players" })
      .leftJoin<ITeamDao>({ t: "teams" }, "p.team_id", "=", "t.team_id")
      .select("p.*", { team_name: "t.name" })
      .where("p.player_id", "=", playerId);
    return nullableSingleResult(this.playerResultSetExtractor.extract(res));
  }

  async getAllPlayers(): Promise<IPlayer[]> {
    const res: IPlayerDao[] = await db<IPlayerDao>({ p: "players" })
      .leftJoin<ITeamDao>({ t: "teams" }, "p.team_id", "=", "t.team_id")
      .select("p.*", { team_name: "t.name" });
    return this.playerResultSetExtractor.extract(res);
  }

  async getAllPlayersInTeam(teamId: number): Promise<IPlayer[]> {
    const res: IPlayerDao[] = await db<IPlayerDao>({ p: "players" })
      .join<ITeamDao>({ t: "teams" }, "p.team_id", "=", "t.team_id")
      .select("p.*", { team_name: "t.name" })
      .where("p.team_id", "=", teamId);
    return this.playerResultSetExtractor.extract(res);
  }

  async createPlayer(player: Partial<IPlayer>): Promise<IPlayer> {
    const isUserRegistered = await this.authService.isUsernameExists(player.username || "");

    if (!isUserRegistered) {
      throw new AuthenticationError("ACC_PLAYER_400", "User not registered");
    }

    const nowTime = db.fn.now();
    const playerData = {
      username: player.username,
      name: player.name,
      shirt_no: player.shirtNo,
      created_at: nowTime,
      updated_at: nowTime,
    };

    const res: IPlayerDao[] = await db<IPlayerDao>("players").insert(playerData, "*");
    return nullableSingleResult(this.playerResultSetExtractor.extract(res));
  }

  async getPlayerUnits(): Promise<IPlayerUnits[]> {
    const res: IPlayerUnitsDao[] = await db<IPlayerUnitsDao>("player_units").select("*");
    return this.playerUnitsResultSetExtractor.extract(res);
  }

  async updatePlayer(player: IPlayer): Promise<void> {
    const dbFields: Partial<IPlayerDao> = this.mapToDbFields(player);
    const fieldsToUpdate: string = Object.entries(dbFields)
      .map((entry) => `${entry[0]} = ${entry[1]}`)
      .join(", ");
    await db.raw<IPlayerDao>(`UPDATE players SET ${fieldsToUpdate}, updated_at = now() WHERE player_id = :playerId`, {
      playerId: player.id,
    });
  }

  async deletePlayer(playerId: number): Promise<void> {
    await db<IPlayerDao>("players").delete().where("player_id", "=", playerId);
  }

  async getAllPlayersNotInTeam(): Promise<IPlayer[]> {
    const res: IPlayerDao[] = await db<IPlayerDao>({ p: "players" }).select("p.*").whereNull("p.team_id");
    return this.playerResultSetExtractor.extract(res);
  }

  async isTeamFull(teamId: number, transaction?: Knex.Transaction): Promise<boolean> {
    const sql = "SELECT count(*) AS team_count FROM players WHERE team_id = ?";
    const res = await (transaction ? transaction : db).raw(sql, teamId);
    return res.rows[0]["team_count"] >= 6;
  }

  async unassignFromTeam(playerId: number): Promise<void> {
    await db<IPlayerDao>("players")
      .update({ team_id: db.raw("NULL"), updated_at: db.fn.now() })
      .where("player_id", "=", playerId);
  }

  async getCurrentPlayer(username: string): Promise<IPlayer> {
    const res: IPlayerDao[] = await db<IPlayerDao>({ p: "players" })
      .leftJoin<ITeamDao>({ t: "teams" }, "p.team_id", "=", "t.team_id")
      .select("p.*", { team_name: "t.name" })
      .where("p.username", "=", username);
    return nullableSingleResult(this.playerResultSetExtractor.extract(res));
  }

  async assignToTeam(playerIds: number[] = [], teamId: number): Promise<void> {
    await db.transaction(async (trxn): Promise<void> => {
      const isTeamFull = await this.isTeamFull(teamId, trxn);
      if (isTeamFull) {
        throw new Error("Team is already full. Choose some other team");
      }

      const sql =
        "UPDATE players SET team_id = :teamId, updated_at = now() WHERE player_id = ANY (:playerIds::bigint[])";
      const res = await trxn.raw(sql, { teamId, playerIds });
      if (res.rowCount !== playerIds.length) {
        throw new IllegalArgumentError("Some of the players in input does not exist!");
      }
    });
  }

  async transferToTeam(fromTeamId: number, toTeamId: number, playerId: number): Promise<void> {
    await db.transaction(async (trxn) => {
      const isTeamFull = await this.isTeamFull(toTeamId, trxn);
      if (isTeamFull) {
        throw new InvalidStateError("Team is already full");
      }
      const sql =
        "UPDATE players SET team_id = :toTeamId, updated_at = now() WHERE player_id = :playerId and team_id = :fromTeamId";
      const res = await trxn.raw(sql, { toTeamId, playerId, fromTeamId });
      if (res.rowCount < 1) {
        throw new IllegalArgumentError("Player not in team");
      }
    });
  }

  async createPlayerUnit(payload: IPlayerUnits): Promise<IPlayerUnits> {
    const res = await db<IPlayerUnitsDao>("player_units").insert({ name: payload.name, value: payload.value }, "*");
    return nullableSingleResult(this.playerUnitsResultSetExtractor.extract(res));
  }

  async updatePlayerUnit(payload: IPlayerUnits): Promise<void> {
    const rowCount = await db<IPlayerUnitsDao>("player_units")
      .update({ value: payload.value })
      .where("name", "=", payload.name);
    if (rowCount < 1) {
      throw new InvalidStateError(`PlayerUnit - ${JSON.stringify(payload)} does not exists`);
    }
  }

  async deletePlayerUnit(name: string): Promise<void> {
    const rowCount = await db<IPlayerUnitsDao>("player_units").delete().where("name", "=", name);
    if (rowCount < 1) {
      throw new InvalidStateError(`PlayerUnit - ${name} does not exists`);
    }
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
