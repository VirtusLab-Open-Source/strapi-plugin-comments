const { setupStrapi, resetStrapi } = require("../../../../__mocks__/initSetup");
const PluginError = require("../../../utils/error");
const {
  resolveUserContextError,
  getModelUid,
  buildConfigQueryProp,
} = require("../functions");

beforeEach(setupStrapi);
afterEach(resetStrapi);

describe("Test service functions utils", () => {
  describe("Getting models uid's ", () => {
    test("Should get comments uid", () => {
      expect(getModelUid("comment")).toBe("plugins::comments.comment");
    });

    test("Should get report uid", () => {
      expect(getModelUid("comment-report")).toBe(
        "plugins::comments.comment-report"
      );
    });
  });

  describe("Resolve user context error", () => {
    test("Should throw 401", () => {
      try {
        resolveUserContextError({ id: 1 });
      } catch (e) {
        expect(e).toBeInstanceOf(PluginError.default);
        expect(e).toHaveProperty("status", 401);
      }
    });

    test("Should throw 403", () => {
      try {
        resolveUserContextError();
      } catch (e) {
        expect(e).toBeInstanceOf(PluginError.default);
        expect(e).toHaveProperty("status", 403);
      }
    });
  });

  describe("Building config query props", () => {
    test("Should return prop as is", () => {
      expect(buildConfigQueryProp("my.sample.prop")).toBe("my.sample.prop");
    });

    test("Should build query prop with '.'", () => {
      expect(buildConfigQueryProp(["my", "sample", "prop"])).toBe(
        "my.sample.prop"
      );
    });
  });
});
