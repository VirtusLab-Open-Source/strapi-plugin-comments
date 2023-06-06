import { StrapiGraphQLContext } from "../../../types";

import Id from "./id";
import Comment from "./comment";
import CommentNested from "./comment-nested";
import CommentAuthor from "./comment-author";
import CommentAuthorType from "./comment-author-type";
import CreateComment from "./create-comment";
import CreateCommentAuthor from "./create-comment-author";
import UpdateComment from "./update-comment";
import RemoveComment from "./remove-comment";
import IdentifyCommentAuthor from "./identify-comment-author";
import Report from "./report";
import ReportReason from "./report-reason";
import CreateReport from "./create-report";
import ResponsePagination from "./response-pagination";
import ResponseMeta from "./response-meta";
import ResponseFindAll from "./response-find-all";
import ResponseFindAllPerAuthor from "./response-find-all-per-author";

const typesFactories = [
  Id,
  Comment,
  CommentNested,
  CommentAuthor,
  CommentAuthorType,
  CreateComment,
  CreateCommentAuthor,
  UpdateComment,
  RemoveComment,
  IdentifyCommentAuthor,
  Report,
  ReportReason,
  CreateReport,
  ResponsePagination,
  ResponseMeta,
  ResponseFindAll,
  ResponseFindAllPerAuthor,
];

export = (context: StrapiGraphQLContext) =>
  typesFactories.map((factory) => factory(context));
