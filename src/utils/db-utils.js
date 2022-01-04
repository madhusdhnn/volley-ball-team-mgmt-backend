class SingleRowExtractor {
  extract(resultSet) {
    if (!resultSet) {
      return null;
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

export {singleRowExtractor, multipleRowsExtractor};
