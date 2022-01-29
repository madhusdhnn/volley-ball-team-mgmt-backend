-- AUTHENTICATION & AUTHORIZATION

CREATE TABLE roles
(
    role_id    bigserial PRIMARY KEY,
    name       text                     NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

ALTER TABLE ONLY roles
    ADD CONSTRAINT role_name_unique UNIQUE (name);

INSERT INTO roles (name, created_at, updated_at)
VALUES ('ADMIN', now(), now()),
       ('PLAYER', now(), now());

CREATE TABLE users
(
    username   text PRIMARY KEY,
    password   text                     NOT NULL,
    enabled    boolean                  NOT NULL,
    role_id    bigint                   NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

ALTER TABLE ONLY users
    ADD CONSTRAINT user_role_id_fk FOREIGN KEY (role_id) REFERENCES roles (role_id);

CREATE INDEX user_role_id_fk_idx ON users (role_id);

INSERT INTO users (username, password, enabled, role_id, created_at, updated_at)
VALUES ('rGeller', '$2a$10$aOMprWWvZniSBhkTE7d/a.00lSdxBwTo17/opkDCFpILJgKinTII.', true, 2,
        '2022-01-07 13:21:05.995268', '2022-01-07 13:21:05.995268'),
       ('cBing', '$2a$10$trrSxiUw77oiedCIfG94g.00EJn.O0Wsoaz8U2QteSgme6b3Irxr.', true, 2, '2022-01-07 13:21:05.993923',
        '2022-01-07 13:21:05.993923'),
       ('rGreen', '$2a$10$LFLq.uo3Oo8gbeNaZpdLvOqA/PfaONMBu0vZaJg4IZo4jz4O1UvHS', true, 2, '2022-01-07 13:21:05.996447',
        '2022-01-07 13:21:05.996447'),
       ('jTribbianni', '$2a$10$DMbS6VlT1Z2ilsaebarewuazFlGRt4moU5aA/L1C6l9qMWrGs7.tO', true, 2,
        '2022-01-07 13:21:05.991583', '2022-01-07 13:21:05.991583'),
       ('mGeller', '$2a$10$xnMkvEhVVqJNxWN81/Rbt.LiIzz88Hv8GrU.4455FEoJoWaMh94Sy', true, 2,
        '2022-01-07 13:21:05.995934', '2022-01-07 13:21:05.995934'),
       ('pBuffay', '$2a$10$DAcxcx/az7gVfRnzR/3P2O.B1pQiPULAP6Vr9VFgwsTrELO8vezsu', true, 2,
        '2022-01-07 13:21:05.996953', '2022-01-07 13:21:05.996953'),
       ('admin', '$2a$10$ZJvSceHhLl2bcbMyBRUMqeeQDB4K7v79DulFznVZFF0X1.L4S4G9i', true, 1, '2022-01-08 10:44:42.909740',
        '2022-01-08 10:44:42.909740');

CREATE TABLE user_tokens
(
    id                 bigserial primary key,
    username           text                     NOT NULL,
    secret_key         text                     NOT NULL,
    token              text                     NOT NULL,
    last_used          timestamp with time zone NOT NULL
);

ALTER TABLE ONLY user_tokens
    ADD CONSTRAINT ut_username_fk FOREIGN KEY (username) REFERENCES users (username);

CREATE INDEX ut_username_fk_idx ON user_tokens (username);

-- PLAYERS & TEAMS

CREATE TABLE player_units
(
    id    bigserial PRIMARY KEY,
    name  text NOT NULL,
    value text NOT NULL
);

INSERT INTO player_units (name, value)
VALUES ('HEIGHT', 'CM'),
       ('WEIGHT', 'KG'),
       ('SPEED', 'KMPS');

CREATE TABLE teams
(
    team_id     bigserial PRIMARY KEY,
    name        text                     NOT NULL,
    max_players integer                  NOT NULL,
    created_at  timestamp with time zone NOT NULL,
    updated_at  timestamp with time zone NOT NULL
);

ALTER TABLE ONLY teams
    ADD CONSTRAINT team_name_unique UNIQUE (name);

INSERT INTO teams (name, max_players, created_at, updated_at)
VALUES ('friends-girls', 6, '2022-01-07 18:53:00.582000', '2022-01-07 18:53:04.598000'),
       ('friends-boys', 6, '2022-01-07 18:52:43.253000', '2022-01-07 18:52:47.277000');

CREATE TABLE players
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
    favourite_positions text,
    created_at          timestamp with time zone NOT NULL,
    updated_at          timestamp with time zone NOT NULL
);

ALTER TABLE ONLY players
    ADD CONSTRAINT player_team_id_fk FOREIGN KEY (team_id) REFERENCES teams (team_id) ON DELETE SET NULL;

ALTER TABLE ONLY players
    ADD CONSTRAINT player_username_fk FOREIGN KEY (username) REFERENCES users (username);

CREATE INDEX player_team_id_fk_idx ON players (team_id);

CREATE INDEX player_username_fk_idx ON players (username);

INSERT INTO players (username, team_id, name, shirt_no, age, height, weight, power, speed, favourite_positions,
                     created_at,
                     updated_at)
VALUES ('rGeller', 2, 'Ross Geller', 3, null, null, null, null, null, null, '2022-01-08 06:17:39.397000',
        '2022-01-08 06:17:41.791000'),
       ('rGreen', 1, 'Rachel Green', 5, null, null, null, null, null, null, '2022-01-08 06:18:19.932000',
        '2022-01-08 06:18:21.554000'),
       ('cBing', 2, 'Chandler Bing', 2, null, null, null, null, null, null, '2022-01-08 06:17:12.398000',
        '2022-01-08 06:17:10.256000'),
       ('mGeller', 1, 'Monica Geller', 4, null, null, null, null, null, null, '2022-01-08 06:17:53.104000',
        '2022-01-08 06:17:50.599000'),
       ('pBuffay', 1, 'Phoebe Buffay', 6, null, null, null, null, null, null, '2022-01-08 06:18:23.044000',
        '2022-01-08 06:18:23.949000'),
       ('jTribbianni', 2, 'Joey Tribbianni', 1, null, null, null, null, null, null, '2022-01-08 06:16:57.303000',
        '2022-01-08 06:17:01.676000');
