import { knex } from "knex";
import knexConfig from "../knexfile";

const db = knex(knexConfig[process.env.NODE_ENV as string]);
export default db;
