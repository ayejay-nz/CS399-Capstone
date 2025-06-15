import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

export default createJestConfig(<Config>{
  rootDir: ".",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.tsx"],
  roots: ["<rootDir>/tests"],              
  moduleNameMapper: {
    "^@/src/(.*)$": "<rootDir>/src/$1",      
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
  },
  collectCoverageFrom: ["src/**/*.{ts,tsx}"],
});
