import handleAPIError from "../handleAPIError";

describe("handleAPIError()", () => {
  it("should re-throw error", () => {
    const err = new Error("Error");

    expect(() => handleAPIError(null, jest.fn)).toThrowError(Error);
    expect(() => handleAPIError(undefined, jest.fn)).toThrowError();
    expect(() => handleAPIError(err, undefined)).toThrowError(Error);
    expect(() => handleAPIError(err, jest.fn)).toThrowError(err);
  });

  it("should notify app", () => {
    const err = new Error("Error");
    const notify = jest.fn();

    expect(() => handleAPIError(err, notify, "message")).toThrowError(err);
    expect(notify).toHaveBeenCalled();
    expect(notify.mock.calls[0]).toMatchInlineSnapshot(`
      [
        {
          "message": "comments.message",
          "type": "warning",
        },
      ]
    `);
  });
});
