import { Knex } from "knex";

const usersTable = "users";
const rolesTable = "roles";
const playerUnitsTable = "player_units";
const playersTable = "players";
const teamsTable = "teams";

export async function seed(knex: Knex): Promise<void> {
  await knex(playerUnitsTable).delete();
  await knex(playersTable).delete();
  await knex(teamsTable).delete();
  await knex(usersTable).delete();
  await knex(rolesTable).delete();

  await knex.raw(
    `
    INSERT INTO ${rolesTable} (name, created_at, updated_at) VALUES 
        ('ADMIN', now(), now()),
        ('COACH', now(), now()),
        ('PLAYER', now(), now()) RETURNING role_id;
    `,
  );

  await knex.raw(
    `
    INSERT INTO ${usersTable} (username, password, enabled, first_name, last_name, role_id, created_at, updated_at) VALUES 
    ('rGeller', '$2a$10$aOMprWWvZniSBhkTE7d/a.00lSdxBwTo17/opkDCFpILJgKinTII.', true, 'Ross', 'Geller', 2,
    '2022-01-07 13:21:05.995268', '2022-01-07 13:21:05.995268'),
    ('cBing', '$2a$10$trrSxiUw77oiedCIfG94g.00EJn.O0Wsoaz8U2QteSgme6b3Irxr.', true, 'Chandler', 'Bing', 3, 
    '2022-01-07 13:21:05.993923', '2022-01-07 13:21:05.993923'),
    ('rGreen', '$2a$10$LFLq.uo3Oo8gbeNaZpdLvOqA/PfaONMBu0vZaJg4IZo4jz4O1UvHS', true, 'Rachel', 'Green', 3, 
    '2022-01-07 13:21:05.996447', '2022-01-07 13:21:05.996447'),
    ('jTribbianni', '$2a$10$DMbS6VlT1Z2ilsaebarewuazFlGRt4moU5aA/L1C6l9qMWrGs7.tO', true, 'Joey', 'Tribbianni', 3,
    '2022-01-07 13:21:05.991583', '2022-01-07 13:21:05.991583'),
    ('mGeller', '$2a$10$xnMkvEhVVqJNxWN81/Rbt.LiIzz88Hv8GrU.4455FEoJoWaMh94Sy', true, 'Monica', 'Geller', 2,
    '2022-01-07 13:21:05.995934', '2022-01-07 13:21:05.995934'),
    ('pBuffay', '$2a$10$DAcxcx/az7gVfRnzR/3P2O.B1pQiPULAP6Vr9VFgwsTrELO8vezsu', true, 'Phoebe', 'Buffay', 3,
    '2022-01-07 13:21:05.996953', '2022-01-07 13:21:05.996953'),
    ('admin', '$2a$10$ZJvSceHhLl2bcbMyBRUMqeeQDB4K7v79DulFznVZFF0X1.L4S4G9i', true, 'David', 'Crane', 1, 
    '2022-01-08 10:44:42.909740', '2022-01-08 10:44:42.909740'),
    ('gunther', '$2a$12$dTc4qbiNSFIufk3EX2UjcedUO4Hxjose54bAg/Vzle/vPnLJ/3Xna', true, 'Gunther', '', 3,
    '2022-02-10 11:04:42.365', '2022-02-10 11:04:42.365'),
    ('jHosenstein', '$2a$12$iIG3PhsYzDxskL73N4QuYOCYpHMdh5K6hmuP9mjSkswjEzkRBZq82', true, 'Janice', 'Hosenstein', 3,
    '2022-02-11 09:04:42.365', '2022-02-11 09:04:42.365'),
    ('rBurk', '$2a$12$daFp/w1arwCNFZkQCRwkxu2BzB02H21cWyfPvT8XEh3armtr9rjF6', true, 'Richard', 'Burk', 3,
    '2022-02-11 11:04:42.365', '2022-02-11 11:04:42.365');
    `,
  );

  await knex.schema.raw(
    `
    INSERT INTO ${teamsTable} (name, coach_name, max_players, created_at, updated_at) VALUES 
      ('Team-A', 'Ross Geller', 6, now(), now()),
      ('Team-B', 'Monica Geller', 6, now(), now());
    `,
  );

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
