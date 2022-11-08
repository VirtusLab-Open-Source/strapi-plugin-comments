const PluginError = require("../../../utils/error");
const ctx = require("koa/lib/context");
const { throwError } = require("../functions");

jest.mock;

describe("Test Comments controller functions utils", () => {
  describe("Errors serialization", () => {
    test("Should throw error PluginError", () => {
      try {
        throw new PluginError.default(400, "Error message", {
          content: {
            param: "Parameter value",
          },
        });
      } catch (e) {
        expect(e).toBeInstanceOf(PluginError.default);
        expect(e).toHaveProperty("status", 400);
        expect(e).toHaveProperty("name", "Strapi:Plugin:Comments");
        expect(e).toHaveProperty("message", "Error message");
        expect(e).toHaveProperty("payload");
        expect(e.payload).toEqual(
          expect.objectContaining({
            content: {
              param: "Parameter value",
            },
          })
        );

        try {
          throwError(ctx, e);
        } catch (eFinal) {
          const stringifiedError = eFinal.toString();
          expect(stringifiedError.includes("BadRequestError")).toEqual(true);
          expect(stringifiedError.includes("Strapi:Plugin:Comments")).toEqual(
            true
          );
          expect(stringifiedError.includes("Error message")).toEqual(true);
          expect(stringifiedError.includes("Strapi:Plugin:Comments")).toEqual(
            true
          );
          expect(stringifiedError.includes("content")).toEqual(true);
          expect(stringifiedError.includes("Parameter value")).toEqual(true);
        }
      }
    });
  });
});
