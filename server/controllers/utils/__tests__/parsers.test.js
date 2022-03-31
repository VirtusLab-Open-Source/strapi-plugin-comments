const { flatInput } = require("../parsers");

jest.mock;

describe("Test Comments controller parsers utils", () => {
  describe("Flat Input properties", () => {
    const relation = "api::test.relation";
    const filters = {
      content: {
        $eq: "Test",
      },
    };
    const sort = {
      createdAt: "desc",
    };
    const pagination = {
      page: 3,
      pageSize: 5,
    };

    test("Should contain default property 'populate'", () => {
      expect(flatInput()).toHaveProperty(
        ["populate", "threadOf", "populate", "authorUser"],
        true
      );
    });

    test("Should assign relation to 'query'", () => {
      expect(flatInput(relation)).toHaveProperty(
        ["query", "related"],
        relation
      );
    });

    test("Should assign filters to 'query'", () => {
      const result = flatInput(relation, filters);
      expect(result).toHaveProperty(
        ["query", "content", "$eq"],
        filters.content["$eq"]
      );
    });

    test("Should assign not allow to overwrite 'removed' in $or operator", () => {
      const overwrittenOrOperator = {
        $or: [{ removed: true }, { removed: false }, { removed: null }],
      };
      const result = flatInput(relation, overwrittenOrOperator);
      expect(result).toHaveProperty(
        ["query", "$or", 0, "removed", "$null"],
        true
      );
      expect(result).toHaveProperty(["query", "$or", 1, "removed"], false);
    });

    test("Should assign sort", () => {
      const result = flatInput(relation, filters, sort);
      expect(result).toHaveProperty(["sort", "createdAt"], sort.createdAt);
    });

    test("Should assign pagination", () => {
      const result = flatInput(relation, filters, sort, pagination);
      expect(result).toHaveProperty(["pagination", "page"], pagination.page);
      expect(result).toHaveProperty(
        ["pagination", "pageSize"],
        pagination.pageSize
      );
    });

    test("Should build complex output", () => {
      const day = 24 * 60 * 60 * 1000;
      const now = Date.now().toString();
      const oneDayBefore = new Date(Date.now().valueOf() - day).toString();
      const complexFilters = {
        $or: [
          {
            createdAt: {
              $lte: oneDayBefore,
            },
          },
          {
            createdAt: {
              $eq: now,
            },
          },
        ],
        content: {
          $contains: "Test",
        },
      };

      const complexSort = [
        {
          createdAt: "desc",
        },
        {
          title: "asc",
        },
      ];

      const result = flatInput(
        relation,
        complexFilters,
        complexSort,
        pagination
      );

      expect(result).toHaveProperty(["query", "related"], relation);
      expect(result).toHaveProperty(
        ["query", "$or", 0, "createdAt", "$lte"],
        oneDayBefore
      );
      expect(result).toHaveProperty(
        ["query", "$or", 1, "createdAt", "$eq"],
        now
      );
      expect(result).toHaveProperty(
        ["query", "$or", 2, "removed", "$null"],
        true
      );
      expect(result).toHaveProperty(["query", "$or", 3, "removed"], false);
      expect(result).toHaveProperty(
        ["query", "content", "$contains"],
        complexFilters.content["$contains"]
      );
      expect(result).toHaveProperty(
        ["sort", 0, "createdAt"],
        complexSort[0].createdAt
      );
      expect(result).toHaveProperty(["sort", 1, "title"], complexSort[1].title);
      expect(result).toHaveProperty(["pagination", "page"], pagination.page);
      expect(result).toHaveProperty(
        ["pagination", "pageSize"],
        pagination.pageSize
      );
    });
  });
});
