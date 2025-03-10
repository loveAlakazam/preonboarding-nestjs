import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.paths.json";

export default {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "./",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
  testMatch: [
    // "**/src/modules/**/*.spec.ts",
    "**/test/modules/**/*.spec.ts",
  ],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*(t|j)s", "!src/main.ts", "!src/**/index.ts"],
  coverageDirectory: "./coverage",
  testEnvironment: "node",
};
