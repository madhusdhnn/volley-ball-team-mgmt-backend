create table player_units
(
    id    bigserial primary key,
    name  text not null,
    value text not null
);

insert into player_units (name, value)
values ('HEIGHT', 'CM');
insert into player_units (name, value)
values ('WEIGHT', 'KG');
insert into player_units (name, value)
values ('SPEED', 'KMPS');

create table teams
(
    team_id     bigserial primary key,
    name        text                     not null,
    max_players integer                  not null,
    created_at  timestamp with time zone not null,
    updated_at  timestamp with time zone not null
);

alter table teams
    add constraint team_name_unique unique (name);

create table players
(
    player_id           bigserial primary key,
    team_id             bigint,
    name                text                     not null,
    age                 integer,
    height              numeric(5, 2),
    weight              numeric(5, 2),
    power               integer,
    speed               integer,
    favourite_positions text,
    created_at          timestamp with time zone not null,
    updated_at          timestamp with time zone not null
);

alter table players
    add constraint player_team_id_fk foreign key (team_id) references teams (team_id) ON DELETE SET NULL;
