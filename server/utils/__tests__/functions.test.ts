import { StrapiContext } from "strapi-typed";
import { setupStrapi, resetStrapi } from "../../../__mocks__/initSetup";
import {
  assertNotEmpty,
  assertParamsPresent,
  buildAllHookListeners,
  buildHookListener,
  getPluginService,
  parseParams,
} from "../functions";
import { ContentType, LifeCycleEvent, LifeCycleHookName } from "../types";
import { IServiceCommon, ToBeFixed } from "../../../types";

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
  describe("buildAllHookListeners()", () => {
    it("should define a listener for each available model lifecycle hook", () => {
      // Then
      expect(buildAllHookListeners("comment", {} as StrapiContext))
        .toMatchInlineSnapshot(`
        {
          "afterCount": [Function],
          "afterCreate": [Function],
          "afterCreateMany": [Function],
          "afterDelete": [Function],
          "afterDeleteMany": [Function],
          "afterFindMany": [Function],
          "afterFindOne": [Function],
          "afterUpdate": [Function],
          "afterUpdateMany": [Function],
          "beforeCount": [Function],
          "beforeCreate": [Function],
          "beforeCreateMany": [Function],
          "beforeDelete": [Function],
          "beforeDeleteMany": [Function],
          "beforeFindMany": [Function],
          "beforeFindOne": [Function],
          "beforeUpdate": [Function],
          "beforeUpdateMany": [Function],
        }
      `);
    });
  });

  describe("buildHookListener()", () => {
    it("should delegate lifecycle hook event to defined listeners", async () => {
      // Given
      const contentTypeName: ContentType = "comment";
      const service: Partial<IServiceCommon> = {
        runLifecycleHook: jest.fn(),
      };
      const plugin: ToBeFixed = {
        service() {
          return service;
        },
      };
      const context: StrapiContext = {
        strapi: {
          plugin() {
            return plugin;
          },
        } as unknown as StrapiContext["strapi"],
      };
      const hookName: LifeCycleHookName = "afterCreate";
      const event: Partial<LifeCycleEvent> = {
        action: hookName,
        model: {
          attributes: {
            name: "name",
          },
        } as unknown as LifeCycleEvent["model"],
      };
      const [, listener] = buildHookListener(
        contentTypeName,
        context
      )(hookName);

      // When
      await listener(event as LifeCycleEvent);

      // Then
      expect(service.runLifecycleHook).toHaveBeenCalledWith({
        contentTypeName,
        hookName,
        event,
      });
    });
  });
});
