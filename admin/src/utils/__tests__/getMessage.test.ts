import getMessage from "../getMessage";

jest.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: (x: any, y: any) => ({
      ...x,
      ...y,
    }),
  }),
}));

describe("getMessage()", () => {
  it("should handle simple string", () => {
    expect(getMessage("message.key")).toMatchInlineSnapshot(`
      {
        "defaultMessage": "",
        "id": "comments.message.key",
      }
    `);
    expect(getMessage("message.key", "message.default")).toMatchInlineSnapshot(`
      {
        "defaultMessage": "message.default",
        "id": "comments.message.key",
      }
    `);
  });
  it("should handle config object", () => {
    expect(
      getMessage(
        {
          id: "message.key",
        },
        "message.default"
      )
    ).toMatchInlineSnapshot(`
      {
        "defaultMessage": "message.default",
        "id": "comments.message.key",
      }
    `);
  });
  it("should allow out of scope translates", () => {
    expect(
      getMessage(
        {
          id: "message.key",
        },
        "message.key.default",
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "defaultMessage": "message.key.default",
        "id": "app.components.message.key",
      }
    `);
  });
});
