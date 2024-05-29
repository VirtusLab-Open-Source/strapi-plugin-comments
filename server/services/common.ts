import {replaceProfanities, isProfane} from "no-profanity";

import {
  isArray,
  isNumber,
  isObject,
  isNil,
  isString,
  isEmpty,
  first,
  parseInt,
  get,
  omit as filterItem
} from "lodash";
import {
  Id,
  StrapiContext,
  StrapiStore,
  StrapiResponseMeta,
  StrapiPaginatedResponse,
  StrapiDBQueryArgs,
  PopulateClause,
  StrapiUser,
  OnlyStrings,
  StringMap,
} from "strapi-typed";
import {
  CommentsPluginConfig,
  FindAllFlatProps,
  FindAllInHierarchyProps,
  IServiceCommon,
  ToBeFixed,
  Comment,
  RelatedEntity,
  CommentModelKeys,
  SettingsCommentsPluginConfig,
} from "../../types";
import { CONFIG_PARAMS } from "../utils/constants";
import PluginError from "./../utils/error";
import {
  getModelUid,
  getRelatedGroups,
  buildNestedStructure,
  filterOurResolvedReports,
  buildAuthorModel,
  buildConfigQueryProp,
} from "./utils/functions";
import { 
  parseFieldsQuery,
  parsePaginationsQuery,
  parseSortQuery
} from "./utils/parsers";
import { ContentType, LifeCycleHookName } from "../utils/types";
import { Effect } from "../../types/utils";

/**
 * Comments Plugin - common services
 */

const PAGE_SIZE = 10;
const REQUIRED_FIELDS = ["id"];

type LifecycleHookRecord = Partial<Record<LifeCycleHookName, Array<Effect<ToBeFixed>>>>;

const lifecycleHookListeners: Record<ContentType, LifecycleHookRecord> = {
  comment: {},
  "comment-report": {}
};

