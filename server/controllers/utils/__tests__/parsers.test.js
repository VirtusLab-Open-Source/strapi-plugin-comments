const { flatInput } = require("../parsers");

jest.mock;

describe("Test Comments controller parsers utils", () => {
  describe("Flat Input properties", () => {
    const relation = "api::test.relation";
    const query = {
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
    const fields = ["content"];

    test("Should contain default property 'populate'", () => {
      expect(flatInput({ query: {} })).toHaveProperty(
        ["populate", "threadOf", "populate", "authorUser"],
        true
      );
    });

    test("Should assign relation to 'query'", () => {
      expect(flatInput({ relation, query: {} })).toHaveProperty(
        ["query", "related"],
        relation
      );
    });

    test("Should assign filters to 'query'", () => {
      const result = flatInput({
        relation,
        query,
      });
      expect(result).toHaveProperty(
        ["query", "content", "$eq"],
        query.content["$eq"]
      );
    });

    test("Should assign not allow to overwrite 'removed' in $or operator", () => {
      const overwrittenOrOperator = {
        $or: [{ removed: true }, { removed: false }, { removed: null }],
      };
      const result = flatInput({
        relation,
        query: overwrittenOrOperator,
      });
      expect(result).toHaveProperty(
        ["query", "$or", 0, "removed", "$null"],
        true
      );
      expect(result).toHaveProperty(["query", "$or", 1, "removed"], false);
    });

    test("Should assign sort", () => {
      const result = flatInput({
        relation,
        query,
        sort,
      });
      expect(result).toHaveProperty(["sort", "createdAt"], sort.createdAt);
    });

    test("Should assign pagination", () => {
      const result = flatInput({
        relation,
        query,
        sort,
        pagination,
      });
      expect(result).toHaveProperty(["pagination", "page"], pagination.page);
      expect(result).toHaveProperty(
        ["pagination", "pageSize"],
        pagination.pageSize
      );
    });

    test("Should assign fields", () => {
      const result = flatInput({
        relation,
        query,
        sort,
        fields,
      });
      expect(result).toHaveProperty(["fields", 0], fields[0]);
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

      const result = flatInput({
        relation,
        query: complexFilters,
        sort: complexSort,
        pagination,
      });

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

    test("Should assign filtering by comments status", () => {
      const filterByValue = "APPROVED";
      const result = flatInput({
        relation,
        query: {
          ...query,
          filterBy: "APPROVAL_STATUS",
          filterByValue,
        },
        sort,
        fields,
      });

      expect(result).toHaveProperty(["query", "approvalStatus"], filterByValue);
      expect(() => {
        flatInput({
          relation,
          query: {
            filterBy: "APPROVAL_STATUS",
          },
          sort,
          fields,
        });
      }).toThrow();
    });

    test("Should assign filtering by creation date", () => {
      const filterByValue = new Date().toUTCString();
      const result = flatInput({
        relation,
        query: {
          ...query,
          filterBy: "DATE_CREATED",
          filterByValue,
        },
        sort,
        fields,
      });

      expect(result).toHaveProperty(["query", "createdAt", "$between", 0]);
      expect(result).toHaveProperty(["query", "createdAt", "$between", 1]);
      expect(() => {
        flatInput({
          relation,
          query: {
            filterBy: "DATE_CREATED",
          },
          sort,
          fields,
        });
      }).toThrow();
      expect(() => {
        flatInput({
          relation,
          query: {
            filterByValue: "X",
            filterBy: "DATE_CREATED",
          },
          sort,
          fields,
        });
      }).toThrow();
    });
  });
});
