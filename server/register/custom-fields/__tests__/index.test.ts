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
      {
        "name": "comments",
        "plugin": "comments",
        "type": "json",
      }
    `);
  });
  it("should not require custom fields functionality to bootstrap comments plugin", () => {
    expect(() =>
      registerCustomFields({ strapi: { log: { warn: jest.fn() } } } as any)
    ).not.toThrow();
  });
  it("should notify about custom field option", () => {
    const warn = jest.fn();

    expect(() =>
      registerCustomFields({ strapi: { log: { warn } } } as any)
    ).not.toThrow();
    expect(warn).toHaveBeenCalled();
  });
});
