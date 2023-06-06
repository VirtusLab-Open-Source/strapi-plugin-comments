const { setupStrapi, resetStrapi } = require("../../../../__mocks__/initSetup");
const PluginError = require("../../../utils/error");
const {
  parseSortQuery,
  parseFieldsQuery,
  parsePaginationsQuery,
} = require("../parsers");

beforeEach(setupStrapi);
afterEach(resetStrapi);

describe("Test service parse utils", () => {
  describe("Sort", () => {
    const query = {
      where: {
        related: 1,
      },
    };

    test("Should parse single sort", () => {
      const result = parseSortQuery("id:asc", query);
      expect(result).toHaveProperty(["orderBy", "id"], "asc");
      expect(result).toHaveProperty(["where", "related"], query.where.related);
    });

    test("Should parse multiple sort", () => {
      const result = parseSortQuery(["id:asc", "threadOf:desc"], query);
      expect(Object.keys(result.orderBy).length).toBe(2);
      expect(result).toHaveProperty(["orderBy", "id"], "asc");
      expect(result).toHaveProperty(["orderBy", "threadOf"], "desc");
      expect(result).toHaveProperty(["where", "related"], query.where.related);
    });
  });

  describe("Fields", () => {
    const query = {
      where: {
        related: 1,
      },
    };

    test("Should parse default fields", () => {
      const result = parseFieldsQuery([], query, ["id", "related"]);
      expect(result).toHaveProperty("select");
      expect(result.select.length).toBe(2);
      expect(result.select.includes("id")).toBe(true);
      expect(result.select.includes("related")).toBe(true);
      expect(result).toHaveProperty(["where", "related"], query.where.related);
    });

    test("Should parse selected fields with defaults", () => {
      const result = parseFieldsQuery(["content"], query, ["id", "related"]);
      expect(result).toHaveProperty("select");
      expect(result.select.length).toBe(3);
      expect(result.select.includes("id")).toBe(true);
      expect(result.select.includes("related")).toBe(true);
      expect(result.select.includes("content")).toBe(true);
      expect(result).toHaveProperty(["where", "related"], query.where.related);
    });

    test("Should parse selected fields with defaults and without duplicates", () => {
      const result = parseFieldsQuery(["id", "content"], query, ["id", "related"]);
      expect(result).toHaveProperty("select");
      expect(result.select.length).toBe(3);
      expect(result.select.includes("id")).toBe(true);
      expect(result.select.includes("related")).toBe(true);
      expect(result.select.includes("content")).toBe(true);
      expect(result).toHaveProperty(["where", "related"], query.where.related);
    });
  });

  describe("Pagination", () => {
    const query = {
      where: {
        related: 1,
      },
    };

    test("Should parse with defaults", () => {
      const result = parsePaginationsQuery({
        page: "2",
      }, query, { PAGE_SIZE: 10 });

      expect(result.length).toBe(2);

      const [meta, extendedQuery] = result;
      
      expect(meta).toHaveProperty("pagination");
      expect(meta).toHaveProperty("pagination", "page", 2);
      expect(meta).toHaveProperty("pagination", "pageSize", 10);
      expect(extendedQuery).toHaveProperty(["limit"], 10);
      expect(extendedQuery).toHaveProperty(["offset"], 10);
      expect(extendedQuery).toHaveProperty(["where", "related"], query.where.related);
    });

    test("Should parse with defaults overwritten", () => {
      const result = parsePaginationsQuery({
        page: "4",
        pageSize: "5",
      }, query, { PAGE_SIZE: 10 });

      expect(result.length).toBe(2);

      const [meta, extendedQuery] = result;
      expect(meta).toHaveProperty("pagination");
      expect(meta).toHaveProperty("pagination", "page", 3);
      expect(meta).toHaveProperty("pagination", "pageSize", 5);
      expect(extendedQuery).toHaveProperty(["limit"], 5);
      expect(extendedQuery).toHaveProperty(["offset"], 15);
      expect(extendedQuery).toHaveProperty(["where", "related"], query.where.related);
    });
  });
});
