import BadWordsFilter from "bad-words";
import {
  isArray,
  isNumber,
  isObject,
  isNil,
  isString,
  isEmpty,
  first,
  parseInt,
  set,
  get,
  uniq,
} from "lodash";
import {
  Id,
  StrapiContext,
  StrapiStore,
  StrapiPagination,
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
  FindAllInHierarhyProps,
  IServiceCommon,
  ToBeFixed,
  Comment,
  RelatedEntity,
  CommentModelKeys,
  SettingsCommentsPluginConfig,
} from "../../types";
import { REGEX, CONFIG_PARAMS } from "../utils/constants";
import PluginError from "./../utils/error";
import {
  getModelUid,
  getRelatedGroups,
  buildNestedStructure,
  filterOurResolvedReports,
  buildAuthorModel,
  buildConfigQueryProp,
} from "./utils/functions";

/**
 * Comments Plugin - common services
 */

const PAGE_SIZE = 10;

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
    }: FindAllFlatProps<Comment>,
    relatedEntity: RelatedEntity | null = null
  ): Promise<StrapiPaginatedResponse<Comment>> {
    const defaultSelect: Array<CommentModelKeys> = ["id", "related"];

    const populateClause: PopulateClause<CommentModelKeys> = {
      authorUser: true,
      ...(isObject(populate) ? populate : {}),
    };

    let queryExtension: StrapiDBQueryArgs<CommentModelKeys> = {};

    if (sort && (isString(sort) || isArray(sort))) {
      queryExtension = {
        ...queryExtension,
        orderBy: (isString(sort) ? [sort] : sort)
          .map((_) => (REGEX.sorting.test(_) ? _ : `${_}:asc`))
          .reduce((prev, curr) => {
            const [type = "asc", ...parts] = curr.split(":").reverse();
            return { ...set(prev, parts.reverse().join("."), type) };
          }, {}),
      };
    }

    if (!isNil(fields)) {
      queryExtension = {
        ...queryExtension,
        select: isArray(fields) ? uniq([...fields, ...defaultSelect]) : fields,
      };
    }

    let meta: StrapiResponseMeta = {} as StrapiResponseMeta;
    if (pagination && isObject(pagination)) {
      const parsedpagination: StrapiPagination = Object.keys(pagination).reduce(
        (prev: StrapiPagination, curr: string) => ({
          ...prev,
          [curr]: parseInt(get(pagination, curr)),
        }),
        {}
      );
      const {
        page = 1,
        pageSize = PAGE_SIZE,
        start = 0,
        limit = PAGE_SIZE,
      } = parsedpagination;
      const paginationByPage =
        !isNil(parsedpagination?.page) || !isNil(parsedpagination?.pageSize);

      queryExtension = {
        ...queryExtension,
        offset: paginationByPage ? (page - 1) * pageSize : start,
        limit: paginationByPage ? pageSize : limit,
      };

      const metapagination = paginationByPage
        ? {
            pagination: {
              page,
              pageSize,
            },
          }
        : {
            pagination: {
              start,
              limit,
            },
          };

      meta = {
        ...metapagination,
      };
    }

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
      relatedEntity !== null
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
        authorUserPopulate = 'populate' in populateClause.authorUser ? 
          populateClause.authorUser.populate as StringMap<unknown> : 
          populateClause.authorUser;
      }

      return this.sanitizeCommentEntity(
        {
          ..._,
          threadOf: parsedThreadOf || _.threadOf || null,
          gotThread: (threadedItem?.itemsInTread || 0) > 0,
          threadFirstItemId: threadedItem?.firstThreadItemId,
        },
        authorUserPopulate
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
    }: FindAllInHierarhyProps,
    relatedEntity?: RelatedEntity | null | boolean
  ): Promise<Array<Comment>> {
    const entities = await this.findAllFlat(
      { query, populate, sort, fields },
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
    return filterOurResolvedReports(this.sanitizeCommentEntity(entity));
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
    populate?: PopulateClause<OnlyStrings<keyof StrapiUser>>
  ): Comment {
    const fieldsToPopulate = isArray(populate)
      ? populate
      : Object.keys(populate || {});

    return {
      ...buildAuthorModel(
        {
          ...entity,
          threadOf: isObject(entity.threadOf)
            ? buildAuthorModel(entity.threadOf, fieldsToPopulate)
            : entity.threadOf,
        },
        fieldsToPopulate
      ),
    };
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

    if (!isEnabledCollection) {
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
      const filter = new BadWordsFilter(
        isObject(config) ? (config as ToBeFixed) : undefined
      );
      if (content && filter.isProfane(content)) {
        throw new PluginError(
          400,
          "Bad language used! Please polite your comment...",
          {
            content: {
              original: content,
              filtered: content && filter.clean(content),
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
});
