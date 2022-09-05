import { Knex } from "knex";

const usersTable = "users";
const rolesTable = "roles";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(
    `
  CREATE TABLE ${rolesTable}
  (
    role_id    bigserial PRIMARY KEY,
    name       text                     NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
  );

  ALTER TABLE ONLY ${rolesTable}
    ADD CONSTRAINT role_name_unique UNIQUE (name);

  CREATE TABLE ${usersTable}
  (
    username           text PRIMARY KEY,
    password           text                     NOT NULL,
    enabled            boolean                  NOT NULL,
    first_name         text                     NOT NULL,
    last_name          text                     NOT NULL,
    profile_image_url  text,
    email_id           text,
    role_id            bigint                   NOT NULL,
    created_at         timestamp with time zone NOT NULL,
    updated_at         timestamp with time zone NOT NULL
  );

  ALTER TABLE ONLY ${usersTable}
    ADD CONSTRAINT user_role_id_fk FOREIGN KEY (role_id) REFERENCES ${rolesTable} (role_id);

  ALTER TABLE ONLY ${usersTable}
    ADD CONSTRAINT email_unique UNIQUE (email_id);

  CREATE INDEX user_role_id_fk_idx ON ${usersTable} (role_id);
  `,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(usersTable);
  await knex.schema.dropTableIfExists(rolesTable);
}
