const { client, indexName, recipes } = require("./config");

const { logBody, logTitles } = require("./helpers");

/**
 * Getting existing indices in the cluster.
 */
module.exports.getExistingIndices = () => {
  console.log(`Getting existing indices:`);
  client.cat.indices({ format: "json" }, logBody);
};

/**
 * Indexing data from json file with recipes.
 */
module.exports.indexData = () => {
  console.log(`Ingesting data: ${recipes.length} recipes`);
  const body = recipes.flatMap((doc) => [
    { index: { _index: indexName } },
    doc,
  ]);

  client.bulk({ refresh: true, body }, logBody);
};

/**
 * Retrieving mapping for the index.
 */
module.exports.getMapping = () => {
  console.log(`Retrieving mapping for the index with name ${indexName}`);

  client.indices.getMapping({ index: indexName }, (error, result) => {
    if (error) {
      console.error(error);
    } else {
      console.log(result.body.recipes.mappings.properties);
    }
  });
};

/**
 * Example of using the Lucene query string syntax
 */
module.exports.qSearch = () => {
  client.search(
    {
      index: "recipes",
      q: "ingredients:broccoli AND calories:(>=100 AND <200)",
    },
    logTitles
  );
};

/**
 * Searching for exact matches of a value in a field.
 */
module.exports.termSearch = (field, value) => {
  console.log(`Searching for values in the field ${field} equal to ${value}`);
  const body = {
    query: {
      term: {
        [field]: value,
      },
    },
  };
  client.search(
    {
      index: indexName,
      body,
    },
    logTitles
  );
};

/**
 * Searching for a range of values in a field.
 */
module.exports.rangeSearch = (field, gte, lte) => {
  console.log(
    `Searching for values in the ${field} ranging from ${gte} to ${lte}`
  );
  const body = {
    query: {
      range: {
        [field]: {
          gte,
          lte,
        },
      },
    },
  };
  client.search(
    {
      index: indexName,
      body,
    },
    logTitles
  );
};

/**
 * Specifying fuzziness to account for typos and misspelling.
 */
module.exports.fuzzySearch = (field, value, fuzziness) => {
  console.log(
    `Search for ${value} in the ${field} with fuzziness set to ${fuzziness}`
  );
  const query = {
    query: {
      fuzzy: {
        [field]: {
          value,
          fuzziness,
        },
      },
    },
  };
  client.search(
    {
      index: indexName,
      body: query,
    },
    logTitles
  );
};

/**
 * Finding matches sorted by relevance.
 */
module.exports.matchSearch = (field, query) => {
  console.log(`Searching for ${query} in the field ${field}`);
  const body = {
    query: {
      match: {
        [field]: {
          query,
        },
      },
    },
  };
  client.search(
    {
      index: indexName,
      body,
    },
    logTitles
  );
};

/**
 * Specifying a slop - a distance between search words.
 */
module.exports.slopSearch = (field, query, slop) => {
  console.log(
    `Searching for ${query} with slop value ${slop} in the field ${field}`
  );
  const body = {
    query: {
      match_phrase: {
        [field]: {
          query,
          slop,
        },
      },
    },
  };
  client.search(
    {
      index: indexName,
      body,
    },
    logTitles
  );
};

/**
 * Using special operators within a query string and a size parameter.
 */
module.exports.querySearch = (field, query, size) => {
  console.log(
    `Searching for ${query} in the field ${field} and returning maximum ${size} results`
  );
  const body = {
    query: {
      query_string: {
        default_field: field,
        query,
      },
    },
  };
  client.search(
    {
      index: indexName,
      body,
      size,
    },
    logTitles
  );
};

/**
 * Combining several queries together
 */
module.exports.booleanSearch = () => {
  console.log(
    `Searching for quick and easy recipes without garlic with low sodium and high protein`
  );
  const body = {
    query: {
      bool: {
        must: { match: { categories: "Quick & Easy" } },
        must_not: { match: { ingredients: "garlic" } },
        filter: [
          { range: { sodium: { lte: 50 } } },
          { range: { protein: { gte: 5 } } },
        ],
      },
    },
  };
  client.search(
    {
      index: indexName,
      body,
    },
    logTitles
  );
};

/**
 * Deleting the index
 */
module.exports.deleteIndex = () => {
  client.indices.delete(
    {
      index: indexName,
    },
    logBody
  );
};
