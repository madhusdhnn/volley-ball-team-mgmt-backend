import { IncorrectResultSetDataAccessError } from "./error-utils";

export interface IRowMapper<TDao, TResult> {
  mapRow(row: TDao, rowNumber: number): TResult;
}

export interface IResultSetExtractor<TDao, TResult> {
  extract(rows: TDao[]): TResult;
}

export class RowMapperResultSetExtractor<TDao, TResult> implements IResultSetExtractor<TDao, TResult[]> {
  private rowMapper: IRowMapper<TDao, TResult>;
  private rowsExpected: number;

  constructor(rowMapper: IRowMapper<TDao, TResult>, rowsExpected = 0) {
    this.rowMapper = rowMapper;
    this.rowsExpected = rowsExpected;
  }

  extract(rows: TDao[]): TResult[] {
    const results: TResult[] = this.rowsExpected > 0 ? Array(this.rowsExpected) : [];
    let rowNum = 0;
    for (const row of rows) {
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
