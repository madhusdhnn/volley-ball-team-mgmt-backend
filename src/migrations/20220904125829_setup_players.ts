import { Knex } from "knex";

const playerUnitsTable = "player_units";
const playersTable = "players";
const usersTable = "users";
const teamsTeable = "teams";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(
    `
    CREATE TABLE ${playerUnitsTable}
    (
      id    bigserial PRIMARY KEY,
      name  text NOT NULL,
      value text NOT NULL
    );

    CREATE TABLE ${playersTable}
    (
      player_id           bigserial PRIMARY KEY,
      username            text                     NOT NULL,
      team_id             bigint,
      name                text                     NOT NULL,
      shirt_no            integer                  NOT NULL,
      age                 integer,
      height              numeric(5, 2),
      weight              numeric(5, 2),
      power               integer,
      speed               integer,
      location            text,
      favourite_positions text,
      created_at          timestamp with time zone NOT NULL,
      updated_at          timestamp with time zone NOT NULL
    );

    ALTER TABLE ONLY ${playersTable}
      ADD CONSTRAINT player_team_id_fk FOREIGN KEY (team_id) REFERENCES ${teamsTeable} (team_id) ON DELETE SET NULL;

    ALTER TABLE ONLY ${playersTable}
      ADD CONSTRAINT player_username_fk FOREIGN KEY (username) REFERENCES ${usersTable} (username);

      ALTER TABLE ONLY ${playersTable} ADD CONSTRAINT player_username_unique UNIQUE (username);

    CREATE INDEX player_team_id_fk_idx ON ${playersTable} (team_id);

    CREATE INDEX player_username_fk_idx ON ${playersTable} (username);
    `,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(playerUnitsTable);
  await knex.schema.dropTableIfExists(playersTable);
}
