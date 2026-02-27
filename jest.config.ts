import type { Config } from 'jest';

const config: Config = {
  silent: true,
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  extensionsToTreatAsEsm: ['.ts'],
  transformIgnorePatterns: ['/node_modules/(?!(\\.pnpm|uuid))'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            decorators: true,
          },
          target: 'es2021',
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
        },
        module: {
          type: 'es6',
        },
      },
    ],
    '^.+\\.js$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'ecmascript',
          },
          target: 'es2021',
        },
        module: {
          type: 'es6',
        },
      },
    ],
  },
};

export default config;
