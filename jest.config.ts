import type { Config } from "@jest/types";
import { defaults as tsjPreset } from "ts-jest/presets";

const config: Config.InitialOptions = {
  name: "Unit test",
  testMatch: ["**/__tests__/?(*.)+(spec|test).(t|j)s"],
  transform: {
    ...tsjPreset.transform,
  },
  preset: "ts-jest",
  coverageDirectory: "./coverage/",
  collectCoverage: true,
  reporters: [ "default", "jest-junit" ],
  globals: {
    "ts-jest": {
      diagnostics: {
        warnOnly: true,
      },
    },
  },
};

export default config;
