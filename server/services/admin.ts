import {
  StrapiContext,
  Id,
  StrapiDBQueryArgs,
  PropType,
  StrapiDBBulkActionResponse,
  StrapiAdminUser,
} from 'strapi-typed';
import {
  AdminFindAllProps,
  AdminFindAllQueryParamsParsed,
  AdminFindOneAndThreadProps,
  AdminPaginatedResponse,
  AdminSinglePageResponse,
  AnyConfig,
  Comment,
  CommentAuthor,
  CommentModelKeys,
  CommentReport,
  IServiceAdmin,
  IServiceCommon,
  PluginConfigKeys,
  RelatedEntity,
  SettingsCommentsPluginConfig,
  ToBeFixed,
} from "../../types";

import { getPluginService, parseParams } from "./../utils/functions";
import { isEmpty, isNil, isNumber, parseInt } from "lodash";
import PluginError from "./../utils/error";
import { assertComment } from "./../../types/utils";
import {
  getModelUid,
  getRelatedGroups,
  filterOurResolvedReports,
  getAuthorName,
} from "./utils/functions";
import { APPROVAL_STATUS, REGEX } from "./../utils/constants";

/**
 * Comments Plugin - Moderation services
 */

export = ({ strapi }: StrapiContext): IServiceAdmin => ({
  getCommonService(): IServiceCommon {
    return getPluginService("common");
  },

  // Config
  async config<T extends AnyConfig>(
    this: IServiceAdmin,
    viaSettingsPage = false,
  ): Promise<T> {
    const pluginStore = await this.getCommonService().getPluginStore();
    const config: SettingsCommentsPluginConfig = await pluginStore.get({
      key: "config",
    });
    const additionalConfiguration = {
      regex: Object.keys(REGEX).reduce(
        (prev, curr) => ({
          ...prev,
          [curr]: REGEX[curr].toString(),
        }),
        {},
      ),
    };

    const getConfigProp = <M extends PluginConfigKeys>(key: string) =>
      this.getCommonService().getLocalConfig<
        PropType<SettingsCommentsPluginConfig, M>
      >(key);

    const isGQLPluginEnabled: PropType<
      SettingsCommentsPluginConfig,
      "isGQLPluginEnabled"
    > = !isNil(strapi.plugin("graphql"));

    if (config) {
      return {
        ...config,
        ...additionalConfiguration,
        isGQLPluginEnabled: viaSettingsPage ? isGQLPluginEnabled : undefined,
      } as T;
    }

    const entryLabel = getConfigProp<"entryLabel">("entryLabel");
    const approvalFlow = getConfigProp<"approvalFlow">("approvalFlow");
    const reportReasons = getConfigProp<"reportReasons">("reportReasons");
    const result = {
      entryLabel,
      approvalFlow,
      reportReasons,
      ...additionalConfiguration,
    };

    if (viaSettingsPage) {
      const enabledCollections =
        getConfigProp<"enabledCollections">("enabledCollections");
      const moderatorRoles = getConfigProp<"moderatorRoles">("moderatorRoles");
      return {
        ...result,
        enabledCollections,
        moderatorRoles,
        isGQLPluginEnabled,
      } as T;
    }

    return result as T;
  },

  async updateConfig(
    this: IServiceAdmin,
    body: SettingsCommentsPluginConfig,
  ): Promise<SettingsCommentsPluginConfig> {
    const pluginStore = await this.getCommonService().getPluginStore();

    await pluginStore.set({ key: "config", value: body });

    return this.config<SettingsCommentsPluginConfig>();
  },

  async restoreConfig(
    this: IServiceAdmin,
  ): Promise<SettingsCommentsPluginConfig> {
    const pluginStore = await this.getCommonService().getPluginStore();

    await pluginStore.delete({ key: "config" });

    return this.config<SettingsCommentsPluginConfig>();
  },

  async restart() {
    setImmediate(() => strapi.reload());
  },

  // Find all comments
  async findAll(
    this: IServiceAdmin,
    { ...query }: AdminFindAllProps,
  ): Promise<AdminPaginatedResponse<Comment>> {
    const {
      _q,
      orderBy,
      pageSize = 10,
      page = 1,
      filters,
    }: AdminFindAllQueryParamsParsed = parseParams<AdminFindAllQueryParamsParsed>(
      query,
    );

    const defaultWhere = {
      $or: [{ removed: false }, { removed: null }],
    };

    const defaultAuthorUserPopulate = this.getDefaultAuthorPopulate();

    let params: StrapiDBQueryArgs<CommentModelKeys> = {
      where: !isEmpty(filters)
        ? {
          ...defaultWhere,
          ...filters,
        }
        : { ...defaultWhere },
      offset: (page - 1) * pageSize,
      limit: pageSize,
      orderBy: orderBy || [{ createdAt: "desc" }],
    };
    if (_q) {
      params = {
        ...params,
        where: {
          ...params.where,
          content: {
            $contains: _q,
          },
        },
      };
    }

    const basePopulate = {
      threadOf: true,
      reports: {
        where: {
          resolved: false,
        },
      },
    }
    const populate = defaultAuthorUserPopulate
      ? {
        ...basePopulate,
        authorUser: defaultAuthorUserPopulate,
      }
      : basePopulate;

    const entities = await strapi.db
      .query<Comment>(getModelUid("comment"))
      .findMany({
        ...params,
        populate,
      });
    const total = await strapi.db.query<Comment>(getModelUid("comment")).count({
      where: params.where,
    });
    const relatedEntities =
      await this.getCommonService().findRelatedEntitiesFor(entities);
    const result = entities
      .map((_) =>
        filterOurResolvedReports(
          this.getCommonService().sanitizeCommentEntity(
            _,
            [],
            defaultAuthorUserPopulate?.populate,
          ),
        ),
      )
      .map((_) =>
        this.getCommonService().mergeRelatedEntityTo(_, relatedEntities),
      );

    const pageCount = Math.floor(total / pageSize);

    return {
      result,
      pagination: {
        page: page,
        pageSize: pageSize,
        pageCount: total % pageSize === 0 ? pageCount : pageCount + 1,
        total,
      },
    };
  },

  //Find all reports
  async findReports(
    this: IServiceAdmin,
    query: AdminFindAllProps,
  ): Promise<AdminPaginatedResponse<Comment>> {
    const {
      _q,
      filters,
      orderBy,
      page = 1,
      pageSize = 10,
    }: AdminFindAllQueryParamsParsed = parseParams<AdminFindAllQueryParamsParsed>(
      query,
    );

    const defaultWhere = {
      resolved: { $notNull: true },
    };

    const defaultAuthorUserPopulate = this.getDefaultAuthorPopulate();

    let params: StrapiDBQueryArgs<CommentModelKeys> = {
      where: !isEmpty(filters)
        ? {
          ...defaultWhere,
          ...filters,
        }
        : { ...defaultWhere },
      offset: (page - 1) * pageSize,
      limit: pageSize,
      orderBy: orderBy || [{ resolved: "asc" }, { createdAt: "desc" }],
    };
    if (_q) {
      params = {
        ...params,
        where: {
          ...params.where,
          content: {
            $contains: _q,
          },
        },
      };
    }

    const entities: Comment<CommentAuthor>[] = await strapi.db
      .query<Comment>(getModelUid("comment-report"))
      .findMany({
        ...params,
        populate: ["related"],
      });

    const total: number = await strapi.db
      .query<Comment>(getModelUid("comment-report"))
      .count({
        where: params.where,
      });

    const reportedCommentsIds: Id[] = entities.map(
      (report) => report.related.id,
    );

    const commentsInThreads: Comment[] = await strapi.db
      .query<Comment>(getModelUid("comment"))
      .findMany({
        where: {
          threadOf: reportedCommentsIds,
        },
        populate: ["threadOf"],
        limit: Number.MAX_SAFE_INTEGER,
      });

    const commentWithThreadIds: Id[] = [
      ...new Set(
        commentsInThreads.map(({ threadOf }) => {
          assertComment(threadOf);
          return threadOf.id;
        }),
      ),
    ];

    const result = entities.map((_) => {
      const isCommentWithThread = commentWithThreadIds.includes(_.related.id);

      return filterOurResolvedReports(
        this.getCommonService().sanitizeCommentEntity(
          {
            ..._,
            related: this.getCommonService().sanitizeCommentEntity({
              ..._.related,
              gotThread: isCommentWithThread,
            }, []),
          },
          [],
          defaultAuthorUserPopulate?.populate,
        ),
      );
    });

    const pageCount = Math.floor(total / pageSize);

    return {
      result,
      pagination: {
        page: page,
        pageSize: pageSize,
        pageCount: total % pageSize === 0 ? pageCount : pageCount + 1,
        total,
      },
    };
  },

  // Find single comment
  async findOneAndThread(
    this: IServiceAdmin,
    id: Id,
    { removed, ...query }: AdminFindOneAndThreadProps,
  ): Promise<AdminSinglePageResponse> {
    const defaultAuthorUserPopulate = this.getDefaultAuthorPopulate();

    const defaultWhere = !removed
      ? {
        $or: [{ removed: false }, { removed: { $notNull: false } }],
      }
      : {};

    const reportsPopulation = {
      reports: {
        where: {
          resolved: false,
        },
      },
    };

    const basePopulate = { 
      populate: {
        threadOf: {
          populate: {
            ...reportsPopulation,
          },
        },
        ...reportsPopulation,
      },
    };

    const defaultPopulate = defaultAuthorUserPopulate 
      ? {
        populate: {
          ...basePopulate.populate,
          authorUser: defaultAuthorUserPopulate,
          threadOf: {
            populate: {
              ...basePopulate.populate.threadOf.populate,
              authorUser: defaultAuthorUserPopulate,
            },
          },
        },
      }
      : basePopulate;

    const entity = await strapi.db
      .query<Comment>(getModelUid("comment"))
      .findOne({
        where: {
          id,
        },
        ...defaultPopulate,
      });

    if (!entity) {
      throw new PluginError(404, "Not found");
    }

    const [relatedUid, relatedStringId] = getRelatedGroups(entity.related);
    const parsedRelatedId = parseInt(relatedStringId);
    const relatedId = isNumber(parsedRelatedId)
      ? parsedRelatedId
      : relatedStringId;
    const relatedEntity = await strapi.db
      .query<RelatedEntity>(relatedUid)
      .findOne({
        where: { id: relatedId },
      })
      .then((_: RelatedEntity) => ({
        ..._,
        uid: relatedUid,
      }));

    if (!relatedEntity) {
      throw new PluginError(404, "Relation not found");
    }

    const levelThreadId = (entity?.threadOf as Comment)?.id || null;
    const entitiesOnSameLevel =
      await this.getCommonService().findAllInHierarchy(
        {
          query: {
            ...defaultWhere,
            ...query,
            threadOf: levelThreadId,
            related: entity.related,
          },
          ...defaultPopulate,
          startingFromId: levelThreadId,
          isAdmin: true,
        },
        false,
      );
    const selectedEntity = this.getCommonService().sanitizeCommentEntity(
      {
        ...entity,
        threadOf: entity.threadOf || null,
      },
      [],
      defaultAuthorUserPopulate?.populate,
    );

    return {
      entity: relatedEntity,
      selected: selectedEntity,
      level: entitiesOnSameLevel,
    };
  },

  // Block / Unblock a comment
  async blockComment(
    this: IServiceAdmin,
    id: Id,
    forceStatus?: boolean,
  ): Promise<Comment> {
    const existingEntity = await this.getCommonService().findOne({ id });
    const changedEntity = await strapi.db
      .query<Comment>(getModelUid("comment"))
      .update({
        where: { id },
        data: {
          blocked: !isNil(forceStatus) ? forceStatus : !existingEntity.blocked,
        },
      });
    return this.getCommonService().sanitizeCommentEntity(changedEntity, []);
  },

  // Delete a comment
  async deleteComment(
    this: IServiceAdmin,
    id: Id,
  ): Promise<Comment> {

    const changedEntity = await strapi.db
      .query<Comment>(getModelUid("comment"))
      .update({
        where: { id },
        data: {
          removed: true,
        },
      });
    return this.getCommonService().sanitizeCommentEntity(changedEntity, []);
  },

  // Block / Unblock a comment thread
  async blockCommentThread(
    this: IServiceAdmin,
    id: Id,
    forceStatus?: boolean,
  ): Promise<Comment> {
    const existingEntity = await this.getCommonService().findOne({ id });
    const status = !isNil(forceStatus)
      ? forceStatus
      : !existingEntity.blockedThread;
    const changedEntity = await strapi.db
      .query<Comment>(getModelUid("comment"))
      .update({
        where: { id },
        data: {
          blocked: status,
          blockedThread: status,
        },
      });
    await this.blockNestedThreads(id, changedEntity.blockedThread);

    return this.getCommonService().sanitizeCommentEntity(changedEntity, []);
  },

  // Approve comment
  async approveComment(this: IServiceAdmin, id: Id): Promise<Comment> {
    const changedEntity = await strapi.db
      .query<Comment>(getModelUid("comment"))
      .update({
        where: { id },
        data: { approvalStatus: APPROVAL_STATUS.APPROVED },
      });

    return this.getCommonService().sanitizeCommentEntity(changedEntity, []);
  },

  async rejectComment(this: IServiceAdmin, id: Id): Promise<Comment> {
    const changedEntity = await strapi.db
      .query<Comment>(getModelUid("comment"))
      .update({
        where: { id },
        data: { approvalStatus: APPROVAL_STATUS.REJECTED },
      });

    return this.getCommonService().sanitizeCommentEntity(changedEntity, []);
  },

  async blockNestedThreads(
    this: IServiceAdmin,
    id: Id,
    blockStatus?: boolean,
  ): Promise<boolean> {
    return await this.getCommonService().modifiedNestedNestedComments(
      id,
      "blockedThread",
      blockStatus,
    );
  },

  // Resolve reported abuse for comment
  async resolveAbuseReport(
    this: IServiceAdmin,
    id: Id,
    commentId: Id,
  ): Promise<CommentReport> {
    return strapi.db
      .query<CommentReport>(getModelUid("comment-report"))
      .update({
        where: {
          id,
          related: commentId,
        },
        data: { resolved: true },
      });
  },

  // Resolve multiple reported abuse for one chosen comment
  async resolveCommentMultipleAbuseReports(
    this: IServiceAdmin,
    ids: Array<Id>,
    commentId: Id,
  ): Promise<StrapiDBBulkActionResponse> {
    /**
     *  Built-in ORM solution names the `id` columns wrongly (leaves one without prefix) what causes error: ER_NON_UNIQ_ERROR: Column 'id' in where clause is ambiguous
     *
     *  Following workaround findMany call solves the `related` condition before making single updateMany like:
     *
     * .updateMany({
     *  where: { id: ids, related: commentId },
     *  data: { resolved: true },
     * });
     *
     */

    const reportsToResolve = await strapi.db
      .query<CommentReport>(getModelUid("comment-report"))
      .findMany({
        where: {
          id: ids,
          related: commentId,
        },
        populate: ["related"],
      });

    if (reportsToResolve.length === ids.length) {
      return strapi.db
        .query<CommentReport>(getModelUid("comment-report"))
        .updateMany({
          where: { id: ids },
          data: { resolved: true },
        });
    }

    throw new PluginError(
      400,
      "At least one of selected reports got invalid comment entity relation. Try again.",
    );
  },

  async resolveAllAbuseReportsForComment(
    this: IServiceAdmin,
    commentId: Id,
  ): Promise<StrapiDBBulkActionResponse> {
    if (commentId) {
      const blockedCommentReports: Promise<CommentReport[]> = strapi.db
        .query<CommentReport>(getModelUid("comment-report"))
        .findMany({
          where: {
            related: commentId,
            resolved: false,
          },
          populate: ["related"],
        });

      const reportIds: Id[] = (await blockedCommentReports).map(
        (report: { id: Id }) => report.id,
      );

      return strapi.db
        .query<CommentReport>(getModelUid("comment-report"))
        .updateMany({
          where: {
            id: reportIds,
          },
          data: { resolved: true },
        });
    }

    throw new PluginError(
      400,
      "There is something wrong with comment Id. Try again.",
    );
  },

  async resolveAllAbuseReportsForThread(
    this: IServiceAdmin,
    commentId: Id,
  ): Promise<StrapiDBBulkActionResponse> {
    if (commentId) {
      const commentsInThread = strapi.db
        .query<Comment>(getModelUid("comment"))
        .findMany({
          where: {
            threadOf: commentId,
          },
        });

      const commentsInThreadIds = (await commentsInThread).map(
        (comment) => comment.id,
      );

      commentsInThreadIds.push(commentId);

      const reportsInThread = strapi.db
        .query<CommentReport>(getModelUid("comment-report"))
        .findMany({
          where: {
            related: commentsInThreadIds,
            resolved: false,
          },
          populate: ["related"],
        });

      const reportsInThreadIds = (await reportsInThread).map(
        (report) => report.id,
      );

      return strapi.db
        .query<CommentReport>(getModelUid("comment-report"))
        .updateMany({
          where: {
            id: reportsInThreadIds,
          },
          data: { resolved: true },
        });
    }

    throw new PluginError(
      400,
      "There is something wrong with comment Id. Try again.",
    );
  },

  async resolveMultipleAbuseReports(
    ids: Array<Id>,
  ): Promise<StrapiDBBulkActionResponse> {
    if (!!ids.length) {
      return strapi.db
        .query<CommentReport>(getModelUid("comment-report"))
        .updateMany({
          where: { id: { $in: ids } },
          data: { resolved: true },
        });
    }

    throw new PluginError(
      400,
      "At least one of selected reports got invalid comment entity relation. Try again.",
    );
  },

  //Post moderator comment
  async postComment(
    this: IServiceAdmin,
    threadId: Id,
    body: ToBeFixed,
    author: StrapiAdminUser
  ): Promise<Comment> {
    const entity = await strapi.db
      .query<Comment>(getModelUid("comment"))
      .findOne({
        where: {
          id: threadId,
        },
      });

    return await strapi.db
      .query<Comment>(getModelUid("comment"))
      .create({
        data: {
          approvalStatus: "APPROVED",
          authorId: author.id,
          authorName: getAuthorName(author),
          authorEmail: author.email,
          content: body,
          threadOf: threadId,
          related: entity.related,
          isAdminComment: true,
        },
      });
  },

  //Update moderator comment
  async updateComment(
    this: IServiceAdmin,
    id: Id,
    body: ToBeFixed,
  ): Promise<Comment> {
    const updateComment = await strapi.db
      .query<Comment>(getModelUid("comment"))
      .update({
        where: { id },
        data: {
          content: body
        }
      });
    return this.getCommonService().sanitizeCommentEntity(updateComment, []);
  },

  // Recognize Strapi User fields possible to populate
  getDefaultAuthorPopulate(this: IServiceAdmin): undefined | any {
    const strapiUserTypeUid = "plugin::users-permissions.user";
    const allowedTypes = ["media", "relation"];

    const { attributes } = strapi.contentTypes[strapiUserTypeUid] || {};
    const relationTypes = Object.keys(attributes)?.filter((key: string) =>
      allowedTypes.includes(attributes[key]?.type),
    );

    if (relationTypes.includes("avatar")) {
      return {
        populate: { avatar: true },
      };
    }

    return undefined;
  },
});
