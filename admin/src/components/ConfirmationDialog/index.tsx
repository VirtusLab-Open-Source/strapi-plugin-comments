import { Button, Dialog, Flex, Typography } from '@strapi/design-system';
import { WarningCircle } from '@strapi/icons';
import React, { FC, ReactNode, useState } from 'react';

type ConfirmationDialogProps = {
  Trigger: FC<{ onClick: () => void }>;
  title: string;
  labelCancel?: string;
  labelConfirm: string;
  iconConfirm?: ReactNode;
  onConfirm: () => void | Promise<void>;
  children?: ReactNode;
};
export const ConfirmationDialog: FC<ConfirmationDialogProps> = ({
  title,
  onConfirm,
  Trigger,
  labelConfirm,
  iconConfirm,
  labelCancel,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const onToggleModal = () => setIsOpen((prev) => !prev);
  const internalOnConfirm = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
    onToggleModal();
  };

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Trigger>
        <Trigger onClick={onToggleModal} />
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>{title}</Dialog.Header>
        <Dialog.Body>
          <Flex justifyContent="center" direction="column">
            <WarningCircle fill="danger500" stroke="danger500" height="24" width="24" />
            <Typography id="confirm-description">
              {children}
            </Typography>
          </Flex>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Cancel>
            <Button
              onClick={onToggleModal}
              disabled={isLoading}
              variant="tertiary">
              {labelCancel || 'Cancel'}
            </Button>
          </Dialog.Cancel>
          <Dialog.Action>
            <Button
              onClick={internalOnConfirm}
              variant="danger-light"
              loading={isLoading}
              disabled={isLoading}
              startIcon={iconConfirm}
            >
              {labelConfirm}
            </Button>
          </Dialog.Action>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
};