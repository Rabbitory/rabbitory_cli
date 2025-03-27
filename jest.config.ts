import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"], // Ensures Jest looks in "src" instead of "dist"
  testMatch: ["**/_tests_/**/*.test.ts"], // Matches test files inside _tests_ folders
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"], // Ensures TS files are recognized
  transform: {
    "^.+\\.tsx?$": "ts-jest", // Transforms TypeScript files with ts-jest
  },
  collectCoverage: true, // Optional: Collects test coverage
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"], // Ignores node_modules & dist
};

export default config;