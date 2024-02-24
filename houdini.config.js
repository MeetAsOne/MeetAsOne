/// <references types="houdini-svelte">

/** Converts an array of any type to a postgres-compatible record, which starts & ends with parentheses & seperated by comas
 * @param {array} array
 */
export function asRecord(array) {
  return "(" + array.map(val => JSON.stringify(val)).join(",") + ")";
}

/** @type {import('houdini').ConfigFile} */
const config = {
  "watchSchema": {
    "url": "https://swyjiuxnroxxokgcyepv.hasura.eu-central-1.nhost.run/v1/graphql"
  },
  "plugins": {
    "houdini-svelte": {}
  },
  scalars: {
    /* in your case, something like */
    timestamptz: {                  // <- The GraphQL Scalar
      type: "string"  // <-  The TypeScript type
    },
    uuid: {                  // <- The GraphQL Scalar
      type: "string"  // <-  The TypeScript type
    },
    smallint: {                  // <- The GraphQL Scalar
      type: "number"  // <-  The TypeScript type
    },
    jsonb: {                  // <- The GraphQL Scalar
      type: "Record<string, number[]>"  // <-  The TypeScript type
    },
    datetime_range: {                  // <- The GraphQL Scalar
      type: "[number, number]",  // <-  The TypeScript type
      /** Parse API response
             * @param {{start: number, stop: number}[]} ranges - The array containing 'start' and 'stop' properties.
             */
      unmarshal(ranges) {
        return ranges.map(({start, stop}) => [start, stop]);
      },
      /** Serialize to Graphql format
             * @param {import('./src/lib/timeutils.ts').DatetimeRange} datetimeRange
             */
      marshal(datetimeRange) {
        return asRecord(datetimeRange);
      }
    }
  }
};

export default config;
