import { FC } from 'react';
import { get, isEmpty } from 'lodash';
import { Data } from '@strapi/strapi';
import { Box, Divider, Grid, Typography } from '@strapi/design-system';
import { useQuery } from '@tanstack/react-query';
import { useFetchClient } from '@strapi/strapi/admin';

import { ReactionCounter } from '../ReactionCounter';
import { getMessage } from '../../utils';
import {
  fetchReactionCounts,
  fetchReactionTypes,
  ReactionType,
} from '../../utils/reactionsIntegration';

type CommentReactionsSummaryProps = {
  documentId?: Data.DocumentID;
  locale?: string | null;
};

export const CommentReactionsSummary: FC<CommentReactionsSummaryProps> = ({
  documentId,
  locale,
}) => {
  console.log('CommentReactionsSummary', documentId, locale);
  const fetchClient = useFetchClient();

  const typesQuery = useQuery({
    queryKey: ['comments-reactions-config'],
    queryFn: () => fetchReactionTypes(fetchClient),
    retry: false,
  });

  const countsQuery = useQuery({
    queryKey: ['comments-reactions-counts', documentId, locale],
    queryFn: () => fetchReactionCounts(documentId!, locale || undefined, fetchClient),
    enabled: Boolean(documentId),
    retry: false,
  });

  if (typesQuery.isError || countsQuery.isError) {
    return null;
  }

  const isLoading = typesQuery.isPending || countsQuery.isPending;
  const types = typesQuery.data || [];
  const reactionsCount = countsQuery.data || {};
  const isNotRenderable = isLoading || isEmpty(reactionsCount) || isEmpty(types) || !documentId;

  if (isNotRenderable) {
    return null;
  }

  return (
    <Box marginBottom={4}>
      <Typography variant="sigma" textColor="neutral600" id="comment-reactions">
        {getMessage('page.details.panel.reactions', 'Reactions')}
      </Typography>
      <Box paddingTop={2} paddingBottom={4}>
        <Divider />
      </Box>
      <Grid.Root gap={4}>
        {types.map(({ name, slug, icon, emoji }: ReactionType) => (
          <Grid.Item key={`reaction-type-${slug}`} col={5} s={6} xs={12}>
            <ReactionCounter
              name={name}
              icon={icon}
              emoji={emoji}
              count={get(reactionsCount, slug)}
            />
          </Grid.Item>
        ))}
      </Grid.Root>
    </Box>
  );
};
