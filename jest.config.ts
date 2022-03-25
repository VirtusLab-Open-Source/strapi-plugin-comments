import type { Config } from "@jest/types";
import { defaults as tsjPreset } from "ts-jest/presets";

const config: Config.InitialOptions = {
  name: "Unit test",
  testMatch: ["**/__tests__/?(*.)+(spec|test).ts"],
  transform: {
    ...tsjPreset.transform,
  },
  preset: "ts-jest",
  coverageDirectory: "./coverage/",
  collectCoverage: true,
  globals: {
    "ts-jest": {
      diagnostics: {
        warnOnly: true,
      },
    },
  },
};

export default config;
