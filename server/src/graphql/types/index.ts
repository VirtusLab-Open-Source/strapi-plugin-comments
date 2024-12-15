import { Nexus } from '../../@types/graphql';
import { CommentsPluginConfig } from '../../config';
import { getComment } from './getComment';
import { getCommentAuthor } from './getCommentAuthor';
import { getCommentAuthorType } from './getCommentAuthorType';
import { getCommentNested } from './getCommentNested';
import { getCreateComment } from './getCreateComment';
import { getCreateCommentAuthor } from './getCreateCommentAuthor';
import { getCreateReport } from './getCreateReport';
import { getIdType } from './getId';
import { getIdentityAuthor } from './getIdentityAuthor';
import { getRemoveComment } from './getRemoveComment';
import { getReport } from './getReport';
import { getReportReason } from './getReportReason';
import { getResponseFindAll } from './getResponseFindAll';
import { getResponseFindAllPerAuthor } from './getResponseFindAllPerAuthor';
import { getResponseMeta } from './getResponseMeta';
import { getResponsePagination } from './getResponsePagination';
import { getUpdateComment } from './getUpdateComment';

const typesFactories = [
  getComment,
  getCommentAuthor,
  getCommentAuthorType,
  getCommentNested,
  getCreateComment,
  getCreateCommentAuthor,
  getCreateReport,
  getIdType,
  getIdentityAuthor,
  getRemoveComment,
  getReportReason,
  getResponseFindAll,
  getResponseFindAllPerAuthor,
  getResponseMeta,
  getResponsePagination,
  getUpdateComment,
  getReport,
] as const;

export const getTypes = (config: CommentsPluginConfig, nexus: Nexus) => typesFactories.map((factory) => factory(nexus, config));
