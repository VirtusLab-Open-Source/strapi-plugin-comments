import { isArray, isNil } from 'lodash';
import { StrapiContext } from '../@types';
import { CONFIG_PARAMS } from '../utils/constants';
import { getPluginService } from '../utils/getPluginService';

export type ReactionsCount = Record<string, number>;
export type ReactionsMeta = Record<string, ReactionsCount>;

const REACTION_CONTENT_TYPE_UID = 'plugin::reactions.reaction';
const COMMENT_RELATED_UID_PREFIX = 'plugin::comments.comment:';

const buildCommentRelatedId = (documentId: string) =>
  `${COMMENT_RELATED_UID_PREFIX}${documentId}`;

const parseCommentDocumentId = (relatedUid: string) =>
  relatedUid.startsWith(COMMENT_RELATED_UID_PREFIX)
    ? relatedUid.slice(COMMENT_RELATED_UID_PREFIX.length)
    : null;

const emptyCounts = (): ReactionsCount => ({});

export const reactionsService = ({ strapi }: StrapiContext) => ({
  getCommonService() {
    return getPluginService(strapi, 'common');
  },

  isPluginInstalled() {
    return !!strapi.plugin('reactions');
  },

  async isEnabled() {
    if (!this.isPluginInstalled()) {
      return false;
    }

    const enabled = await this.getCommonService().getConfig(
      CONFIG_PARAMS.REACTIONS_ENABLED,
      false,
    );

    return Boolean(enabled);
  },

  async getCountsForComments(
    documentIds: Array<string | null | undefined>,
    locale?: string,
  ) {
    if (!(await this.isEnabled())) {
      return {};
    }

    const uniqueDocumentIds = [...new Set(documentIds.filter(Boolean))] as string[];

    if (!uniqueDocumentIds.length) {
      return {};
    }

    const entities = await strapi.documents(REACTION_CONTENT_TYPE_UID).findMany({
      filters: {
        relatedUid: {
          $in: uniqueDocumentIds.map(buildCommentRelatedId),
        },
      },
      populate: {
        kind: {
          fields: ['slug'],
        },
      },
      locale,
    });

    if (isNil(entities)) {
      return {};
    }

    const reactions = !isArray(entities) ? [entities] : entities;

    return reactions.reduce<ReactionsMeta>((acc, entity) => {
      const commentDocumentId = parseCommentDocumentId(entity.relatedUid);

      if (!commentDocumentId || !entity.kind?.slug) {
        return acc;
      }

      const currentCounts = acc[commentDocumentId] || emptyCounts();
      const slug = entity.kind.slug;

      return {
        ...acc,
        [commentDocumentId]: {
          ...currentCounts,
          [slug]: (currentCounts[slug] || 0) + 1,
        },
      };
    }, {});
  },

  async removeForComments(
    documentIds: Array<string | null | undefined>,
    locale?: string,
  ) {
    if (!(await this.isEnabled())) {
      return;
    }

    const uniqueDocumentIds = [...new Set(documentIds.filter(Boolean))] as string[];

    if (!uniqueDocumentIds.length) {
      return;
    }

    const entities = await strapi.documents(REACTION_CONTENT_TYPE_UID).findMany({
      filters: {
        relatedUid: {
          $in: uniqueDocumentIds.map(buildCommentRelatedId),
        },
      },
      locale,
    });

    if (isNil(entities)) {
      return;
    }

    const reactions = !isArray(entities) ? [entities] : entities;

    await Promise.all(
      reactions.map(({ documentId }) =>
        strapi.documents(REACTION_CONTENT_TYPE_UID).delete({
          documentId,
          locale,
        }),
      ),
    );
  },
});

export type ReactionsService = ReturnType<typeof reactionsService>;
export default reactionsService;
