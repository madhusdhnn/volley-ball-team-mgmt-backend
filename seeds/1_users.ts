import { Knex } from "knex";

const usersTable = "users";
const rolesTable = "roles";

export async function seed(knex: Knex): Promise<void> {
  await knex(rolesTable).del();
  await knex(usersTable).del();

  await knex.raw(
    `
    INSERT INTO ${rolesTable} (name, created_at, updated_at) VALUES 
        ('ADMIN', now(), now()),
        ('PLAYER', now(), now());
    `,
  );

  await knex.raw(
    `
    INSERT INTO ${usersTable} (username, password, enabled, first_name, last_name, role_id, created_at, updated_at) VALUES 
    ('rGeller', '$2a$10$aOMprWWvZniSBhkTE7d/a.00lSdxBwTo17/opkDCFpILJgKinTII.', true, 'Ross', 'Geller', 2,
    '2022-01-07 13:21:05.995268', '2022-01-07 13:21:05.995268'),
    ('cBing', '$2a$10$trrSxiUw77oiedCIfG94g.00EJn.O0Wsoaz8U2QteSgme6b3Irxr.', true, 'Chandler', 'Bing', 2, 
    '2022-01-07 13:21:05.993923', '2022-01-07 13:21:05.993923'),
    ('rGreen', '$2a$10$LFLq.uo3Oo8gbeNaZpdLvOqA/PfaONMBu0vZaJg4IZo4jz4O1UvHS', true, 'Rachel', 'Green', 2, 
    '2022-01-07 13:21:05.996447', '2022-01-07 13:21:05.996447'),
    ('jTribbianni', '$2a$10$DMbS6VlT1Z2ilsaebarewuazFlGRt4moU5aA/L1C6l9qMWrGs7.tO', true, 'Joey', 'Tribbianni', 2,
    '2022-01-07 13:21:05.991583', '2022-01-07 13:21:05.991583'),
    ('mGeller', '$2a$10$xnMkvEhVVqJNxWN81/Rbt.LiIzz88Hv8GrU.4455FEoJoWaMh94Sy', true, 'Monica', 'Geller', 2,
    '2022-01-07 13:21:05.995934', '2022-01-07 13:21:05.995934'),
    ('pBuffay', '$2a$10$DAcxcx/az7gVfRnzR/3P2O.B1pQiPULAP6Vr9VFgwsTrELO8vezsu', true, 'Phoebe', 'Buffay', 2,
    '2022-01-07 13:21:05.996953', '2022-01-07 13:21:05.996953'),
    ('admin', '$2a$10$ZJvSceHhLl2bcbMyBRUMqeeQDB4K7v79DulFznVZFF0X1.L4S4G9i', true, 'David', 'Crane', 1, 
    '2022-01-08 10:44:42.909740', '2022-01-08 10:44:42.909740'),
    ('gunther', '$2a$12$dTc4qbiNSFIufk3EX2UjcedUO4Hxjose54bAg/Vzle/vPnLJ/3Xna', true, 'Gunther', '', 2,
    '2022-02-10 11:04:42.365', '2022-02-10 11:04:42.365'),
    ('jHosenstein', '$2a$12$iIG3PhsYzDxskL73N4QuYOCYpHMdh5K6hmuP9mjSkswjEzkRBZq82', true, 'Janice', 'Hosenstein', 2,
    '2022-02-11 09:04:42.365', '2022-02-11 09:04:42.365'),
    ('rBurk', '$2a$12$daFp/w1arwCNFZkQCRwkxu2BzB02H21cWyfPvT8XEh3armtr9rjF6', true, 'Richard', 'Burk', 2,
    '2022-02-11 11:04:42.365', '2022-02-11 11:04:42.365');
    `,
  );
}
