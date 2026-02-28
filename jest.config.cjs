const { createDefaultPreset } = require("ts-jest");

const tsJestPreset = createDefaultPreset({
  tsconfig: "tsconfig.jest.json"
});

module.exports = {
  ...tsJestPreset,
  testEnvironment: "node",
  clearMocks: true,
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/index.ts"
  ]
};