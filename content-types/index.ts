import { StrapiContext } from "strapi-typed";
import { buildAllHookListeners } from "../server/utils/functions";
import CommentCT from "./comment";
import ReportCT from "./report";

export default {
  comment: {
    schema: CommentCT,
    lifecycles: buildAllHookListeners("comment", {
      strapi,
    } as unknown as StrapiContext),
  },
  "comment-report": {
    schema: ReportCT,
    lifecycles: buildAllHookListeners("comment-report", {
      strapi,
    } as unknown as StrapiContext),
  },
};
