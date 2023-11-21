const { client, indexName: index } = require("./config");
const { logAggs } = require("./helpers");

/**
 * Calculate average rating of all documents
 * run-func aggregate.js averageRating
 */
module.exports.averageRating = () => {
  client.search(
    {
      index,
      body: {
        aggs: {
          "average-rating": {
            // aggregation name
            avg: {
              // one of the supported aggregation types
              field: "rating", // list of properties for the aggregation
            },
          },
        },
      },
      size: 0, // ignore `hits`
    },
    (error, result) => {
      // callback to log the output
      if (error) {
        console.error(error);
      } else {
        console.log(result.body.aggregations["average-rating"]);
      }
    }
  );
};



/**
 * Get metric aggregations for the field
 * Examples: avg, min, max, stats, extended_stats, percentiles, terms
 * run-func aggregate.js metric avg rating
 */
module.exports.metric = (metric, field) => {
  const body = {
    aggs: {
      [`aggs-for-${field}`]: {
        // aggregation name, which you choose
        [metric]: {
          // one of the supported aggregation types
          field,
        },
      },
    },
  };
  client.search(
    {
      index,
      body,
      size: 0, // ignore `hits`
    },
    logAggs.bind(this, `aggs-for-${field}`) // callback to log the aggregation output
  );
};

/**
 * Group recipes into bucket based on sodium levels
 * run-func aggregate.js sodiumRange
 */
module.exports.sodiumRange = () => {
  client.search(
    {
      index,
      body: {
        aggs: {
          "sodium-ranges": {
            // aggregation name
            range: {
              // range aggregation
              field: "sodium", // field to use for the aggregation
              ranges: [
                // the buckets we want
                { to: 500.0 },
                { from: 500.0, to: 1000.0 },
                { from: 1000.0 },
              ],
            },
          },
        },
      },
      size: 0,
    },
    (error, result) => {
      // callback to output the result
      if (error) {
        console.error(error);
      } else {
        console.log(result.body.aggregations["sodium-ranges"]);
      }
    }
  );
};

/**
 * Group recipes into bucket based on the provided field and set of ranges
 * run-func aggregate.js range sodium 500 1000
 */
module.exports.range = (field, ...values) => {
  // map values to list of ranges in format 'from X'/'to Y'
  const ranges = values.map((value, index) => ({
    from: values[index - 1],
    to: value,
  }));
  // account for the last item 'from X to infinity'
  ranges.push({
    from: values[values.length - 1],
  });

  const body = {
    aggs: {
      [`range-aggs-for-${field}`]: {
        range: {
          field,
          ranges,
        },
      },
    },
  };
  client.search(
    {
      index,
      body,
      size: 0,
    },
    logAggs.bind(this, `range-aggs-for-${field}`)
  );
};

/**
 * Group recipes into buckets for every unique value
 * `run-func aggregate.js terms categories.keyword 20`
 */
module.exports.terms = (field, size) => {
  const body = {
    aggs: {
      [`terms-aggs-for-${field}`]: {
        terms: {
          // aggregate data by unique terms
          field,
          size, // max number of buckets generated, default value is 10
        },
      },
    },
  };
  client.search(
    {
      index,
      body,
      size: 0,
    },
    logAggs.bind(this, `terms-aggs-for-${field}`)
  );
};

/**
 * Group recipes into buckets to find the most rare items
 * `run-func aggregate.js rareTerms categories.keyword 3`
 */
module.exports.rareTerms = (field, max) => {
  const body = {
    aggs: {
      [`rare-terms-aggs-for-${field}`]: {
        rare_terms: {
          field,
          max_doc_count: max, // get buckets that contain no more than max items
        },
      },
    },
  };
  client.search(
    {
      index,
      body,
      size: 0,
    },
    logAggs.bind(this, `rare-terms-aggs-for-${field}`)
  );
};

/**
 * Date histogram with a time interval
 * `run-func aggregate.js dateHistogram date year`
 */
module.exports.dateHistogram = (field, interval) => {
  const body = {
    aggs: {
      [`histogram-for-${field}`]: {
        date_histogram: {
          // aggregation type
          field,
          interval, // such as minute, hour, day, month or year
        },
      },
    },
  };
  client.search(
    {
      index,
      body,
      size: 0,
    },
    logAggs.bind(this, `histogram-for-${field}`)
  );
};

/**
 * Calculating the moving average of number of added recipes across years
 * `run-func aggregate.js movingAverage`
 */
module.exports.movingAverage = () => {
  const body = {
    aggs: {
      recipes_per_year: {
        // 1. date histogram
        date_histogram: {
          field: "date",
          interval: "year",
        },
        aggs: {
          recipes_count: {
            // 2. metric aggregation to count new recipes
            value_count: { // aggregate by number of documents with field 'date'
              field: "date"
            },
          },
          moving_average: {
            moving_fn: {
              // 3. glue the aggregations
              script: "MovingFunctions.unweightedAvg(values)", // 4. a built-in function
              shift: 1, // 5. take into account the existing year as part of the window
              window: 3, // 6. set size of the moving window
              buckets_path: "recipes_count",
              gap_policy: "insert_zeros", // account for years where no recipes were
              // added and replace null value with zeros
            },
          },
        },
      },
    },
  };
  client.search(
    {
      index,
      body,
      size: 0,
    },
    (error, result) => {
      if (error) {
        console.error(error);
      } else {
        console.log(result.body.aggregations["recipes_per_year"].buckets);
      }
    }
  );
};
