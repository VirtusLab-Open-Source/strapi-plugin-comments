import { Params } from '@strapi/database/dist/entity-manager/types';
import { UID } from '@strapi/strapi';
import { omit as filterItem, first, get, isNil, isObject, isString, parseInt, uniq } from 'lodash';
import { isProfane, replaceProfanities } from 'no-profanity';
import sanitizeHtml from 'sanitize-html';
import { Id, PathTo, PathValue, RelatedEntity, StrapiContext } from '../@types';
import { APPROVAL_STATUS } from '../const';
import { CommentsPluginConfig } from '../config';
import { ContentTypesUUIDs } from '../content-types';
import { getCommentRepository, getReportCommentRepository, getStoreRepository } from '../repositories';
import { getOrderBy } from '../repositories/utils';
import { CONFIG_PARAMS } from '../utils/constants';
import PluginError from '../utils/PluginError';
import { client as clientValidator } from '../validators/api';
import { Comment, CommentRelated, CommentWithRelated } from '../validators/repositories';
import { Pagination } from '../validators/repositories/utils';
import { buildAuthorModel, filterOurResolvedReports, getRelatedGroups } from './utils/functions';

const PAGE_SIZE = 10;
const REQUIRED_FIELDS = ['id'];

type ParsedRelation = {
  uid: UID.ContentType;
  relatedId: string;
};

type Created = PathTo<CommentsPluginConfig>;

