'use strict';

const config = require('../config');
const { getPluginService } = require('./../utils/functions');
const { isNil, isEmpty } = require('lodash');
const PluginError = require('./../utils/error');
const {
    isEqualEntity,
    getModelUid,
    getRelatedGroups,
    checkBadWords,
    isValidUserContext,
    resolveUserContextError,
} = require('./utils/functions');
const { APPROVAL_STATUS, REGEX } = require('./../utils/constants')

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

        const [ uid, relatedStringId ] = getRelatedGroups(relation);
        const relatedId = parseInt(relatedStringId, 10);

        const relatedEntity = await strapi.db.query(uid).findOne(relatedId);
        if (!relatedEntity) {
            throw new PluginError(400, `Relation for field "related" does not exist. Check your payload please.`);
        }

        const isApprovalFlowEnabled = this.getCommonService().getConfig('approvalFlow', []).includes(uid) ||
            relatedEntity.requireCommentsApproval;

        const linkToThread = !isNil(threadOf) ? !!await this.getCommonService().findOne({
            id: threadOf,
            related: relation,
        }) : true;
        const validContext = isValidUserContext(user);

        if (!linkToThread) {
            throw new PluginError(400, 'Thread does not exist');
        }

        if (!validContext) {
            throw resolveUserContextError(user);
        }

        if (checkBadWords(content) && singleRelationFulfilled) {
            const { author, authorUser, ...rest } = data;
            let authorData = {};
            if (validContext && user) {
                authorData = {
                    authorUser: user?.id || authorUser,
                };
            } else if (authorUser) {
                authorData = {
                    authorUser,
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
            
            if (!isEmpty(authorData) && !authorData.authorId) {
                throw new PluginError(400, 'Object: "author" is invalid. Check your payload');
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
                }
            });
            return this.getCommonService().sanitizeCommentEntity(entity);
        }
        throw new PluginError(400, 'No content received');
    },

    // Update a comment
    async update(id, relation, data, user) {
        const { content, related } = data;

        const singleRelationFulfilled = related && REGEX.relatedUid.test(related)

        if (relation !== related) {
            throw new PluginError(400, `Insonsistent relation uid`);
        }

        if(!singleRelationFulfilled) {
            throw new PluginError(400, `Field "related" got incorrect format, use format like "api::<collection name>.<content type name>:<entity id>"`);
        }

        const existingEntity = await this.getCommonService().findOne({
            id,
            related,
        });
        const validContext = isValidUserContext(user);

        if (!validContext) {
            throw resolveUserContextError(user);
        }

        if (isEqualEntity(existingEntity, data, user) && content) {
            if (checkBadWords(content)) {
                const entity = await strapi.db.query(getModelUid('comment')).update({
                    where: { id },
                    data: { content },
                });
                return this.getCommonService().sanitizeCommentEntity(entity);
            }
        }
        throw new PluginError(409, 'Action on that entity is not allowed');
    },

    // Report abuse in comment
	async reportAbuse(id, relation, payload, user) {
        if (!isValidUserContext(user)) {
            throw resolveUserContextError(user);
        }
		const existingEntity = await this.getCommonService().findOne({
            id, 
            related: relation,
        });
		if (existingEntity) {
            const entity = await strapi.db.query(getModelUid('comment-report')).create({
                data: {
                    ...payload,
                    resolved: false,
                    related: id,
                }
            });
			if (entity) {
                try {
                    await this.sendAbuseReportEmail(entity.reason, entity.content); // Could also add some info about relation
                } catch (err) {
                    return entity;
                }
            } else {
                throw new PluginError(500, 'Report cannot be created');
            }
            return entity;
        }
        throw new PluginError(409, 'Action on that entity is not allowed');
    },

    async markAsRemoved(relationId, commentId, authorId){
        const entity = await this.getCommonService().findOne({
          id: commentId,
          related: relationId,
          $or: [{ authorUser: authorId }, { authorId }],
        });
        if (!entity){
            throw new PluginError(404, 'Entity not exist');
        }

        return strapi.db.query(getModelUid('comment'))
          .update({
              where: { 
                  id: commentId, 
                  related: relationId
                },
                data: { removed: true }
          })
          .then(({ id }) => this.markAsRemovedNested(id, true))
          .then(() => ({ id: commentId }));
    },

	async sendAbuseReportEmail(reason, content) {
		const rolesToBeNotified = this.getCommonService().getConfig('moderatorRoles') || ['strapi-super-admin'];

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

    markAsRemovedNested(id, status){
        return this.getCommonService().modifiedNestedNestedComments(id, 'removed', status);
    },
});
