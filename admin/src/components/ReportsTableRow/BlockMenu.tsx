import { MenuItem, SimpleMenu } from '@strapi/design-system';
import { useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import { Report } from '../../api/schemas';
import { useAPI } from '../../hooks/useAPI';
import { useCommentMutations } from '../../hooks/useCommentMutations';
import { getMessage } from '../../utils';

type BlockMenuProps = {
  item: Report;
  type?: 'icon' | 'button';
}
const iconButtonStyle = { minHeight: '2em', paddingLeft: '5px', paddingRight: '12px' };

export const BlockMenu: FC<BlockMenuProps> = ({ type, item }) => {
  const queryClient = useQueryClient();
  const api = useAPI();

  const onSuccess = async () => {
    await queryClient.invalidateQueries({
      queryKey: api.reports.findAll.getKey(),
    });
  };

  const { commentMutation } = useCommentMutations({
    comment: {
      blockSuccess: onSuccess,
      unBlockSuccess: onSuccess,
      blockThreadSuccess: onSuccess,
      unBlockThreadSuccess: onSuccess,
    },
  });
  const isIconButton = type === 'icon';
  const { related: { blockedThread, gotThread, blocked: blockedComment } } = item;

  const handleBlockComment = async () => {
    await commentMutation.block.mutateAsync(item.related.id);
  };
  const handleUnblockComment = async () => {
    await commentMutation.unBlock.mutateAsync(item.related.id);
  };
  const handleBlockThread = async () => {
    await commentMutation.blockThread.mutateAsync(item.related.id);
  };
  const handleUnblockThread = async () => {
    await commentMutation.unBlockThread.mutateAsync(item.related.id);
  };
  return (
    <SimpleMenu
      label={isIconButton ? null : 'Block'}
      variant={'danger-light'}
      style={isIconButton ? iconButtonStyle : null}>
      {!blockedComment ? (
        <MenuItem
          disabled={blockedThread}
          onClick={handleBlockComment}>
          {getMessage(
            'page.details.actions.comment.block',
            'Block comment',
          )}
        </MenuItem>
      ) : (
        <MenuItem
          disabled={blockedThread}
          onClick={handleUnblockComment}>
          {getMessage(
            'page.details.actions.comment.unblock',
            'Unblock comment',
          )}
        </MenuItem>)
      }
      {gotThread &&
        (!blockedThread ? (
          <MenuItem
            onClick={handleBlockThread}>
            {getMessage(
              'page.details.actions.thread.block',
              'Block thread',
            )}
          </MenuItem>
        ) : (
          <MenuItem
            onClick={handleUnblockThread}>
            {getMessage(
              'page.details.actions.thread.unblock',
              'Unblock thread',
            )}
          </MenuItem>))
      }
    </SimpleMenu>
  );
};