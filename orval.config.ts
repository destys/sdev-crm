export default {
  strapi: {
    input: "./openapi.clean.json",
    output: {
      target: "./src/generated/strapi.ts",
      schemas: "./src/generated/model",
      client: "fetch",
      override: {
        mutator: {
          path: "./src/lib/fetcher.ts",
          name: "fetcher",
        },
      },
    },
  },
};
