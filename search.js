const { client, indexName } = require("./config");

const { logTitles } = require("./helpers");

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
 * run-func search.js term sodium 0
 */
module.exports.term = (field, value) => {
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
 * run-func search.js range sodium 0 10
 */
module.exports.range = (field, gte, lte) => {
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
 * run-func search.js fuzzy title pinapple 2
 */
module.exports.fuzzy = (field, value, fuzziness) => {
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
 * run-func search.js match title 'Tomato-garlic soup with dill'
 */
module.exports.match = (field, query) => {
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
 * run-func search.js slop directions "pizza pineapple" 10
 */
module.exports.slop = (field, query, slop) => {
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
 * run-func search.js query ingredients "(salmon|tuna) +tomato -onion" 100
 */
module.exports.query = (field, query, size) => {
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
 * run-func search.js boolean
 */
module.exports.boolean = () => {
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
