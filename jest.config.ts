import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/aws", "<rootDir>/cli"],
  testMatch: ["**/_tests_/**/*.test.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  collectCoverage: true,
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
};

export default config;