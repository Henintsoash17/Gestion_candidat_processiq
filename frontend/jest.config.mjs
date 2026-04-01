import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  coverageProvider: "v8",
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "src/contexts/**/*.{ts,tsx}",
    "!src/lib/types.ts",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
  ],
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  coverageReporters: ["text", "lcov", "json-summary"],
};

export default createJestConfig(customJestConfig);
