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
    expect(getMessage("message.key")).toEqual({
      defaultMessage: "",
      id: "comments.message.key",
    });
    expect(getMessage("message.key", "message.default")).toEqual({
      defaultMessage: "message.default",
      id: "comments.message.key",
    });
  });
  it("should handle config object", () => {
    expect(
      getMessage(
        {
          id: "message.key",
        },
        "message.default"
      )
    ).toEqual({
      defaultMessage: "message.default",
      id: "comments.message.key",
    });
  });
  it("should handle config object with empty id (fallback to formattedId)", () => {
    expect(getMessage({ id: "" })).toEqual({
      defaultMessage: "",
      id: "comments.",
    });
  });
  it("should handle config object with props", () => {
    expect(
      getMessage(
        {
          id: "message.key",
          props: { count: 5 },
        },
        "default"
      )
    ).toEqual({
      defaultMessage: "default",
      id: "comments.message.key",
      count: 5,
    });
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
    ).toEqual({
      defaultMessage: "message.key.default",
      id: "app.components.message.key",
    });
  });
});
