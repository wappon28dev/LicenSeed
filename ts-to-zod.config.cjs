module.exports = [
  {
    name: "bindings",
    input: "./src/types/bindings.types.ts",
    output: "./src/types/bindings.schema.ts",
    getSchemaName: (id) => `z${id}`,
  },
];