export = ({ strapi }: StrapiContext): IServiceCommon => ({
  async getConfig<T>(
    this: IServiceCommon,
    prop?: string,
    defaultValue?: any,
    useLocal: boolean = false
  ): Promise<T> {
    const queryProp: string = buildConfigQueryProp(prop);
    const pluginStore: StrapiStore = await this.getPluginStore();
    const config: CommentsPluginConfig = await pluginStore.get({
      key: "config",
    });

    let result: T;
    if (config && !useLocal) {
      result = queryProp ? get(config, queryProp, defaultValue) : config;
    } else {
      result = this.getLocalConfig(queryProp, defaultValue);
    }
    return isNil(result) ? defaultValue : result;
  },

  async getPluginStore(): Promise<StrapiStore> {
    return strapi.store({ type: "plugin", name: "comments" });
  },

  getLocalConfig<T>(prop?: string, defaultValue?: any): T {
    const queryProp: string = buildConfigQueryProp(prop);
    const result: T = strapi.config.get(
      `plugin.comments${queryProp ? "." + queryProp : ""}`
    );
    return isNil(result) ? defaultValue : result;
  },

  // Find comments in the flat structure
  async findAllFlat(
    this: IServiceCommon,
    {
      query = {},
      populate = {},
      sort,
      pagination,
      fields,
      isAdmin = false,
      omit: baseOmit = [],
    }: FindAllFlatProps<Comment>,
    relatedEntity: RelatedEntity | null = null
  ): Promise<StrapiPaginatedResponse<Comment>> {
    const omit = baseOmit.filter((field) => !REQUIRED_FIELDS.includes(field));
    const defaultSelect: Array<CommentModelKeys> = (["id", "related"] as const).filter((field) => !omit.includes(field));

    const populateClause: PopulateClause<CommentModelKeys> = {
      authorUser: true,
      ...(isObject(populate) ? populate : {}),
    };
    const doNotPopulateAuthor: Array<string> = isAdmin 
      ? [] 
      : await this.getConfig<
        Array<string>
      >(CONFIG_PARAMS.AUTHOR_BLOCKED_PROPS, []);

    const sortQuery = parseSortQuery(sort);
    const fieldsQuery = parseFieldsQuery(fields, sortQuery, defaultSelect);
    let [meta, queryExtension = {}]: [StrapiResponseMeta, StrapiDBQueryArgs<CommentModelKeys>] = parsePaginationsQuery(pagination, fieldsQuery, { PAGE_SIZE });

    const entries = await strapi.db
      .query<Comment>(getModelUid("comment"))
      .findMany({
        where: {
          ...query,
        },
        populate: {
          ...populateClause,
        },
        ...queryExtension,
      });

    if (
      pagination?.withCount &&
      (pagination.withCount === "true" || pagination.withCount === true)
    ) {
      const total = await strapi.db
        .query<Comment>(getModelUid("comment"))
        .count({
          where: {
            ...query,
          },
        });
      const pageSize = meta.pagination.pageSize || PAGE_SIZE;
      const pageCount = Math.floor(total / pageSize);
      meta = {
        ...meta,
        pagination: {
          ...meta.pagination,
          pageCount: !isNil(meta.pagination.page)
            ? total % pageSize === 0
              ? pageCount
              : pageCount + 1
            : undefined,
          total,
        },
      };
    }

    const entriesWithThreads = await Promise.all<{
      id: Id;
      itemsInTread: number;
      firstThreadItemId: Id | undefined;
    }>(
      entries.map(async (_: Comment) => {
        const [nestedEntries, count] = await strapi.db
          .query<Comment>(getModelUid("comment"))
          .findWithCount({
            where: {
              threadOf: _.id,
            },
          });
        return {
          id: _.id,
          itemsInTread: count,
          firstThreadItemId: first<Comment | undefined>(nestedEntries)?.id,
        };
      })
    );

    const relatedEntities =
      omit.includes("related")
        ? []
        : relatedEntity !== null
          ? [relatedEntity]
          : await this.findRelatedEntitiesFor([...entries]);
    const hasRelatedEntitiesToMap =
      relatedEntities.filter((_: RelatedEntity) => _).length > 0;

    const result = entries.map((_: Comment) => {
      const threadedItem = entriesWithThreads.find(
        (item: {
          id: Id;
          itemsInTread: number;
          firstThreadItemId: Id | undefined;
        }) => item.id === _.id
      );
      const parsedThreadOf = isString(query.threadOf)
        ? parseInt(query.threadOf)
        : query.threadOf;

      let authorUserPopulate = {};
      if (isObject(populateClause?.authorUser)) {
        authorUserPopulate =
          "populate" in populateClause.authorUser
            ? (populateClause.authorUser.populate as StringMap<unknown>)
            : populateClause.authorUser;
      }

      const primitiveThreadOf = isString(parsedThreadOf) || isNumber(parsedThreadOf) ?
        parsedThreadOf :
        null;

      return this.sanitizeCommentEntity(
        {
          ..._,
          threadOf: primitiveThreadOf || _.threadOf,
          gotThread: (threadedItem?.itemsInTread || 0) > 0,
          threadFirstItemId: threadedItem?.firstThreadItemId,
        } as ToBeFixed,
        doNotPopulateAuthor,
        omit,
        authorUserPopulate,
      );
    });

    return {
      data: hasRelatedEntitiesToMap
        ? result.map((_: Comment) =>
            this.mergeRelatedEntityTo(_, relatedEntities)
          )
        : result,
      ...(isEmpty(meta) ? {} : { meta }),
    };
  },

  // Find comments and create relations tree structure
  async findAllInHierarchy(
    this: IServiceCommon,
    {
      query,
      populate = {},
      sort,
      fields,
      startingFromId = null,
      dropBlockedThreads = false,
      isAdmin = false,
      omit = [],
    }: FindAllInHierarchyProps,
    relatedEntity?: RelatedEntity | null | boolean
  ): Promise<Array<Comment>> {
    const entities = await this.findAllFlat(
      { query, populate, sort, fields, isAdmin, omit },
      relatedEntity
    );
    return buildNestedStructure(
      entities?.data,
      startingFromId,
      "threadOf",
      dropBlockedThreads,
      false
    );
  },

  // Find single comment
  async findOne(criteria): Promise<Comment> {
    const entity = await strapi.db
      .query<Comment>(getModelUid("comment"))
      .findOne({
        where: criteria,
        populate: {
          reports: true,
          authorUser: true,
        },
      });
    if (!entity) {
      throw new PluginError(
        404,
        "Comment does not exist. Check your payload please."
      );
    }
    const doNotPopulateAuthor: Array<string> = await this.getConfig<
      Array<string>
    >(CONFIG_PARAMS.AUTHOR_BLOCKED_PROPS, []);
    return filterOurResolvedReports(this.sanitizeCommentEntity(entity, doNotPopulateAuthor));
  },

  // Find all for author
  async findAllPerAuthor(
    this: IServiceCommon,
    {
      query = {},
      populate = {},
      pagination,
      sort,
      fields,
      isAdmin = false,
    }: FindAllFlatProps<Comment>,
    authorId: Id,
    isStrapiAuthor: boolean = false,
  ): Promise<StrapiPaginatedResponse<Comment>> {
    if (isNil(authorId)) {
      return {
        data: [],
      };
    }

    const { related, ...restQuery } = query;

    const authorQuery = isStrapiAuthor ? {
      authorUser: {
        id: authorId
      },
    } : {
      authorId,
    };

    const response = await this.findAllFlat({ 
      query: {
        ...restQuery,
        ...authorQuery,
      },
      pagination, populate, sort, fields, isAdmin 
    });

    return {
      ...response,
      data: response.data.map(({ author, ...rest }: Comment): Comment => rest),
    };
  },

  // Find all related entiries
  async findRelatedEntitiesFor(
    entities: Array<Comment> = []
  ): Promise<Array<RelatedEntity>> {
    const data = entities.reduce(
      (acc: { [key: string]: Array<string | number> }, curr: Comment) => {
        const [relatedUid, relatedStringId] = getRelatedGroups(curr.related);
        const parsedRelatedId = parseInt(relatedStringId);
        const relatedId = isNumber(parsedRelatedId)
          ? parsedRelatedId
          : relatedStringId;
        return {
          ...acc,
          [relatedUid]: [...(acc[relatedUid] || []), relatedId],
        };
      },
      {}
    );

    return Promise.all<Array<RelatedEntity>>(
      Object.entries(data).map(
        async ([relatedUid, relatedStringIds]): Promise<Array<RelatedEntity>> =>
          strapi.db
            .query<RelatedEntity>(relatedUid)
            .findMany({
              where: { id: Array.from(new Set(relatedStringIds as ToBeFixed)) },
            })
            .then((relatedEntities: Array<RelatedEntity>) =>
              relatedEntities.map((_: RelatedEntity) => ({
                ..._,
                uid: relatedUid,
              }))
            )
      )
    ).then((result) => result.flat(2));
  },

  // Merge related entity with comment
  mergeRelatedEntityTo(
    entity: Comment,
    relatedEntities: Array<RelatedEntity> = []
  ): Comment {
    return {
      ...entity,
      related: relatedEntities.find(
        (relatedEntity) =>
          entity.related === `${relatedEntity.uid}:${relatedEntity.id}`
      ),
    };
  },

  async modifiedNestedNestedComments(
    this: IServiceCommon,
    id: Id,
    fieldName: string,
    value: any
  ): Promise<boolean> {
    try {
      const entitiesToChange = await strapi.db
        .query<Comment>(getModelUid("comment"))
        .findMany({
          where: { threadOf: id },
        });
      const changedEntities = await strapi.db
        .query<Comment>(getModelUid("comment"))
        .updateMany({
          where: { id: entitiesToChange.map((_: Comment) => _.id) },
          data: { [fieldName]: value },
        });
      if (
        entitiesToChange.length === changedEntities.count &&
        changedEntities.count > 0
      ) {
        const nestedTransactions = await Promise.all(
          entitiesToChange.map((item: Comment) =>
            this.modifiedNestedNestedComments(item.id, fieldName, value)
          )
        );
        return nestedTransactions.length === changedEntities.count;
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  sanitizeCommentEntity(
    entity: Comment,
    blockedAuthorProps: string[],
    omit = [] as string[],
    populate?: PopulateClause<OnlyStrings<keyof StrapiUser>>,
  ): Comment {
    const fieldsToPopulate = isArray(populate)
      ? populate
      : Object.keys(populate || {});

    return filterItem({
      ...buildAuthorModel(
        {
          ...entity,
          threadOf: isObject(entity.threadOf)
            ? buildAuthorModel(entity.threadOf, blockedAuthorProps, fieldsToPopulate)
            : entity.threadOf,
        },
        blockedAuthorProps,
        fieldsToPopulate,
      ),
    }, omit) as Comment;
  },

  isValidUserContext(user?: any): boolean {
    return user ? !isNil(user?.id) : true;
  },

  async parseRelationString(
    this: IServiceCommon,
    relation
  ): Promise<[uid: string, relatedId: string | number]> {
    const [uid, relatedStringId] = getRelatedGroups(relation);
    const parsedRelatedId = parseInt(relatedStringId);
    const relatedId = isNumber(parsedRelatedId)
      ? parsedRelatedId
      : relatedStringId;

    const isEnabledCollection: boolean = await this.isEnabledCollection(uid);
    const enabledCollections: Array<string> = await this.getConfig<
      Array<string>
    >(CONFIG_PARAMS.ENABLED_COLLECTIONS, []);

    if (enabledCollections.length > 0 && !isEnabledCollection) {
      throw new PluginError(
        403,
        `Action not allowed for collection '${uid}'. Use one of: ${enabledCollections.join(
          ", "
        )}`
      );
    }
    return [uid, relatedId];
  },

  async checkBadWords(
    this: IServiceCommon,
    content: string
  ): Promise<boolean | string | PluginError> {
    const config: boolean = await this.getConfig<boolean>(
      CONFIG_PARAMS.BAD_WORDS,
      true
    );
    if (config) {
      if (content && isProfane({testString: content})) {
        throw new PluginError(
          400,
          "Bad language used! Please polite your comment...",
          {
            content: {
              original: content,
              filtered: content && replaceProfanities({testString: content}),
            },
          }
        );
      }
    }
    return content;
  },

  async isEnabledCollection(
    this: IServiceCommon,
    uid: string
  ): Promise<boolean> {
    const enabledCollections = await this.getConfig<
      SettingsCommentsPluginConfig["enabledCollections"]
    >("enabledCollections", []);
    return enabledCollections.includes(uid);
  },

  registerLifecycleHook({ callback, contentTypeName, hookName }) {
    if (!lifecycleHookListeners[contentTypeName][hookName]) {
      lifecycleHookListeners[contentTypeName][hookName] = [];
    }

    lifecycleHookListeners[contentTypeName][hookName]?.push(callback);
  },

  async runLifecycleHook({ contentTypeName, event, hookName }) {
    const hookListeners = lifecycleHookListeners[contentTypeName][hookName] ?? [];

    for (const listener of hookListeners) {
      await listener(event);
    }
  },
});
