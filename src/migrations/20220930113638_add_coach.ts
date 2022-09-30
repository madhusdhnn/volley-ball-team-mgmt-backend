import { Knex } from "knex";

const tableName = "teams";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`ALTER TABLE ${tableName} ADD COLUMN coach_name TEXT DEFAULT NULL`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw(`ALTER TABLE ${tableName} DROP COLUMN coach_name`);
}
