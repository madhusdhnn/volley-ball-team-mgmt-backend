import { Knex } from "knex";

const playerUnitsTable = "player_units";
const playersTable = "players";

export async function seed(knex: Knex): Promise<void> {
  await knex(playerUnitsTable).del();
  await knex(playersTable).del();

  await knex.schema.raw(
    `
    INSERT INTO ${playerUnitsTable} (name, value) VALUES 
      ('HEIGHT', 'CM'),
      ('WEIGHT', 'KG'),
      ('SPEED', 'KMPS');
    `,
  );

  await knex.schema.raw(
    `
    INSERT INTO ${playersTable} (username, player_type, team_id, name, shirt_no, age, height, 
        weight, power, speed, location, favourite_positions, created_at, updated_at) VALUES 
        ('rGeller', 'COACH', 2, 'Ross Geller', 3, null, null, null, null, null, null, null, '2022-01-08 06:17:39.397000', '2022-01-08 06:17:41.791000'),
        ('rGreen', 'PLAYER', 1, 'Rachel Green', 5, null, null, null, null, null, null, null, '2022-01-08 06:18:19.932000', '2022-01-08 06:18:21.554000'),
        ('cBing', 'PLAYER', 2, 'Chandler Bing', 2, null, null, null, null, null, null, null, '2022-01-08 06:17:12.398000', '2022-01-08 06:17:10.256000'),
        ('mGeller', 'COACH', 1, 'Monica Geller', 4, null, null, null, null, null, null, null, '2022-01-08 06:17:53.104000', '2022-01-08 06:17:50.599000'),
        ('pBuffay', 'PLAYER', 1, 'Phoebe Buffay', 6, null, null, null, null, null, null, null, '2022-01-08 06:18:23.044000', '2022-01-08 06:18:23.949000'),
        ('jTribbianni', 'PLAYER', 2, 'Joey Tribbianni', 1, null, null, null, null, null, null, null, '2022-01-08 06:16:57.303000', '2022-01-08 06:17:01.676000'),
        ('gunther', 'PLAYER', null, 'Gunther', 7, null, null, null, null, null, null, null, '2022-02-11 11:04:42.365', '2022-02-11 11:04:42.365'),
        ('jHosenstein', 'PLAYER', null, 'Janice Hosenstein', 8, null, null, null, null, null, null, null, '2022-02-11 11:04:42.365', '2022-02-11 11:04:42.365'),
        ('rBurk', 'PLAYER', null, 'Richard Burk', 9, null, null, null, null, null, null, null, '2022-02-11 11:04:42.365', '2022-02-11 11:04:42.365');
    `,
  );
}
