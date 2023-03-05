import { setupStrapi, resetStrapi } from "../../../__mocks__/initSetup";
import {
  assertNotEmpty,
  assertParamsPresent,
  getPluginService,
  parseParams,
} from "../functions";

beforeEach(setupStrapi);
afterEach(resetStrapi);

describe("Test plugin functions utils", () => {
  describe("Get plugin service", () => {
    test("Should get common service", () => {
      expect(getPluginService("common")).toHaveProperty("findAllFlat");
    });
  });
  describe("parseParams()", () => {
    it("should parse params", () => {
      expect(
        parseParams({
          id: "1",
          name: "NAME",
        })
      ).toMatchInlineSnapshot(`
        {
          "id": 1,
          "name": "NAME",
        }
      `);
    });
  });
  describe("assertParamsPresent()", () => {
    it("should assert params", () => {
      expect(() => assertParamsPresent(1, ["id"])).toThrow();
      expect(() => assertParamsPresent(null, ["id"])).toThrow();
      expect(() => assertParamsPresent(undefined, ["id"])).toThrow();
      expect(() => assertParamsPresent("", ["id"])).toThrow();
      expect(() => assertParamsPresent("a text", ["id"])).toThrow();
      expect(() => assertParamsPresent({}, ["id"])).toThrow();
      expect(() => assertParamsPresent({ id: "1" }, ["id"])).not.toThrow();
    });
  });
  describe("assertNotEmpty()", () => {
    it("should assert non empty value", () => {
      expect(() => assertNotEmpty(null)).toThrow();
      expect(() => assertNotEmpty(undefined)).toThrow();
      expect(() => assertNotEmpty(0)).toThrow();
      expect(() => assertNotEmpty(1)).not.toThrow();
      expect(() => assertNotEmpty({ id: 1 })).not.toThrow();
    });
  });
});
