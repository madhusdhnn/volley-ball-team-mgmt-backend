import { Knex } from "knex";

const tableName = "teams";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(
    `
    CREATE TABLE ${tableName}
    (
      team_id     bigserial PRIMARY KEY,
      name        text                     NOT NULL,
      max_players integer                  NOT NULL,
      created_at  timestamp with time zone NOT NULL,
      updated_at  timestamp with time zone NOT NULL
    );

    ALTER TABLE ONLY ${tableName}
      ADD CONSTRAINT team_name_unique UNIQUE (name);
    `,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(tableName);
}
