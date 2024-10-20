import { Params } from '@strapi/database/dist/entity-manager/types';
import { UID } from '@strapi/strapi';
import { get, isNil, isNumber, isObject, omit as filterItem, parseInt } from 'lodash';
import { isProfane, replaceProfanities } from 'no-profanity';
import { StrapiStore } from 'strapi-typed';
import { CommentModelKeys, CommentsPluginConfig, Effect, ToBeFixed } from '../@types';
import { Comment, Id, StrapiContext } from '../@types-v5';
import { getCommentRepository, getOrderBy } from '../repositories';
import { CONFIG_PARAMS } from '../utils/constants';
import PluginError from '../utils/PluginError';
import { ContentType, LifeCycleHookName } from '../utils/types';
import { FindAllFlatCommentsValidatorSchema } from '../validators';
import { buildAuthorModel, buildConfigQueryProp, filterOurResolvedReports, getRelatedGroups } from './utils/functions';


/**
 * Comments Plugin - common services
 */

const PAGE_SIZE = 10;
const REQUIRED_FIELDS = ['id'];

type LifecycleHookRecord = Partial<Record<LifeCycleHookName, Array<Effect<ToBeFixed>>>>;

const lifecycleHookListeners: Record<ContentType, LifecycleHookRecord> = {
  comment: {},
  'comment-report': {},
};

type ParsedRelation = {
  uid: UID.ContentType;
  relatedId: string | number;
};


const commonService = ({ strapi }: StrapiContext) => ({
  async getConfig<T extends keyof CommentsPluginConfig>(
    prop?: T,
    defaultValue?: CommentsPluginConfig[T],
    useLocal = true,
  ): Promise<T extends string ? CommentsPluginConfig[T] : CommentsPluginConfig> {
    const pluginStore = await this.getPluginStore();
    const config = await pluginStore.get({
      key: 'config',
    });
    if (prop && config && !useLocal) {
      return get(config, prop, defaultValue) as T extends string
        ? CommentsPluginConfig[T]
        : CommentsPluginConfig;
    }
    if (useLocal) {
      return this.getLocalConfig(prop, defaultValue);
    }
    return config as any;
  },

  async getPluginStore(): Promise<StrapiStore> {
    return strapi.store({ type: 'plugin', name: 'comments' }) as StrapiStore;
  },

  getLocalConfig<T>(prop?: string, defaultValue?: any): T {
    const queryProp: string = buildConfigQueryProp(prop);
    const result: T = strapi.config.get(
      `plugin.comments${queryProp ? '.' + queryProp : ''}`,
    );
    return isNil(result) ? defaultValue : result;
  },
  sanitizeCommentEntity(entity: Comment, blockedAuthors: string[], omitProps: Array<keyof Comment> = [], populate: any = {}): Comment {
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
  parseRelationString(relation: `${string}::${string}`): ParsedRelation {
    const [uid, relatedStringId] = getRelatedGroups(relation);
    const parsedRelatedId = parseInt(relatedStringId, 10);
    const relatedId = isNumber(parsedRelatedId) ? parsedRelatedId : relatedStringId;
    return { uid: uid as UID.ContentType, relatedId };
  },
  isValidUserContext<T extends { id?: string | number }>(user?: T): boolean {
    return user ? !!user.id : true;
  },

  // Find comments in the flat structure
  async findAllFlat({
    fields,
    relation,
    limit,
    skip,
    sort,
    filter,
    populate,
    omit: baseOmit = [],
    isAdmin = false,
  }: FindAllFlatCommentsValidatorSchema) {
    const omit = baseOmit.filter((field) => !REQUIRED_FIELDS.includes(field));
    const defaultSelect: Array<CommentModelKeys> = (["id", "related"] as const).filter((field) => !omit.includes(field));

    const populateClause: FindAllFlatCommentsValidatorSchema['populate'] = {
      authorUser: true,
      ...(isObject(populate) ? populate : {}),
    };
    const doNotPopulateAuthor = isAdmin ? [] : await this.getConfig(CONFIG_PARAMS.AUTHOR_BLOCKED_PROPS, []);
    const [operator, direction] = getOrderBy(sort);

  },

  // Find comments and create relations tree structure
  async findAllInHierarchy(criteria: any, relatedEntity: any) {
    return []
  },

  // Find single comment
  async findOne<T extends Comment = Comment>(criteria: Partial<Params['where']>) {
    const entity = await getCommentRepository(strapi).findOne<T>({
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

  async findMany<T extends Comment>(criteria: Params): Promise<T[]> {
    return getCommentRepository(strapi).findMany(criteria);
  },

  async updateComment(criteria: Partial<Params['where']>, data: Partial<Comment>) {
    return getCommentRepository(strapi).update({ where: criteria, data });
  },

  // Find all for author
  async findAllPerAuthor() {
  },

  // Find all related entiries
  async findRelatedEntitiesFor() {
  },

  // Merge related entity with comment
  mergeRelatedEntityTo() {
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