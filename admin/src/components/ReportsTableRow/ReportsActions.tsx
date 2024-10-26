import { Flex } from '@strapi/design-system';
import { Check } from '@strapi/icons';
import { useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import { Report } from '../../api/schemas';
import { useAPI } from '../../hooks/useAPI';
import { useCommentMutations } from '../../hooks/useCommentMutations';
import { getMessage } from '../../utils';
import { ActionButton } from '../ActionButton';
import { BlockMenu } from './BlockMenu';

type ReportsActionsProps = {
  item: Report;
}
export const ReportsActions: FC<ReportsActionsProps> = ({ item }) => {
  const { resolved } = item;
  const api = useAPI();
  const { reportMutation } = useCommentMutations();
  const queryClient = useQueryClient();
  const onClickResolve = async () => {
    await reportMutation.resolve.mutateAsync({ id: item.related.id, reportId: item.id });
    await queryClient.invalidateQueries({
      exact: false,
      queryKey: api.reports.findAll.getKey(),
    });
  };
  return (
    <Flex>
      {!resolved ? (
        <ActionButton
          isSingle
          startIcon={<Check />}
          onClick={onClickResolve}
          variant="success"
        >
          {getMessage(
            'page.details.panel.discussion.warnings.reports.dialog.actions.resolve',
            'resolve',
          )}
        </ActionButton>
      ) : (
        <BlockMenu item={item} />
      )}
      {!resolved &&
        <BlockMenu
          item={item}
          type="icon"
        />
      }
    </Flex>
  );
};
