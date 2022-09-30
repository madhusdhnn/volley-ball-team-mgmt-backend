import { Knex } from "knex";

const tableName = "teams";

export async function seed(knex: Knex): Promise<void> {
  await knex(tableName).del();

  await knex.schema.raw(
    `
    INSERT INTO ${tableName} (name, coach_name, max_players, created_at, updated_at) VALUES 
      ('Team-A', 'Ross Geller', 6, now(), now()),
      ('Team-B', 'Monica Geller', 6, now(), now());
    `,
  );
}
