import { QueryResult, QueryResultRow } from "pg";
import { IncorrectResultSetDataAccessError } from "./error-utils";

export interface IRowExtractor<D extends QueryResultRow, T> {
  extract(resultSet?: QueryResult<D>): T | T[];
}

export interface IRowMapper<D, T> {
  mapRow(row: D, rowNumber: number): T;
}

export interface IResultSetExtractor<D extends QueryResultRow, T> {
  extract(resultSet: QueryResult<D>): T;
}

export class RowMapperResultSetExtractor<D extends QueryResultRow, T> implements IResultSetExtractor<D, T[]> {
  private readonly rowMapper: IRowMapper<D, T>;
  private readonly rowsExpected: number;

  constructor(rowMapper: IRowMapper<D, T>, rowsExpected = 0) {
    this.rowMapper = rowMapper;
    this.rowsExpected = rowsExpected;
  }

  extract(resultSet: QueryResult<D>): T[] {
    const results: T[] = this.rowsExpected > 0 ? Array(this.rowsExpected) : [];
    let rowNum = 0;
    for (const row of resultSet.rows) {
      rowNum = rowNum + 1;
      results.push(this.rowMapper.mapRow(row, rowNum));
    }
    return results;
  }
}

export const nullableSingleResult = <T>(results: T[]): T => {
  if (!results || results.length === 0) {
    return null as T;
  }

  if (results.length > 1) {
    throw new IncorrectResultSetDataAccessError(`Incorrect result size. Expected - 1. Got - ${results.length}`);
  }

  return results[0] as T;
};
