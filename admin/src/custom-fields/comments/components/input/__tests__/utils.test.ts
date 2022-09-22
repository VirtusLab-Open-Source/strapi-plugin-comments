import { Dispatch, SetStateAction } from "react";
import { CommentsFieldValue } from "../types";
import {
  assertCorrectState,
  asString,
  fromInput,
  getApprovalStatusOptions,
  getFilterByOptions,
  getRenderTypeOptions,
  getSortByDateOptions,
  handlePopulateChange,
  handleStateSliceChange,
  toOutput,
} from "../utils";

jest.mock("axios", () => ({
  create: () => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  }),
}));

jest.mock("@strapi/helper-plugin", () => ({
  auth: { getToken: jest.fn() },
}));

const state: CommentsFieldValue = {
  commentsNumber: 99,
};
const createSetter: (
  initialState: typeof state
) => Dispatch<SetStateAction<CommentsFieldValue>> =
  (initialState) => (action) => {
    if (action instanceof Function) {
      return action(initialState);
    }

    return action;
  };

describe("Custom fields", () => {
  describe("Comments", () => {
    describe("asString()", () => {
      it("should return standard result", () => {
        expect(asString()).toMatchInlineSnapshot(`""`);
      });
    });
    describe("fromInput()", () => {
      it("should validate input", () => {
        expect(() => fromInput("")).toThrow();
        expect(() => fromInput(undefined)).toThrow();
        expect(() => fromInput(null)).toThrow();
      });
      it("should prepare input for consumption", () => {
        const state = fromInput(
          `{ "commentsNumber": 35, "filterBy": "DATE_CREATED", "filterByValue": "${new Date(
            2022,
            7,
            7
          )}" }`
        );

        expect(state.filterByValue).toBeInstanceOf(Date);
      });
    });
    describe("toOutput()", () => {
      it("should serialize state", () => {
        const state: CommentsFieldValue = {
          commentsNumber: 1,
          populate: [],
          sortByDate: "ASC",
        };

        expect(toOutput(state)).toMatchInlineSnapshot(
          `"{\\"commentsNumber\\":1,\\"populate\\":[],\\"sortByDate\\":\\"ASC\\"}"`
        );
      });
    });
    describe("assertCorrectState()", () => {
      it("should validate commentsNumber", () => {
        expect(() => assertCorrectState({})).toThrow();
        expect(() => assertCorrectState({ commentsNumber: 1 })).not.toThrow();
      });
      it("should validate renderType", () => {
        expect(() => assertCorrectState({})).toThrow();
        expect(() => assertCorrectState({ commentsNumber: 1 })).not.toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, renderType: 1 })
        ).toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, renderType: [] })
        ).toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, renderType: {} })
        ).toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, renderType: "TREE" })
        ).not.toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, renderType: "LIST" })
        ).not.toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, renderType: "TEST" })
        ).not.toThrow();
      });
      it("should validate sortByDate", () => {
        expect(() => assertCorrectState({})).toThrow();
        expect(() => assertCorrectState({ commentsNumber: 1 })).not.toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, sortByDate: 1 })
        ).toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, sortByDate: [] })
        ).toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, sortByDate: {} })
        ).toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, renderType: "ASC" })
        ).not.toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, renderType: "DESC" })
        ).not.toThrow();
      });
      it("should validate filterBy", () => {
        expect(() => assertCorrectState({})).toThrow();
        expect(() => assertCorrectState({ commentsNumber: 1 })).not.toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, filterBy: 1 })
        ).toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, filterBy: [] })
        ).toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, filterBy: {} })
        ).toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, filterBy: "DATE_CREATED" })
        ).not.toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, filterBy: "APPROVAL_STATUS" })
        ).not.toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, filterBy: "TEST" })
        ).not.toThrow();
      });
      it("should validate filterByValue", () => {
        expect(() => assertCorrectState({})).toThrow();
        expect(() => assertCorrectState({ commentsNumber: 1 })).not.toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, filterByValue: 1 })
        ).toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, filterByValue: [] })
        ).toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, filterByValue: {} })
        ).toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, filterByValue: "any" })
        ).not.toThrow();
      });
      it("should validate populate", () => {
        expect(() => assertCorrectState({})).toThrow();
        expect(() => assertCorrectState({ commentsNumber: 1 })).not.toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, populate: 1 })
        ).toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, populate: {} })
        ).toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, populate: "any" })
        ).toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, populate: [] })
        ).not.toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, populate: ["avatar"] })
        ).not.toThrow();
        expect(() =>
          assertCorrectState({ commentsNumber: 1, populate: ["author"] })
        ).not.toThrow();
        expect(() =>
          assertCorrectState({
            commentsNumber: 1,
            populate: ["author", "avatar"],
          })
        ).not.toThrow();
      });
    });
    describe("handleStateSliceChange()", () => {
      const setter = createSetter(state);

      it("should handle state slice", () => {
        expect(handleStateSliceChange("commentsNumber", setter)(1))
          .toMatchInlineSnapshot(`
          Object {
            "commentsNumber": 1,
          }
        `);
        expect(handleStateSliceChange("filterBy", setter)("FOO"))
          .toMatchInlineSnapshot(`
          Object {
            "commentsNumber": 99,
            "filterBy": "FOO",
          }
        `);
        expect(handleStateSliceChange("filterByValue", setter)("VALUE"))
          .toMatchInlineSnapshot(`
          Object {
            "commentsNumber": 99,
            "filterByValue": "VALUE",
          }
        `);
        expect(handleStateSliceChange("renderType", setter)("TREE"))
          .toMatchInlineSnapshot(`
          Object {
            "commentsNumber": 99,
            "renderType": "TREE",
          }
        `);
        expect(handleStateSliceChange("sortByDate", setter)("ASC"))
          .toMatchInlineSnapshot(`
          Object {
            "commentsNumber": 99,
            "sortByDate": "ASC",
          }
        `);
      });
    });
    describe("handlePopulateChange", () => {
      it("should handle populate change", () => {
        expect(handlePopulateChange("author", createSetter(state))())
          .toMatchInlineSnapshot(`
          Object {
            "commentsNumber": 99,
            "populate": Array [
              "author",
            ],
          }
        `);
        expect(handlePopulateChange("avatar", createSetter(state))())
          .toMatchInlineSnapshot(`
          Object {
            "commentsNumber": 99,
            "populate": Array [
              "avatar",
            ],
          }
        `);
        expect(
          handlePopulateChange(
            "author",
            createSetter({
              ...state,
              populate: [],
            })
          )()
        ).toMatchInlineSnapshot(`
          Object {
            "commentsNumber": 99,
            "populate": Array [
              "author",
            ],
          }
        `);
        expect(
          handlePopulateChange(
            "author",
            createSetter({
              ...state,
              populate: ["author"],
            })
          )()
        ).toMatchInlineSnapshot(`
          Object {
            "commentsNumber": 99,
            "populate": Array [],
          }
        `);
        expect(
          handlePopulateChange(
            "author",
            createSetter({
              ...state,
              populate: ["avatar"],
            })
          )()
        ).toMatchInlineSnapshot(`
          Object {
            "commentsNumber": 99,
            "populate": Array [
              "avatar",
              "author",
            ],
          }
        `);
        expect(
          handlePopulateChange(
            "avatar",
            createSetter({
              ...state,
              populate: [],
            })
          )()
        ).toMatchInlineSnapshot(`
          Object {
            "commentsNumber": 99,
            "populate": Array [
              "avatar",
            ],
          }
        `);
        expect(
          handlePopulateChange(
            "avatar",
            createSetter({
              ...state,
              populate: ["author"],
            })
          )()
        ).toMatchInlineSnapshot(`
          Object {
            "commentsNumber": 99,
            "populate": Array [
              "author",
              "avatar",
            ],
          }
        `);
        expect(
          handlePopulateChange(
            "avatar",
            createSetter({
              ...state,
              populate: ["avatar"],
            })
          )()
        ).toMatchInlineSnapshot(`
          Object {
            "commentsNumber": 99,
            "populate": Array [],
          }
        `);
      });
    });
    describe("getRenderTypeOptions()", () => {
      it("should render options", () => {
        expect(getRenderTypeOptions(({ id }) => `translated.${id}`))
          .toMatchInlineSnapshot(`
          Array [
            Object {
              "label": "translated.customField.comments.input.renderType.option.tree.label",
              "value": "TREE",
            },
            Object {
              "label": "translated.customField.comments.input.renderType.option.flat.label",
              "value": "FLAT",
            },
          ]
        `);
      });
    });
    describe("getSortByDateOptions()", () => {
      it("should render options", () => {
        expect(getSortByDateOptions(({ id }) => `translated.${id}`))
          .toMatchInlineSnapshot(`
          Array [
            Object {
              "label": "",
              "value": undefined,
            },
            Object {
              "label": "translated.customField.comments.input.sortByDate.option.asc.label",
              "value": "ASC",
            },
            Object {
              "label": "translated.customField.comments.input.sortByDate.option.desc.label",
              "value": "DESC",
            },
          ]
        `);
      });
    });
    describe("getFilterByOptions()", () => {
      it("should render options", () => {
        expect(getFilterByOptions(({ id }) => `translated.${id}`))
          .toMatchInlineSnapshot(`
          Array [
            Object {
              "label": "",
              "value": undefined,
            },
            Object {
              "label": "translated.customField.comments.input.filterBy.option.dateCreated.label",
              "value": "DATE_CREATED",
            },
            Object {
              "label": "translated.customField.comments.input.filterBy.option.approvalStatus.label",
              "value": "APPROVAL_STATUS",
            },
          ]
        `);
      });
    });
    describe("getApprovalStatusOptions()", () => {
      it("should render options", () => {
        expect(getApprovalStatusOptions(({ id }) => `translated.${id}`))
          .toMatchInlineSnapshot(`
          Array [
            Object {
              "label": "",
              "value": undefined,
            },
            Object {
              "label": "translated.customField.comments.input.filterBy.option.approvalStatus.option.approved.label",
              "value": "APPROVED",
            },
            Object {
              "label": "translated.customField.comments.input.filterBy.option.approvalStatus.option.pending.label",
              "value": "PENDING",
            },
            Object {
              "label": "translated.customField.comments.input.filterBy.option.approvalStatus.option.rejected.label",
              "value": "REJECTED",
            },
          ]
        `);
      });
    });
  });
});
