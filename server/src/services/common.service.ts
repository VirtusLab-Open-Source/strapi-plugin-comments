import { Params } from '@strapi/database/dist/entity-manager/types';
import { UID } from '@strapi/strapi';
import { first, get, isNil, isObject, isString, omit as filterItem, parseInt, uniq } from 'lodash';
import { isProfane, replaceProfanities } from 'no-profanity';
import { Id, PathTo, PathValue, RelatedEntity, StrapiContext } from '../@types';
import { CommentsPluginConfig } from '../config';
import { ContentTypesUUIDs } from '../content-types';
import { getCommentRepository, getStoreRepository } from '../repositories';
import { getOrderBy } from '../repositories/utils';
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
  relatedId: string;
};


type Created = PathTo<CommentsPluginConfig>;

const commonService = ({ strapi }: StrapiContext) => ({
  async getConfig<T extends Created>(prop?: T, defaultValue?: PathValue<CommentsPluginConfig, T>, useLocal = false): Promise<PathValue<CommentsPluginConfig, T>> {
    const storeRepository = getStoreRepository(strapi);
    const config = await storeRepository.getConfig();
    if (prop && !useLocal) {
      return get(config, prop, defaultValue) as PathValue<CommentsPluginConfig, T>;
    }
    if (useLocal) {
      return storeRepository.getLocalConfig(prop, defaultValue) as PathValue<CommentsPluginConfig, T>;
    }
    return config as PathValue<CommentsPluginConfig, T>;
  },
  parseRelationString(relation: `${string}::${string}.${string}:${string}` | string): ParsedRelation {
    const [uid, relatedStringId] = getRelatedGroups(relation);
    return { uid: uid as UID.ContentType, relatedId: relatedStringId };
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
    populate,
    omit: baseOmit = [],
    isAdmin = false,
    pagination,
    filters = {},
    locale,
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
      select: Array.isArray(fields) ? uniq([...fields, defaultSelect].flat()) : fields,
    };

    const entries = await getCommentRepository(strapi).findMany({
      where: {
        ...filters,
        ...(locale ? { locale } : {}),
      },
      populate: populateClause,
      ...fieldsQuery,
      limit: limit || PAGE_SIZE,
      offset: skip || 0,
    });

    let paginationData: Pagination = undefined;
    if (pagination?.withCount) {
      paginationData = await getCommentRepository(strapi).findWithCount({ where: { ...filters, ...(locale ? { locale } : {}) } }).then((result) => result.pagination);
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
      const parsedThreadOf = 'threadOf' in filters ? (isString(filters.threadOf) ? parseInt(filters.threadOf) : filters.threadOf) : null;

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
      filters,
      populate,
      sort,
      fields,
      startingFromId,
      dropBlockedThreads,
      isAdmin = false,
      omit = [],
      locale,
    }: clientValidator.FindAllInHierarchyValidatorSchema,
    relatedEntity?: any,
  ) {
    const entities = await this.findAllFlat({ filters, populate, sort, fields, isAdmin, omit, locale }, relatedEntity);
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
      filters = {},
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

      const authorQuery = isStrapiAuthor ? {
        authorUser: {
          id: authorId,
        },
      } : {
        authorId,
      };

      const response = await this.findAllFlat({
        filters: {
          ...filterItem(filters, ['related']),
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
      (acc: { [key: string]: { documentIds: Array<string | number>, locale?: Array<string> } }, curr: Comment) => {
        const [relatedUid, relatedStringId] = getRelatedGroups(curr.related);
        return {
          ...acc,
          [relatedUid]: {
            ...(acc[relatedUid] || {}),
            documentIds: [...(acc[relatedUid]?.documentIds || []), relatedStringId],
            locale: [...(acc[relatedUid]?.locale || []), curr.locale],
          }
        };
      },
      {},
    );

    return Promise.all(
      Object.entries(data).map(
        async ([relatedUid, { documentIds, locale }]) => {
          return Promise.all(
            documentIds.map((documentId, index) => {
              const documentLocale = locale[index];
              return strapi.documents(relatedUid as ContentTypesUUIDs).findOne({
                documentId: documentId.toString(),
                locale: !isNil(locale[index]) ? locale[index] : undefined,
                status: 'published',
              })
            })
          ).then((relatedEntities) =>
            relatedEntities.map((_) => ({
              ..._,
              uid: relatedUid,
            })),
          )
        }
      ),
    ).then((result) => result.flat(2));
  },

  // Merge related entity with comment
  mergeRelatedEntityTo(entity: Comment, relatedEntities: Array<CommentRelated> = []): CommentWithRelated {
    return {
      ...entity,
      related: relatedEntities.find(
        (relatedEntity) => {
          if(relatedEntity.locale && entity.locale) {
            return entity.related === `${relatedEntity.uid}:${relatedEntity.documentId}` && entity.locale === relatedEntity.locale;
          }
          return entity.related === `${relatedEntity.uid}:${relatedEntity.documentId}`;
        },
      ),
    };
  },
  // TODO: we need to add deepLimit to the function to prevent infinite loops
  async modifiedNestedNestedComments<T extends keyof Comment>(id: Id, fieldName: T, value: Comment[T], deepLimit: number = 10): Promise<boolean> {
    if (deepLimit === 0) {
      return true;
    }
    try {
      const entities = await this.findMany({ where: { threadOf: id } });
      const changedEntries = await getCommentRepository(strapi).updateMany({
        where: { id: entities.map((entity) => entity.id) },
        data: { [fieldName]: value },
      });
      if (entities.length === changedEntries.count && changedEntries.count > 0) {
        const nestedTransactions = await Promise.all(
          entities.map((item) =>
            this.modifiedNestedNestedComments(item.id, fieldName, value, deepLimit - 1)),
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
