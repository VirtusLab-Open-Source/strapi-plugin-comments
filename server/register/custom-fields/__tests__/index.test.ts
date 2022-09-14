import { IStrapi } from "strapi-typed";
import { registerCustomFields } from "..";

describe("registerCustomFields()", () => {
  it("should apply custom field when strapi supports it", () => {
    const strapi: Pick<IStrapi, "customFields"> = {
      customFields: {
        register: jest.fn(),
      },
    };

    registerCustomFields({ strapi } as any);

    expect(strapi.customFields.register).toHaveBeenCalled();
    expect((strapi.customFields.register as jest.Mock).mock.calls[0][0])
      .toMatchInlineSnapshot(`
      Object {
        "name": "comments",
        "plugin": "comments",
        "type": "json",
      }
    `);
  });
  it("should not apply custom field when strapi does not supports it", () => {
    expect(() => registerCustomFields({ strapi: {} } as any)).not.toThrow();
  });
});
