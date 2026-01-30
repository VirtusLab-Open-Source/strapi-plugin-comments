import { Accordion, Alert, Box, Button, Field, Flex, Grid, MultiSelect, MultiSelectOption, Switch, Toggle, Typography } from '@strapi/design-system';
import { ArrowClockwise, Check, Play } from '@strapi/icons';
import { Form, Layouts, Page, useNotification } from '@strapi/strapi/admin';
import { useQueryClient } from '@tanstack/react-query';

import { isNil, orderBy } from 'lodash';
import { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { RenderIf } from '../../components/RenderIf';
import { useAPI } from '../../hooks/useAPI';
import { usePermissions } from '../../hooks/usePermissions';
import { CommonProviders } from '../../providers/CommonProviders';
import { getMessage } from '../../utils';
import { useSettingsAPI } from './hooks/useSettingsAPI';

const boxDefaultProps = {
  background: 'neutral0',
  hasRadius: true,
  shadow: 'filterShadow',
  padding: 6,
  width: '100%',
};

const StyledAlert = styled(Alert)(() => ({
  '[role]': {
    flexDirection: 'column',
  },
}));

const Settings = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const { toggleNotification } = useNotification();
  const [isRestartRequired, setIsRestartRequired] = useState(false);
  const { isLoadingForPermissions, canSettingsChange } = usePermissions();
  const queryClient = useQueryClient();
  const api = useAPI();

  const {
    config,
    collectionTypes,
    roles,
    restoreSettingsMutation,
    updateSettingsMutation,
    restartStrapiMutation,
  } = useSettingsAPI({
    restoreSettingsMutationSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: api.config.getKey(),
        exact: false,
      });
      setIsRestartRequired(true);
      toggleNotification({
        message: getMessage('page.settings.actions.restore.success'),
        type: 'success',
      });
    },
    restartStrapiMutationSuccess: () => {
      setIsRestartRequired(false);
    },
    updateSettingsMutationSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: api.config.getKey(),
        exact: false,
      });
      setIsRestartRequired(true);
    },
  });

  const onTriggerSubmit = useCallback(() => {
    formRef.current?.requestSubmit();
  }, []);

  const onSubmit = useCallback((values: any) => {
    updateSettingsMutation.mutate({
      ...values,
      blockedAuthorProps: values.blockedAuthorProps.split(',').map((prop: string) => prop.trim()),
    });
  }, [updateSettingsMutation]);


  if (
    config.status !== 'success' ||
    collectionTypes.status !== 'success' ||
    roles.status !== 'success' ||
    isLoadingForPermissions
  ) {
    // TODO
    return getMessage('page.settings.loading');
  }

  const allCollections = collectionTypes.data.filter(ct => ct.uid.includes('api::'));
  const enabledCollections = config.data.enabledCollections
    .filter((uid: string) => allCollections.some(ct => ct.uid === uid));
  const badWords = isNil(config.data.badWords) ? true : config.data?.badWords;
  const gqlAuthEnabled = Boolean(config.data.gql?.auth || null);
  const moderatorRoles = config.data.moderatorRoles
    .filter((role: string) => roles.data.filter((r) => r.code === role));
  const clientUrl = config.data.client?.url;
  const clientEmail = config.data.client?.contactEmail;
  const blockedAuthorProps = config.data.blockedAuthorProps ?? [];
  const onDiscardRestart = () => setIsRestartRequired(false);

  return (
    <>
      <Page.Title children={'Comments - settings'} />
      <Page.Main>
        <Layouts.Header
          title={getMessage('page.settings.header.title')}
          subtitle={getMessage('page.settings.header.description')}
          as="h2"
          primaryAction={(
            <RenderIf condition={canSettingsChange}>
              <Button type="submit" startIcon={<Check />} onClick={onTriggerSubmit}>
                {getMessage('page.settings.actions.submit')}
              </Button>
            </RenderIf>
          )}
        />
        <Layouts.Content>
          {isRestartRequired && (
            <Box marginBottom={4}>
              <StyledAlert
                closeLabel={getMessage('page.settings.actions.restart.alert.cancel')}
                title={getMessage('page.settings.actions.restart.alert.title')}
                onClose={onDiscardRestart}
                action={
                  <Box>
                    <Button onClick={restartStrapiMutation.mutate} startIcon={<Play />}>
                      {getMessage('page.settings.actions.restart')}
                    </Button>
                  </Box>
                }
              >
                <Box marginTop={4}>
                  {getMessage('page.settings.actions.restart.alert.description')}
                </Box>
              </StyledAlert>
            </Box>
          )}
          <Form
            method="POST"
            width="auto"
            height="auto"
            ref={formRef}
            onSubmit={onSubmit}
            initialValues={{
              enabledCollections,
              moderatorRoles,
              badWords,
              clientEmail,
              clientUrl,
              gqlAuthEnabled,
              approvalFlow: config.data.approvalFlow,
              entryLabel: config.data.entryLabel,
              blockedAuthorProps: blockedAuthorProps.join(', '),
            }}
          >
            {({ values, onChange }) => (
              <Flex gap={4} direction="column">
                <Box {...boxDefaultProps}>
                  <Typography variant="delta" as="h2">
                    {getMessage('page.settings.section.general')}
                  </Typography>
                  <Grid.Root gap={4} marginTop={4} width="100%">
                    <Grid.Item xs={12}>
                      <Field.Root width="100%" hint={getMessage('page.settings.form.enabledCollections.hint')}>
                        <Field.Label htmlFor="enabledCollections">
                          {getMessage('page.settings.form.enabledCollections.label')}
                        </Field.Label>
                        <MultiSelect
                          withTags
                          name="enabledCollections"
                          value={values.enabledCollections}
                          onChange={(value: string[]) => {
                            onChange('enabledCollections', value);
                          }}
                        >
                          {allCollections.map((collection) => (
                            <MultiSelectOption key={collection.uid} value={collection.uid}>
                              {collection.schema.displayName}
                            </MultiSelectOption>
                          ))}
                        </MultiSelect>
                        <Field.Hint />
                      </Field.Root>
                    </Grid.Item>
                    {values.enabledCollections.length > 0 && (
                      <Grid.Item>
                        <Grid.Root gap={4} width="100%">
                          <Grid.Item>
                            <Typography>
                              {getMessage('page.settings.form.contentTypesSettings.label')}
                            </Typography>
                          </Grid.Item>
                          <Grid.Item>
                            <Accordion.Root style={{ width: '100%' }}>
                              {orderBy(values.enabledCollections).map(uid => {
                                const collection = allCollections.find(ct => ct.uid === uid);
                                if (collection) {
                                  const { schema: { displayName, attributes } } = collection;
                                  const stringAttributes = Object.keys(attributes).filter((key) => attributes[key].type === 'string');
                                  return (
                                    <Accordion.Item key={uid} value={uid}>
                                      <Accordion.Header>
                                        <Accordion.Trigger>
                                          <Typography variant="epsilon" as="h3">
                                            {displayName}
                                          </Typography>
                                        </Accordion.Trigger>
                                      </Accordion.Header>
                                      <Accordion.Content>
                                        <Grid.Root padding={6} gap={4}>
                                          <Grid.Item>
                                            <Field.Root
                                              width="100%"
                                              hint={getMessage({
                                                id: 'page.settings.form.approvalFlow.hint',
                                                props: { name: displayName },
                                              })}
                                            >
                                              <Field.Label>
                                                {getMessage('page.settings.form.approvalFlow.label')}
                                              </Field.Label>
                                              <Switch
                                                visibleLabels
                                                onLabel={getMessage('components.toogle.enabled')}
                                                offLabel={getMessage('components.toogle.disabled')}
                                                checked={values.approvalFlow.includes(uid)}
                                                onCheckedChange={(checked: boolean) => {
                                                  onChange('approvalFlow', checked ? [...values.approvalFlow, uid] : values.approvalFlow.filter((c: string) => c !== uid));
                                                }}
                                              />
                                              <Field.Hint />
                                            </Field.Root>
                                          </Grid.Item>
                                          <RenderIf condition={stringAttributes.length > 0}>
                                            <Grid.Item>
                                              <Field.Root
                                                width="100%"
                                                hint={getMessage('page.settings.form.entryLabel.hint')}
                                              >
                                                <Field.Label>
                                                  {getMessage('page.settings.form.entryLabel.label')}
                                                </Field.Label>
                                                <MultiSelect
                                                  withTags
                                                  placeholder={getMessage('page.settings.form.entryLabel.placeholder')}
                                                  name="enabledCollections"
                                                  value={values.entryLabel[uid] ?? []}
                                                  onChange={(value: string[]) => {
                                                    onChange('entryLabel', { ...values.entryLabel, [uid]: value });
                                                  }}
                                                >
                                                  {stringAttributes.map((attr) => (
                                                    <MultiSelectOption key={attr} value={attr}>
                                                      {attr}
                                                    </MultiSelectOption>
                                                  ))}
                                                </MultiSelect>
                                                <Field.Hint />
                                              </Field.Root>
                                            </Grid.Item>
                                          </RenderIf>
                                        </Grid.Root>
                                      </Accordion.Content>
                                    </Accordion.Item>
                                  );
                                }
                                return null;
                              })}
                            </Accordion.Root>
                          </Grid.Item>
                        </Grid.Root>
                      </Grid.Item>
                    )}
                  </Grid.Root>
                </Box>
                <Box {...boxDefaultProps}>
                  <Typography variant="delta" as="h2">
                    {getMessage('page.settings.section.additional')}
                  </Typography>
                  <Grid.Root gap={4} marginTop={4} width="100%">
                    <Grid.Item col={4} xs={12} alignItems="start">
                      <Field.Root width="100%" hint={getMessage('page.settings.form.enabledCollections.hint')}>
                        <Field.Label htmlFor="enabledCollections">
                          {getMessage('page.settings.form.enabledCollections.label')}
                        </Field.Label>
                        <Toggle
                          name="badWords"
                          checked={values.badWords}
                          onChange={onChange}
                          onLabel={getMessage('components.toogle.enabled')}
                          offLabel={getMessage('components.toogle.disabled')}
                          width="100%"
                        />
                        <Field.Hint />
                      </Field.Root>
                    </Grid.Item>
                    <Grid.Item col={4} xs={12} alignItems="start">
                      <Field.Root width="100%" hint={getMessage('page.settings.form.author.blockedProps.hint')}>
                        <Field.Label htmlFor="enabledCollections">
                          {getMessage('page.settings.form.author.blockedProps.label')}
                        </Field.Label>
                        <Field.Input name="blockedAuthorProps" value={values.blockedAuthorProps} onChange={onChange} />
                        <Field.Hint />
                      </Field.Root>
                    </Grid.Item>
                    <Grid.Item col={4} xs={12} alignItems="start">
                      <Field.Root width="100%" hint={getMessage('page.settings.form.gqlAuth.hint')}>
                        <Field.Label>
                          {getMessage('page.settings.form.gqlAuth.label')}
                        </Field.Label>
                        <Toggle
                          name="gqlAuthEnabled"
                          checked={values.gqlAuthEnabled}
                          onChange={onChange}
                          onLabel={getMessage('components.toogle.enabled')}
                          offLabel={getMessage('components.toogle.disabled')}
                          width="100%"
                        />
                        <Field.Hint />
                      </Field.Root>
                    </Grid.Item>
                  </Grid.Root>
                </Box>
                <Box {...boxDefaultProps}>
                  <Typography variant="delta" as="h2">
                    {getMessage('page.settings.section.client')}
                  </Typography>
                  <Grid.Root gap={4} marginTop={4} width="100%">
                    <Grid.Item col={4} xs={12} alignItems="start">
                      <Field.Root width="100%" hint={getMessage('page.settings.form.client.url.hint')}>
                        <Field.Label>
                          {getMessage('page.settings.form.client.url.label')}
                        </Field.Label>
                        <Field.Input name="clientUrl" onChange={onChange} />
                        <Field.Hint />
                      </Field.Root>
                    </Grid.Item>
                    <Grid.Item col={4} xs={12} alignItems="start">
                      <Field.Root width="100%" hint={getMessage('page.settings.form.client.email.hint')}>
                        <Field.Label>
                          {getMessage('page.settings.form.client.email.label')}
                        </Field.Label>
                        <Field.Input name="clientEmail" onChange={onChange} />
                        <Field.Hint />
                      </Field.Root>
                    </Grid.Item>
                    <Grid.Item col={4} xs={12} alignItems="start">
                      <Field.Root
                        width="100%"
                        hint={getMessage('page.settings.form.moderatorRoles.hint')}
                      >
                        <Field.Label>
                          {getMessage('page.settings.form.moderatorRoles.label')}
                        </Field.Label>
                        <MultiSelect
                          withTags
                          placeholder={getMessage('page.settings.form.moderatorRoles.placeholder')}
                          name="enabledCollections"
                          value={values.moderatorRoles}
                          onChange={(value: string[]) => {
                            onChange('moderatorRoles', value);
                          }}
                        >
                          {roles.data.map((role) => (
                            <MultiSelectOption key={role.code} value={role.code}>
                              {role.name}
                            </MultiSelectOption>
                          ))}
                        </MultiSelect>
                        <Field.Hint />
                      </Field.Root>
                    </Grid.Item>
                  </Grid.Root>
                </Box>
                <RenderIf condition={canSettingsChange}>
                  <Box {...boxDefaultProps}>
                    <Flex gap={4} direction="column" alignItems="flex-start">
                      <Flex gap={2} direction="column" alignItems="flex-start">
                        <Typography variant="delta" as="h2">
                          {getMessage('page.settings.section.restore')}
                        </Typography>
                        <Typography variant="pi" as="h4">
                          {getMessage('page.settings.section.restore.subtitle')}
                        </Typography>
                      </Flex>
                      <ConfirmationDialog
                        Trigger={({ onClick }) => (
                          <Button
                            variant="danger-light"
                            startIcon={<ArrowClockwise />}
                            onClick={onClick}
                          >
                            {getMessage('page.settings.actions.restore')}
                          </Button>
                        )}
                        onConfirm={restoreSettingsMutation.mutate}
                        title={getMessage('page.settings.actions.restore.confirmation.header')}
                        labelConfirm={getMessage('page.settings.actions.restore.confirmation.button.confirm')}
                        iconConfirm={<ArrowClockwise />}>
                        {getMessage('page.settings.actions.restore.confirmation.description')}
                      </ConfirmationDialog>
                    </Flex>
                  </Box>
                </RenderIf>
              </Flex>
            )}
          </Form>
        </Layouts.Content>
      </Page.Main>
    </>
  );
};

export default () => (
  <CommonProviders>
    <Settings />
  </CommonProviders>
);