const commonService = ({ strapi }: StrapiContext) => ({
  async getConfig<T extends Created>(
    prop?: T,
    defaultValue?: PathValue<CommentsPluginConfig, T>,
    useLocal = false
  ): Promise<PathValue<CommentsPluginConfig, T>> {
    const storeRepository = getStoreRepository(strapi);
    const config = await storeRepository.getConfig();
    if (prop && !useLocal) {
      return get(config, prop, defaultValue) as PathValue<CommentsPluginConfig, T>;
    }
    if (useLocal) {
      return storeRepository.getLocalConfig(prop, defaultValue) as PathValue<
        CommentsPluginConfig,
        T
      >;
    }
    return config as PathValue<CommentsPluginConfig, T>;
  },
  parseRelationString(
    relation: `${string}::${string}.${string}:${string}` | string
  ): ParsedRelation {
    const [uid, relatedStringId] = getRelatedGroups(relation);
    return { uid: uid as UID.ContentType, relatedId: relatedStringId };
  },
  isValidUserContext<T extends { id?: string | number }>(user?: T): boolean {
    return user ? user.id != undefined : true;
  },

  sanitizeCommentEntity(
    entity: Comment | CommentWithRelated,
    blockedAuthors: string[],
    omitProps: Array<keyof Comment> = [],
    populate: any = {}
  ): Comment {
    const fieldsToPopulate = Array.isArray(populate) ? populate : Object.keys(populate || {});
    return filterItem(
      {
        ...buildAuthorModel(
          {
            ...entity,
            threadOf: isObject(entity.threadOf)
              ? buildAuthorModel(entity.threadOf, blockedAuthors, fieldsToPopulate)
              : entity.threadOf,
          },
          blockedAuthors,
          fieldsToPopulate
        ),
      },
      omitProps
    ) as Comment;
  },

  // Find comments in the flat structure
  async findAllFlat(
    {
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
    }: clientValidator.FindAllFlatSchema,
    relatedEntity?: any
  ): Promise<{
    data: Array<CommentWithRelated | Comment>;
    pagination?: Pagination;
  }> {
    const omit = baseOmit.filter((field) => !REQUIRED_FIELDS.includes(field));
    const defaultSelect = (['id', 'related'] as const).filter((field) => !omit.includes(field));

    const populateClause: clientValidator.FindAllFlatSchema['populate'] = {
      authorUser: {
        populate: true,
        avatar: { populate: true },
      },
      ...(isObject(populate) ? populate : {}),
    };
    const doNotPopulateAuthor = isAdmin
      ? []
      : await this.getConfig(CONFIG_PARAMS.AUTHOR_BLOCKED_PROPS, []);
    const [operator, direction] = getOrderBy(sort);
    const fieldsQuery = {
      orderBy: { [operator]: direction },
      select: Array.isArray(fields) ? uniq([...fields, defaultSelect].flat()) : fields,
    };

    const params = {
      where: {
        ...filters,
        ...(locale ? { locale } : {}),
      },
      populate: populateClause,
      ...fieldsQuery,
      pageSize: pagination?.pageSize || limit || PAGE_SIZE,
      page: pagination?.page || (skip ? Math.floor(skip / limit) : 1) || 1,
    };

    const { results: entries, pagination: resultPaginationData } =
      await getCommentRepository(strapi).findWithCount(params);

    const entriesWithThreads = await Promise.all(
      entries.map(async (_) => {
        const {
          results,
          pagination: { total },
        } = await getCommentRepository(strapi).findWithCount({
          where: {
            threadOf: _.id,
          },
        });
        return {
          id: _.id,
          itemsInTread: total,
          firstThreadItemId: first(results)?.id,
        };
      })
    );
    const relatedEntities = omit.includes('related')
      ? []
      : relatedEntity !== null
        ? [relatedEntity]
        : await this.findRelatedEntitiesFor([...entries]);
    const hasRelatedEntitiesToMap = relatedEntities.filter((_: RelatedEntity) => _).length > 0;

    const result = entries.map((_) => {
      const threadedItem = entriesWithThreads.find((item) => item.id === _.id);
      const parsedThreadOf =
        'threadOf' in filters
          ? isString(filters.threadOf)
            ? parseInt(filters.threadOf)
            : filters.threadOf
          : null;

      let authorUserPopulate = {};
      if (isObject(populate?.authorUser)) {
        authorUserPopulate =
          'populate' in populate.authorUser
            ? populate.authorUser.populate
            : populateClause.authorUser;
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
        authorUserPopulate
      );
    });

    return {
      data: hasRelatedEntitiesToMap
        ? result.map((_) => this.mergeRelatedEntityTo(_, relatedEntities))
        : result,
      pagination: resultPaginationData,
    };
  },

  async getCommentsChildren(
    {
      filters,
      populate,
      sort,
      fields,
      isAdmin = false,
      omit = [],
      locale,
      limit,
    }: clientValidator.FindAllInHierarchyValidatorSchema,
    entry: Comment | CommentWithRelated,
    relatedEntity?: any,
    dropBlockedThreads = false,
    blockNestedThreads = false
  ) {
    if (!entry.gotThread) {
      return {
        ...entry,
        threadOf: undefined,
        related: undefined,
        blockedThread: blockNestedThreads || entry.blockedThread,
        children: [],
      };
    }

    const children = await this.findAllFlat(
      {
        filters: {
          ...filters,
          threadOf: { $eq: entry.id.toString() },
        },
        populate,
        sort,
        fields,
        isAdmin,
        omit,
        locale,
        limit: Number.MAX_SAFE_INTEGER,
      },
      relatedEntity
    );
    const allChildren =
      entry.blockedThread && dropBlockedThreads
        ? []
        : await Promise.all(
            children.data.map((child) =>
              this.getCommentsChildren(
                {
                  filters,
                  populate,
                  sort,
                  fields,
                  isAdmin,
                  omit,
                  locale,
                  limit,
                },
                child,
                relatedEntity,
                dropBlockedThreads
              )
            )
          );

    return {
      ...entry,
      threadOf: undefined,
      related: undefined,
      blockedThread: blockNestedThreads || entry.blockedThread,
      children: allChildren,
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
      limit,
      pagination,
    }: clientValidator.FindAllInHierarchyValidatorSchema,
    relatedEntity?: any
  ) {
    const rootEntries = await this.findAllFlat(
      {
        filters: {
          threadOf: startingFromId ? { $eq: startingFromId.toString() } : { $null: true },
          ...filters,
        },
        pagination,
        populate,
        sort,
        fields,
        isAdmin,
        omit,
        locale,
        limit,
      },
      relatedEntity
    );

    const rootEntriesWithChildren = await Promise.all(
      rootEntries?.data.map((entry) =>
        this.getCommentsChildren(
          {
            filters,
            populate,
            sort,
            fields,
            isAdmin,
            omit,
            locale,
            limit,
          },
          entry,
          relatedEntity,
          dropBlockedThreads
        )
      )
    );

    return rootEntriesWithChildren;
  },

  // Find single comment
  async findOne(criteria: Partial<Params['where']>) {
    const entity = await getCommentRepository(strapi).findOne({
      where: criteria,
      populate: {
        reports: true,
        authorUser: { populate: ['avatar'] },
      },
    });
    if (!entity) {
      throw new PluginError(400, 'Comment does not exist. Check your payload please.');
    }
    const doNotPopulateAuthor: Array<string> = await this.getConfig(
      CONFIG_PARAMS.AUTHOR_BLOCKED_PROPS,
      []
    );
    const item = this.sanitizeCommentEntity(entity, doNotPopulateAuthor);
    return filterOurResolvedReports(item);
  },

  async findMany(criteria: Params) {
    return getCommentRepository(strapi).findMany(criteria);
  },

  async updateComment(criteria: Partial<Params['where']>, data: Partial<Comment>) {
    return getCommentRepository(strapi).update({ where: criteria, data });
  },

  async changeBlockedComment(id: Id, forceStatus?: boolean) {
    const entry = await this.findOne({ id });
    return this.updateComment(
      { id },
      { blocked: !isNil(forceStatus) ? forceStatus : !entry.blocked },
    );
  },

  async changeBlockedCommentThread(id: Id, forceStatus?: boolean) {
    const entry = await this.findOne({ id });
    const status = !isNil(forceStatus) ? forceStatus : !entry.blocked;
    const updatedEntry = await this.updateComment(
      { id },
      { blocked: status, blockedThread: status },
    );
    await this.modifiedNestedNestedComments(id, 'blockedThread', status);
    return this.sanitizeCommentEntity(updatedEntry, []);
  },

  async approveComment(id: Id) {
    const entity = await getCommentRepository(strapi).update({
      where: { id },
      data: { approvalStatus: APPROVAL_STATUS.APPROVED },
    });
    if (!entity) {
      throw new PluginError(404, 'Not found');
    }
    return this.sanitizeCommentEntity(entity, []);
  },

  async rejectComment(id: Id) {
    const entity = await getCommentRepository(strapi).update({
      where: { id },
      data: { approvalStatus: APPROVAL_STATUS.REJECTED },
    });
    if (!entity) {
      throw new PluginError(404, 'Not found');
    }
    return this.sanitizeCommentEntity(entity, []);
  },

  async resolveAbuseReport(commentId: Id, reportId: Id) {
    return getReportCommentRepository(strapi).update({
      where: {
        id: reportId,
        related: commentId,
      },
      data: {
        resolved: true,
      },
    });
  },

  async resolveCommentMultipleAbuseReports(commentId: Id, reportIds: number[]) {
    const reports = await getReportCommentRepository(strapi).findMany({
      where: {
        id: reportIds,
        related: commentId,
      },
      populate: ['related'],
    });

    if (reports.length !== reportIds.length) {
      throw new PluginError(
        400,
        'At least one of selected reports got invalid comment entity relation. Try again.',
      );
    }
    return getReportCommentRepository(strapi).updateMany({
      where: {
        id: reportIds,
      },
      data: {
        resolved: true,
      },
    });
  },

  async resolveAllAbuseReportsForComment(id: Id) {
    if (!id) {
      throw new PluginError(
        400,
        'There is something wrong with comment Id. Try again.',
      );
    }
    const reports = await getReportCommentRepository(strapi).findMany({
      where: {
        related: id,
        resolved: false,
      },
    });
    if (reports.length === 0) {
      return { count: 0 };
    }
    return getReportCommentRepository(strapi).updateMany({
      where: {
        id: { $in: reports.map((r) => r.id) },
      },
      data: {
        resolved: true,
      },
    });
  },

  async resolveAllAbuseReportsForThread(commentId: number) {
    if (!commentId) {
      throw new PluginError(
        400,
        'There is something wrong with comment Id. Try again.',
      );
    }
    const commentsInThread = await getCommentRepository(strapi).findMany({
      where: {
        threadOf: commentId,
      },
    });
    const relatedCommentIds = commentsInThread.map(({ id }) => id).concat([commentId]);
    const reports = await getReportCommentRepository(strapi).findMany({
      where: {
        related: relatedCommentIds,
        resolved: false,
      },
    });
    if (reports.length === 0) {
      return { count: 0 };
    }
    return getReportCommentRepository(strapi).updateMany({
      where: {
        id: { $in: reports.map((r) => r.id) },
      },
      data: {
        resolved: true,
      },
    });
  },

  async resolveMultipleAbuseReports(reportIds: number[]) {
    return getReportCommentRepository(strapi).updateMany({
      where: {
        id: { $in: reportIds },
      },
      data: {
        resolved: true,
      },
    });
  },

  // Find all for author
  async findAllPerAuthor(
    {
      filters = {},
      populate = {},
      pagination,
      sort,
      omit = [],
      fields,
      isAdmin = false,
      authorId,
      limit,
      locale,
      skip,
    }: clientValidator.FindAllPerAuthorValidatorSchema,
    isStrapiAuthor: boolean = false
  ) {
    if (isNil(authorId)) {
      return {
        data: [],
      };
    }

    const authorQuery = isStrapiAuthor
      ? {
          authorUser: {
            id: authorId,
          },
        }
      : {
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
      omit,
      limit,
      skip,
      locale,
    });

    return {
      ...response,
      data: response.data.map(({ author, ...rest }) => rest),
    };
  },

  // Find all related entiries
  async findRelatedEntitiesFor(entries: Array<Comment>): Promise<Array<CommentRelated>> {
    const data = entries.reduce(
      (
        acc: { [key: string]: { documentIds: Array<string | number>; locale?: Array<string> } },
        curr: Comment
      ) => {
        const [relatedUid, relatedStringId] = getRelatedGroups(curr.related);
        return {
          ...acc,
          [relatedUid]: {
            ...(acc[relatedUid] || {}),
            documentIds: [...(acc[relatedUid]?.documentIds || []), relatedStringId],
            locale: [...(acc[relatedUid]?.locale || []), curr.locale],
          },
        };
      },
      {}
    );

    return Promise.all(
      Object.entries(data).map(async ([relatedUid, { documentIds, locale }]) => {
        return Promise.all(
          documentIds.map((documentId, index) =>
            strapi.documents(relatedUid as ContentTypesUUIDs).findOne({
              documentId: documentId.toString(),
              locale: !isNil(locale[index]) ? locale[index] : undefined,
              status: 'published',
            })
          )
        ).then((relatedEntities) =>
          relatedEntities
            .filter((_) => _)
            .map((_) => ({
              ..._,
              uid: relatedUid,
            }))
        );
      })
    ).then((result) => result.flat(2));
  },

  // Merge related entity with comment
  mergeRelatedEntityTo(
    entity: Comment,
    relatedEntities: Array<CommentRelated> = []
  ): CommentWithRelated {
    return {
      ...entity,
      related: relatedEntities.find((relatedEntity) => {
        if (relatedEntity.locale && entity.locale) {
          return (
            entity.related === `${relatedEntity.uid}:${relatedEntity.documentId}` &&
            entity.locale === relatedEntity.locale
          );
        }
        return entity.related === `${relatedEntity.uid}:${relatedEntity.documentId}`;
      }),
    };
  },
  // TODO: we need to add deepLimit to the function to prevent infinite loops
  async modifiedNestedNestedComments<T extends keyof Comment>(
    id: Id,
    fieldName: T,
    value: Comment[T],
    deepLimit: number = 10
  ): Promise<boolean> {
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
            this.modifiedNestedNestedComments(item.id, fieldName, value, deepLimit - 1)
          )
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
        throw new PluginError(400, 'Bad language used! Please polite your comment...', {
          content: {
            original: content,
            filtered: content && replaceProfanities({ testString: content }),
          },
        });
      }
    }
    return content;
  },

  async perRemove(related: string, locale?: string) {
    const defaultLocale =
      (await strapi.plugin('i18n')?.service('locales').getDefaultLocale()) || null;
    return getCommentRepository(strapi).updateMany({
      where: {
        related,
        $or: [{ locale }, defaultLocale === locale ? { locale: { $eq: null } } : null].filter(
          Boolean
        ),
      },
      data: {
        removed: true,
      },
    });
  },

  sanitizeCommentContent(content: string) {
    return sanitizeHtml(content, {
      allowedTags: [
        'p',
        'br',
        'hr',
        'div',
        'span',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'strong',
        'i',
        'em',
        'del',
        'blockquote',
        'ul',
        'ol',
        'li',
        'pre',
        'code',
        'a',
        'img',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'video',
        'audio',
        'source',
      ],
      allowedAttributes: {
        '*': ['href', 'align', 'alt', 'center', 'width', 'height', 'type', 'controls', 'target'],
        img: ['src', 'alt'],
        source: ['src', 'type'],
        video: ['src', 'controls', 'width', 'height'],
        audio: ['src', 'controls'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
    });
  },

  registerLifecycleHook(/*{ callback, contentTypeName, hookName }*/) {},

  async runLifecycleHook(/*{ contentTypeName, event, hookName }*/) {},
});

type CommonService = ReturnType<typeof commonService>;
export default commonService;
