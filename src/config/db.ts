import { knex } from "knex";
import knexConfig from "../knexfile";
import { attachPaginate } from "knex-paginate";

const db = knex(knexConfig[process.env.NODE_ENV as string]);
attachPaginate();

export default db;
