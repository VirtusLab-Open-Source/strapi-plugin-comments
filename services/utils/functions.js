const _ = require('lodash');
const BadWordsFilter = require('bad-words');
const PluginError = require('./error');

module.exports = {
    isEqualEntity: (existing, data) => {
        const { authorUser, authorId } = existing;
        if (authorUser) {
            return authorUser.id === data.authorUser;
        }
        return authorId === data.authorId;
    },

    extractMeta: plugins => {
        const { comments: plugin } = plugins;
        const { comments: service } = plugin.services;
        const { comment: model} = plugin.models;
        return {
            model,
            service,
            plugin,
            pluginName: plugin.package.strapi.name.toLowerCase()
        };
    },

    buildNestedStructure: (entities, id = null, field = 'parent', dropBlockedThreads = false, blockNestedThreads = false) =>
        entities
            .filter(entity => (entity[field] === id) || (_.isObject(entity[field]) && (entity[field].id === id)))
            .map(entity => ({ 
                ...entity, 
                [field]: undefined, 
                related: undefined,
                blockedThread: blockNestedThreads || entity.blockedThread,
                children: entity.blockedThread && dropBlockedThreads ? [] : buildNestedStructure(entities, entity.id, field, dropBlockedThreads, entity.blockedThread),
            })),

    filterOurResolvedReports: item => (item ? {
        ...item,
        reports: (item.reports || []).filter(report => !report.resolved),
    } : item),

    checkBadWords: content => {
        const filter = new BadWordsFilter();
        if (content && filter.isProfane(content)) {
            throw new PluginError(400, 'Bad language used! Please polite your comment...', {
                content: {
                    original: content,
                    filtered: content && filter.clean(content),
                },
            });
        }
        return content;
    }
};