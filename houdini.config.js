/// <references types="houdini-svelte">

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
    }
}

export default config
