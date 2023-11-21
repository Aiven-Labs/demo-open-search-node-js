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
 * run-func index.js indexData
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
 * run-func index.js getMapping
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
