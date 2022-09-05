import { Knex } from "knex";

const tableName = "user_tokens";
const usersTable = "users";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(
    `
    CREATE TABLE ${tableName}
    (
      id                 bigserial primary key,
      username           text                     NOT NULL,
      secret_key         text                     NOT NULL,
      token              text                     NOT NULL,
      last_used          timestamp with time zone NOT NULL
    );

    ALTER TABLE ONLY ${tableName}
        ADD CONSTRAINT ut_username_fk FOREIGN KEY (username) REFERENCES ${usersTable} (username);

    CREATE INDEX ut_username_fk_idx ON ${tableName} (username);
    `,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(tableName);
}
