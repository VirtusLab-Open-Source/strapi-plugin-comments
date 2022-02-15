'use strict';

const config = require('../config');
const { getPluginService } = require('./../utils/functions');
const { isNil, isEmpty, isNumber, parseInt } = require('lodash');
const PluginError = require('./../utils/error');
const {
    isEqualEntity,
    getModelUid,
    getRelatedGroups,
    resolveUserContextError,
} = require('./utils/functions');
const { APPROVAL_STATUS, REGEX, CONFIG_PARAMS } = require('./../utils/constants')

/**
 * Comments Plugin - Client services
 */

module.exports = ({ strapi }) => ({

    getCommonService() {
        return getPluginService('common');
    },

    // Create a comment
    async create(relation, data, user = undefined) {
        const { content, threadOf } = data;
        const singleRelationFulfilled = relation && REGEX.relatedUid.test(relation);
        
        if(!singleRelationFulfilled) {
            throw new PluginError(400, `Field "related" got incorrect format, use format like "api::<collection name>.<content type name>:<entity id>"`);
        }

        const [ uid, relatedId ] = await this.getCommonService().parseRelationString(relation);

        const relatedEntity = await strapi.db.query(uid).findOne(relatedId);
        if (!relatedEntity) {
            throw new PluginError(400, `Relation for field "related" does not exist. Check your payload please.`);
        }

        const approvalFlow = await this.getCommonService().getConfig(CONFIG_PARAMS.APPROVAL_FLOW, []);
        const isApprovalFlowEnabled = approvalFlow.includes(uid) ||
            relatedEntity.requireCommentsApproval;

        const linkToThread = !isNil(threadOf) ? await this.getCommonService().findOne({
            id: threadOf,
            related: relation,
        }) : true;
        const validContext = this.getCommonService().isValidUserContext(user);

        if (!linkToThread) {
            throw new PluginError(400, 'Thread does not exist');
        }

        if (!validContext) {
            throw resolveUserContextError(user);
        }

        if (await this.getCommonService().checkBadWords(content) && singleRelationFulfilled) {
            const { author = {}, ...rest } = data;
            let authorData = {};
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

            const entity = await strapi.db.query(getModelUid('comment')).create({
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
    async update(id, relation, data, user = undefined) {
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
                const entity = await strapi.db.query(getModelUid('comment')).update({
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
	async reportAbuse(id, relation, payload, user = undefined) {
        if (!this.getCommonService().isValidUserContext(user)) {
            throw resolveUserContextError(user);
        }

        await this.getCommonService().parseRelationString(relation);

		const reportAgainstEntity = await this.getCommonService().findOne({
            id, 
            related: relation,
        });
		if (reportAgainstEntity) {
            const entity = await strapi.db.query(getModelUid('comment-report')).create({
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

    async markAsRemoved(id, relation, authorId, user = undefined){
        if (!this.getCommonService().isValidUserContext(user)) {
            throw resolveUserContextError(user);
        }

        const author = user?.id || authorId;

        if (!author) {
            throw new PluginError(403, `You're not allowed to take an action on that entity. Make sure that you've provided proper "authorId" or authenticated your request properly.`);
        }

        await this.getCommonService().parseRelationString(relation);

        let entity;
        try {
            const byAuthor = user?.id ? {
                authorUser: author
            } : {
                authorId: author
            }
            entity = await this.getCommonService().findOne({
                id,
                related: relation,
                ...byAuthor,
            });
        } catch(e) {
            throw new PluginError(404, `Entity does not exist or you're not allowed to take an action on it`);
        }

        const removedEntity = await strapi.db.query(getModelUid('comment'))
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
    },

	async sendAbuseReportEmail(reason, content) {
		const rolesToBeNotified = await this.getCommonService().getConfig(CONFIG_PARAMS.MODERATOR_ROLES) || ['strapi-super-admin'];

        const adminUserModel = strapi.db.query('admin::user');
		const emails = await adminUserModel.findMany({
            where: { 
                roles: { code: rolesToBeNotified },
            },
        }).then(items => items.map(_ => _.email));

		const superAdmin = await strapi.db.query('admin::user')
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

    async markAsRemovedNested(id, status){
        return this.getCommonService().modifiedNestedNestedComments(id, 'removed', status);
    },
});
