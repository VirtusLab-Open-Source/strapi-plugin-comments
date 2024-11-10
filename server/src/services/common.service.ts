import { Params } from '@strapi/database/dist/entity-manager/types';
import { UID } from '@strapi/strapi';
import { first, get, isNil, isNumber, isObject, isString, omit as filterItem, parseInt, uniq } from 'lodash';
import { isProfane, replaceProfanities } from 'no-profanity';
import { Id, RelatedEntity, StrapiContext } from '../@types-v5';
import { CommentsPluginConfig } from '../config';
import { ContentTypesUUIDs } from '../content-types';
import { getCommentRepository, getOrderBy, getStoreRepository } from '../repositories';
import { CONFIG_PARAMS } from '../utils/constants';
import PluginError from '../utils/PluginError';
import { client as clientValidator } from '../validators/api';
import { Comment, CommentRelated, CommentWithRelated } from '../validators/repositories';
import { Pagination } from '../validators/repositories/utils';
import { buildAuthorModel, buildNestedStructure, filterOurResolvedReports, getRelatedGroups } from './utils/functions';


const PAGE_SIZE = 10;
const REQUIRED_FIELDS = ['id'];


type ParsedRelation = {
  uid: UID.ContentType;
  relatedId: string | number;
};


const commonService = ({ strapi }: StrapiContext) => ({
  async getConfig<T extends keyof CommentsPluginConfig>(prop?: T, defaultValue?: CommentsPluginConfig[T], useLocal = true): Promise<T extends string ? CommentsPluginConfig[T] : CommentsPluginConfig> {
    const storeRepository = getStoreRepository(strapi);
    const config = await storeRepository.getConfig();
    if (prop && config && !useLocal) {
      return get(config, prop, defaultValue) as T extends string
        ? CommentsPluginConfig[T]
        : CommentsPluginConfig;
    }
    if (useLocal) {
      return storeRepository.getLocalConfig(prop, defaultValue) as T extends string ? CommentsPluginConfig[T] : CommentsPluginConfig;
    }
    return config as T extends string ? CommentsPluginConfig[T] : CommentsPluginConfig;
  },
  parseRelationString(relation: `${string}::${string}` | string): ParsedRelation {
    const [uid, relatedStringId] = getRelatedGroups(relation);
    const parsedRelatedId = parseInt(relatedStringId, 10);
    const relatedId = isNumber(parsedRelatedId) ? parsedRelatedId : relatedStringId;
    return { uid: uid as UID.ContentType, relatedId };
  },
  isValidUserContext<T extends { id?: string | number }>(user?: T): boolean {
    return !!(user?.id);
  },

  sanitizeCommentEntity(entity: Comment | CommentWithRelated, blockedAuthors: string[], omitProps: Array<keyof Comment> = [], populate: any = {}): Comment {
    const fieldsToPopulate = Array.isArray(populate) ? populate : Object.keys(populate || {});
    return filterItem({
      ...buildAuthorModel(
        {
          ...entity,
          threadOf: isObject(entity.threadOf) ? buildAuthorModel(entity.threadOf, blockedAuthors, fieldsToPopulate) : entity.threadOf,
        },
        blockedAuthors,
        fieldsToPopulate,
      ),
    }, omitProps) as Comment;
  },


  // Find comments in the flat structure
  async findAllFlat({
    fields,
    limit,
    skip,
    sort,
    filter,
    populate,
    omit: baseOmit = [],
    isAdmin = false,
    pagination,
    query = {},
  }: clientValidator.FindAllFlatSchema, relatedEntity?: any): Promise<{ data: Array<CommentWithRelated | Comment>, pagination?: Pagination }> {
    const omit = baseOmit.filter((field) => !REQUIRED_FIELDS.includes(field));
    const defaultSelect = (['id', 'related'] as const).filter((field) => !omit.includes(field));

    const populateClause: clientValidator.FindAllFlatSchema['populate'] = {
      authorUser: true,
      ...(isObject(populate) ? populate : {}),
    };
    const doNotPopulateAuthor = isAdmin ? [] : await this.getConfig(CONFIG_PARAMS.AUTHOR_BLOCKED_PROPS, []);
    const [operator, direction] = getOrderBy(sort);
    const fieldsQuery = {
      sort: { [operator]: direction },
      select: Array.isArray(fields) ? uniq([...fields, defaultSelect]) : fields,
    };
    const entries = await getCommentRepository(strapi).findMany({
      where: {
        ...filter,
        ...query,
      },
      populate: populateClause,
      ...fieldsQuery,
      limit: limit || PAGE_SIZE,
      offset: skip || 0,
    });
    let paginationData: Pagination = undefined;
    if (pagination?.withCount) {
      paginationData = await getCommentRepository(strapi).findWithCount({ where: query }).then((result) => result.pagination);
    }
    const entriesWithThreads = await Promise.all(
      entries.map(async (_) => {
        const { results, pagination: { total } } = await getCommentRepository(strapi)
        .findWithCount({
          where: {
            threadOf: _.id,
          },
        });
        return {
          id: _.id,
          itemsInTread: total,
          firstThreadItemId: first(results)?.id,
        };
      }),
    );
    const relatedEntities = omit.includes('related') ? [] : relatedEntity !== null ? [relatedEntity] : await this.findRelatedEntitiesFor([...entries]);
    const hasRelatedEntitiesToMap = relatedEntities.filter((_: RelatedEntity) => _).length > 0;

    const result = entries.map((_) => {
      const threadedItem = entriesWithThreads.find((item) => item.id === _.id);
      const parsedThreadOf = 'threadOf' in query ? (isString(query.threadOf) ? parseInt(query.threadOf) : query.threadOf) : null;

      let authorUserPopulate = {};
      if (isObject(populateClause?.authorUser)) {
        authorUserPopulate = 'populate' in populateClause.authorUser ? (populateClause.authorUser.populate) : populateClause.authorUser;
      }

      const primitiveThreadOf = typeof parsedThreadOf === 'number' ? parsedThreadOf : null;

      return this.sanitizeCommentEntity(
        {
          ..._,
          threadOf: primitiveThreadOf || _.threadOf,
          gotThread: (threadedItem?.itemsInTread || 0) > 0,
          threadFirstItemId: threadedItem?.firstThreadItemId,
        },
        doNotPopulateAuthor,
        omit as Array<keyof Comment>,
        authorUserPopulate,
      );
    });

    return {
      data: hasRelatedEntitiesToMap ? result.map((_) => this.mergeRelatedEntityTo(_, relatedEntities)) : result,
      pagination: paginationData,
    };
  },

  // Find comments and create relations tree structure
  async findAllInHierarchy(
    {
      query,
      populate,
      sort,
      fields,
      startingFromId,
      dropBlockedThreads,
      isAdmin = false,
      omit = [],
    }: clientValidator.FindAllInHierarchyValidatorSchema,
    relatedEntity?: any,
  ) {
    const entities = await this.findAllFlat({ query, populate, sort, fields, isAdmin, omit }, relatedEntity);
    return buildNestedStructure(
      entities?.data,
      startingFromId,
      'threadOf',
      dropBlockedThreads,
      false,
    );
  },

  // Find single comment
  async findOne(criteria: Partial<Params['where']>) {
    const entity = await getCommentRepository(strapi).findOne({
      where: criteria,
      populate: {
        reports: true,
        authorUser: true,
      },
    });
    if (!entity) {
      throw new PluginError(400, 'Comment does not exist. Check your payload please.');
    }
    const doNotPopulateAuthor: Array<string> = await this.getConfig(CONFIG_PARAMS.AUTHOR_BLOCKED_PROPS, []);
    const item = this.sanitizeCommentEntity(entity, doNotPopulateAuthor);
    return filterOurResolvedReports(item);
  },

  async findMany(criteria: Params) {
    return getCommentRepository(strapi).findMany(criteria);
  },

  async updateComment(criteria: Partial<Params['where']>, data: Partial<Comment>) {
    return getCommentRepository(strapi).update({ where: criteria, data });
  },

  // Find all for author
  async findAllPerAuthor({
      query = {},
      populate = {},
      pagination,
      sort,
      fields,
      isAdmin = false,
      authorId,
    }: clientValidator.FindAllPerAuthorValidatorSchema,
    isStrapiAuthor: boolean = false,
  ) {
    {
      if (isNil(authorId)) {
        return {
          data: [],
        };
      }

      const { related, ...restQuery } = query;

      const authorQuery = isStrapiAuthor ? {
        authorUser: {
          id: authorId,
        },
      } : {
        authorId,
      };

      const response = await this.findAllFlat({
        query: {
          ...restQuery,
          ...authorQuery,
        },
        pagination,
        populate,
        sort,
        fields,
        isAdmin,
      });

      return {
        ...response,
        data: response.data.map(({ author, ...rest }) => rest),
      };
    }
  },

  // Find all related entiries
  async findRelatedEntitiesFor(entries: Array<Comment>): Promise<Array<CommentRelated>> {
    const data = entries.reduce(
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
      {},
    );
    return Promise.all(
      Object.entries(data).map(
        async ([relatedUid, relatedStringIds]) =>
          strapi.query(relatedUid as ContentTypesUUIDs)
                .findMany({
                  where: { id: Array.from(new Set(relatedStringIds)) },
                })
                .then((relatedEntities) =>
                  relatedEntities.map((_) => ({
                    ..._,
                    uid: relatedUid,
                  })),
                ),
      ),
    ).then((result) => result.flat(2));
  },

  // Merge related entity with comment
  mergeRelatedEntityTo(entity: Comment, relatedEntities: Array<CommentRelated> = []): CommentWithRelated {
    return {
      ...entity,
      related: relatedEntities.find(
        (relatedEntity) =>
          entity.related === `${relatedEntity.uid}:${relatedEntity.id}`,
      ),
    };
  },

  async modifiedNestedNestedComments<T extends keyof Comment>(id: Id, fieldName: T, value: Comment[T]): Promise<boolean> {
    try {
      const entities = await this.findMany({ where: { threadOf: id } });
      const changedEntries = await getCommentRepository(strapi).updateMany({
        where: { id: entities.map((entity) => entity.id) },
        data: { [fieldName]: value },
      });
      if (entities.length === changedEntries.count && changedEntries.count > 0) {
        const nestedTransactions = await Promise.all(
          entities.map((item) =>
            this.modifiedNestedNestedComments(item.id, fieldName, value)),
        );
        return nestedTransactions.length === changedEntries.count;
      }
      return true;
    } catch {
      return false;
    }
  },

  async checkBadWords(content: string) {
    const config = await this.getConfig(CONFIG_PARAMS.BAD_WORDS, true);
    if (config) {
      if (content && isProfane({ testString: content })) {
        throw new PluginError(
          400,
          'Bad language used! Please polite your comment...',
          {
            content: {
              original: content,
              filtered: content && replaceProfanities({ testString: content }),
            },
          },
        );
      }
    }
    return content;
  },


  registerLifecycleHook(/*{ callback, contentTypeName, hookName }*/) {
  },

  async runLifecycleHook(/*{ contentTypeName, event, hookName }*/) {
  },
});

type CommonService = ReturnType<typeof commonService>;
export default commonService;
