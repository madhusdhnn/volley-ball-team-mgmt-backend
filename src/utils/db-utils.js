class SingleRowExtractor {
  extract(resultSet) {
    if (!resultSet || !resultSet.rows) {
      return null;
    }

    if (resultSet.rows.length > 1) {
      throw new Error("Expected single row in resultset");
    }

    return resultSet.rows[0];
  }
}

class MultipleRowsExtractor {
  extract(resultSet) {
    if (!resultSet) {
      return [];
    }
    return resultSet.rows;
  }
}

const singleRowExtractor = new SingleRowExtractor();
const multipleRowsExtractor = new MultipleRowsExtractor();

export { singleRowExtractor, multipleRowsExtractor };
