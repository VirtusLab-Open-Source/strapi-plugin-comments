
import { StrapiContext, Id, StrapiAdminUser, StrapiUser } from 'strapi-typed';
import { Comment, CommentAuthorPartial, CommentReport, RelatedEntity, IServiceClient, IServiceCommon, ToBeFixed } from '../../types';

import { getPluginService } from './../utils/functions';
import { isNil, isEmpty } from 'lodash';
import PluginError from './../utils/error';
import {
    isEqualEntity,
    getModelUid,
    resolveUserContextError,
} from './utils/functions';
import { APPROVAL_STATUS, REGEX, CONFIG_PARAMS } from './../utils/constants';

/**
 * Comments Plugin - Client services
 */

export = ({ strapi }: StrapiContext): IServiceClient => ({

    getCommonService(): IServiceCommon {
        return getPluginService('common');
    },

    // Create a comment
    async create(this: IServiceClient, relation: string, data: ToBeFixed, user: StrapiUser = undefined): Promise<Comment> {
        const { content, threadOf } = data;
        const singleRelationFulfilled = relation && REGEX.relatedUid.test(relation);
        
        if(!singleRelationFulfilled) {
            throw new PluginError(400, `Field "related" got incorrect format, use format like "api::<collection name>.<content type name>:<entity id>"`);
        }

        const [ uid, relatedId ] = await this.getCommonService().parseRelationString(relation);

        const relatedEntity = await strapi.db.query<RelatedEntity>(uid).findOne(relatedId);
        if (!relatedEntity) {
            throw new PluginError(400, `Relation for field "related" does not exist. Check your payload please.`);
        }

        const approvalFlow: Array<string> = await this.getCommonService().getConfig<Array<string>>(CONFIG_PARAMS.APPROVAL_FLOW, []);
        const isApprovalFlowEnabled = approvalFlow.includes(uid) ||
            relatedEntity.requireCommentsApproval;

        const linkToThread = !isNil(threadOf) ? await this.getCommonService().findOne({
            id: threadOf,
            related: relation,
        }) : undefined;
        const validContext = this.getCommonService().isValidUserContext(user);

        if (linkToThread === null) {
            throw new PluginError(400, 'Thread does not exist');
        }

        if (!validContext) {
            throw resolveUserContextError(user);
        }

        if (await this.getCommonService().checkBadWords(content) && singleRelationFulfilled) {
            const { author = {}, ...rest } = data;
            let authorData: CommentAuthorPartial = {};
            if (validContext && user) {
                authorData = {
                    authorUser: user?.id,
                };
            } else {
                if (author.email && !REGEX.email.test(author.email)) {
                    throw new PluginError(400, 'Field: "author.email". Author e-mail is not valid value. Check your payload');
                }

                authorData = {
                    authorId: author.id,
                    authorName: author.name,
                    authorEmail: author.email,
                    authorAvatar: author.avatar,
                };
            }
            
            if (!isEmpty(authorData) && !(authorData.authorId || authorData.authorUser)) {
                throw new PluginError(400, `Not able to recognise author of a comment. Make sure you've provided "author" property in a payload or authenticated your request properly.`);
            }

            if (isApprovalFlowEnabled && 
                (!isNil(data.approvalStatus) && (data.approvalStatus !== APPROVAL_STATUS.PENDING))) {
                throw new PluginError(400, 'Invalid approval status');
            }

            const entity = await strapi.db.query<Comment>(getModelUid('comment')).create({
                data: {
                    ...rest,
                    ...authorData,
                    related: relation,
                    approvalStatus: isApprovalFlowEnabled ? APPROVAL_STATUS.PENDING : null,
                },
                populate: {
                    authorUser: true,
                },
            });
            return this.getCommonService().sanitizeCommentEntity({
                ...entity,
                threadOf: !isNil(threadOf) ? linkToThread : null,
            });
        }
        throw new PluginError(400, 'No content received');
    },

    // Update a comment
    async update(this: IServiceClient, id: Id, relation: string, data: ToBeFixed, user: StrapiUser = undefined): Promise<Comment> {
        const { content } = data;

        const singleRelationFulfilled = relation && REGEX.relatedUid.test(relation)

        if(!singleRelationFulfilled) {
            throw new PluginError(400, `Request property "relation" got incorrect format, use format like "api::<collection name>.<content type name>:<entity id>"`);
        }

        await this.getCommonService().parseRelationString(relation);

        const existingEntity = await this.getCommonService().findOne({
            id,
            related: relation,
        });

        const validContext = this.getCommonService().isValidUserContext(user);

        if (!validContext) {
            throw resolveUserContextError(user);
        }

        if (isEqualEntity(existingEntity, data, user) && content) {
            if (await this.getCommonService().checkBadWords(content)) {
                const entity = await strapi.db.query<Comment>(getModelUid('comment')).update({
                    where: { id },
                    data: { content },
                    populate: { threadOf: true, authorUser: true },
                });
                return this.getCommonService().sanitizeCommentEntity(entity);
            }
        }
        throw new PluginError(403, `You're not allowed to take an action on that entity. Make sure you've provided "author" property in a payload or authenticated your request properly.`);
    },

    // Report abuse in comment
	async reportAbuse(this: IServiceClient, id: Id, relation: string, payload:  ToBeFixed, user: StrapiUser = undefined): Promise<CommentReport> {
        if (!this.getCommonService().isValidUserContext(user)) {
            throw resolveUserContextError(user);
        }

        await this.getCommonService().parseRelationString(relation);

		const reportAgainstEntity = await this.getCommonService().findOne({
            id, 
            related: relation,
        });
		if (reportAgainstEntity) {
            const entity = await strapi.db.query<CommentReport>(getModelUid('comment-report')).create({
                data: {
                    ...payload,
                    resolved: false,
                    related: id,
                }
            });
			if (entity) {
                const response = {
                    ...entity,
                    related: reportAgainstEntity,
                };
                try {
                    await this.sendAbuseReportEmail(entity.reason, entity.content); // Could also add some info about relation
                    return response
                } catch (err) {
                    return response;
                }
            } else {
                throw new PluginError(500, 'Report cannot be created');
            }
        }
        throw new PluginError(403, `You're not allowed to take an action on that entity. Make sure that comment exist or you've authenticated your request properly.`);
    },

    async markAsRemoved(this: IServiceClient, id: Id, relation: string, authorId: Id, user: StrapiUser = undefined): Promise<Comment> {
        if (!this.getCommonService().isValidUserContext(user)) {
            throw resolveUserContextError(user);
        }

        const author = user?.id || authorId;

        if (!author) {
            throw new PluginError(403, `You're not allowed to take an action on that entity. Make sure that you've provided proper "authorId" or authenticated your request properly.`);
        }

        await this.getCommonService().parseRelationString(relation);

        try {
            const byAuthor = user?.id ? {
                authorUser: author
            } : {
                authorId: author
            }
            const entity = await this.getCommonService().findOne({
                id,
                related: relation,
                ...byAuthor,
            });
            if (entity) {
                const removedEntity = await strapi.db.query<Comment>(getModelUid('comment'))
                .update({
                    where: { 
                        id, 
                        related: relation
                      },
                      data: { removed: true },
                      populate: { threadOf: true, authorUser: true },
                })
      
              await this.markAsRemovedNested(id, true);
      
              return this.getCommonService().sanitizeCommentEntity(removedEntity);
            }
            else {
                throw new PluginError(404, `Entity does not exist or you're not allowed to take an action on it`);
            }
        } catch(e) {
            throw new PluginError(404, `Entity does not exist or you're not allowed to take an action on it`);
        }
    },

	async sendAbuseReportEmail(this: IServiceClient, reason: string, content: string): Promise<void> {
		const rolesToBeNotified: Array<string> = await this.getCommonService().getConfig<Array<string>>(CONFIG_PARAMS.MODERATOR_ROLES) || ['strapi-super-admin'];

        const adminUserModel = strapi.db.query<StrapiAdminUser>('admin::user');
		const emails = await adminUserModel.findMany({
            where: { 
                roles: { code: rolesToBeNotified },
            },
        }).then(items => items.map(_ => _.email));

		const superAdmin = await strapi.db.query<StrapiAdminUser>('admin::user')
            .findOne({
                where: {
                    roles: { code: 'strapi-super-admin' },
                },
            });
		
		if (emails.length > 0) {
            try {
                await strapi.plugin('email').service('email').send({
                    to: emails,
                    from: superAdmin.email,
                    subject: 'New abuse report on comment',
                    text: `
                        There was a new abuse report on your app. 
                        Reason: ${reason}
                        Message: ${content}
                    `,
                });
            } catch(err) {
                strapi.log.error(err);
                throw err;
            }
		}
	},

    async markAsRemovedNested(this: IServiceClient, id: Id, status: boolean): Promise<boolean> {
        return this.getCommonService().modifiedNestedNestedComments(id, 'removed', status);
    },
});
