const PluginError = require('./../../utils/error');
const { REGEX } = require('./../../utils/constants')
const { first, isObject, isArray, isEmpty } = require('lodash');

const buildNestedStructure = (
  entities,
  id = null,
  field = 'threadOf',
  dropBlockedThreads = false,
  blockNestedThreads = false,
) =>
  entities
    .filter(entity => {
        // mongo by default not return `null` for empty data
        if (entity[field] === null && id === null) {
            return true;
        }
        let data = entity[field];
        if (data && typeof id === 'string') {
            data = data.toString();
        }
        return (data && data === id) || (isObject(entity[field]) && (entity[field].id === id));
    })
    .map(entity => ({
        ...entity,
        [field]: undefined,
        related: undefined,
        blockedThread: blockNestedThreads || entity.blockedThread,
        children: entity.blockedThread && dropBlockedThreads ? [] : buildNestedStructure(entities, entity.id, field,
        dropBlockedThreads, entity.blockedThread),
    }));

module.exports = {
    isEqualEntity: (existing, data, user) => {
        const { author: existingAuthor } = existing;
        const { author } = data;

        // Disallow approval status change by Client
        if (data.approvalStatus && (existing.approvalStatus !== data.approvalStatus)) {
            return false;
        }

        // Make sure that author is exact the same
        if (user) {
            const existingUserId = existingAuthor?.id || existingAuthor;
            const receivedUserId = user?.id || author?.id;
            return receivedUserId && (existingUserId === receivedUserId);
        }
        return existingAuthor.id === author?.id;
    },

    getRelatedGroups: related => related.split(REGEX.relatedUid).filter(s => s && s.length > 0),

    getModelUid: name => {
        return strapi
            .plugin('comments')
            .contentTypes[name]?.uid;
    },

    filterOurResolvedReports: item => (item ? {
        ...item,
        reports: (item.reports || []).filter(report => !report.resolved),
    } : item),

    convertContentTypeNameToSlug: str => {
        const plainConversion = str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
        return first(plainConversion) === '-' ? plainConversion.slice(1, plainConversion.length) : plainConversion;
    },

    buildNestedStructure,

    buildAuthorModel: (item) => {
        const { authorUser, authorId, authorName, authorEmail, authorAvatar, authorUrl, ...rest } = item;
        let author = {};
        if (authorUser) {
            author = {
                id: authorUser.id,
                name: authorUser.username,
                email: authorUser.email,
                avatar: authorUser.avatar,
            };
        } else if(authorId) {
            author = {
                id: authorId,
                name: authorName,
                email: authorEmail,
                avatar: authorAvatar,
                url: authorUrl,
            };
        }
        return {
            ...rest,
            author: isEmpty(author) ? undefined : author,
        };
    },

    buildConfigQueryProp(prop) {
        let queryProp = prop;
        if (prop && isArray(prop)) {
            queryProp = prop.join('.');
        }
        return queryProp;
    },

    resolveUserContextError: user => {
        if (user) {
            throw new PluginError(401, 'Not authenticated');
        } else {
            throw new PluginError(403, 'Not authorized');
        }
    },
};

