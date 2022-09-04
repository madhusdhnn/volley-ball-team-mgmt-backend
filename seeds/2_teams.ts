import { Knex } from "knex";

const tableName = "teams";

export async function seed(knex: Knex): Promise<void> {
  await knex(tableName).del();

  await knex.schema.raw(
    `
    INSERT INTO ${tableName} (name, max_players, created_at, updated_at) VALUES 
      ('Team-A', 6, now(), now()),
      ('Team-B', 6, now(), now());
    `
  );
}
