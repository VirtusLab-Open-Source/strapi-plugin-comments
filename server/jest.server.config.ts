import type { JestConfigWithTsJest } from 'ts-jest';
import { defaults as tsjPreset } from 'ts-jest/presets';


const ESM_ONLY_PACKAGES = [
  'htmlparser2',
  'domhandler',
  'domutils',
  'domelementtype',
  'dom-serializer',
  'entities',
];

const config: JestConfigWithTsJest = {
  testMatch: ["**/__tests__/**/?(*.)+(spec|test).(t|j)s"],
  transform: {
    ...tsjPreset.transform,
    // sanitize-html >= 2.18 depends on htmlparser2 v12, which ships ESM only.
    // Compile those packages to CommonJS so Jest can load them.
    '^.+/node_modules/.+\\.js$': ['ts-jest', { tsconfig: { allowJs: true }, diagnostics: false }],
  },
  transformIgnorePatterns: [
    `/node_modules/(?!(${ESM_ONLY_PACKAGES.join('|')})/)`,
  ],
  preset: "ts-jest",
  coverageDirectory: "./coverage/",
  collectCoverage: true,
  reporters: [ "default", "jest-junit" ],
  globals: {
    // "ts-jest": {
    //   diagnostics: {
    //     warnOnly: true,
    //   },
    // },
  },
};

export default config;
