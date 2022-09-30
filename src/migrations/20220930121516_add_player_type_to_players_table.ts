import { Knex } from "knex";

const tableName = "players";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`ALTER TABLE ${tableName} ADD COLUMN player_type TEXT DEFAULT NULL`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw(`ALTER TABLE ${tableName} DROP COLUMN player_type`);
}
