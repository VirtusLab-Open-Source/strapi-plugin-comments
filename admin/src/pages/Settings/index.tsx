// TODO
// @ts-nocheck

import React, { useRef, useMemo, useState } from "react";
import { useQuery } from "react-query";
// @ts-ignore
import { Formik } from "formik";
import { capitalize, first, orderBy, isEmpty, isEqual, isNil, debounce } from "lodash";
// @ts-ignore
import {
  CheckPermissions,
  LoadingIndicatorPage,
  Form,
  useTracking,
  useNotification,
  useRBAC,
  useFocusWhenNavigate,
  useOverlayBlocker,
} from "@strapi/helper-plugin";
import {
  Accordion,
  AccordionToggle,
  AccordionContent,
  AccordionGroup,
} from "@strapi/design-system/Accordion";
import { Main } from "@strapi/design-system/Main";
import { ContentLayout, HeaderLayout } from "@strapi/design-system/Layout";
import { Button } from "@strapi/design-system/Button";
import { Box } from "@strapi/design-system/Box";
import { Stack } from "@strapi/design-system/Stack";
import { Switch } from "@strapi/design-system/Switch";
import { Typography } from "@strapi/design-system/Typography";
import { Grid, GridItem } from "@strapi/design-system/Grid";
import { TextInput } from "@strapi/design-system/TextInput";
import { ToggleInput } from "@strapi/design-system/ToggleInput";
import { Select, Option } from "@strapi/design-system/Select";
import { useNotifyAT } from "@strapi/design-system/LiveRegions";
import { Tooltip } from "@strapi/design-system/Tooltip";
import { check, refresh, play, information } from "../../components/icons";

import pluginPermissions from "../../permissions";
import useConfig from "../../hooks/useConfig";
import { fetchAllContentTypes, fetchRoles } from "./utils/api";
import { getMessage, parseRegExp } from "../../utils";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { RestartAlert } from "./components/RestartAlert/styles";
import FormSwitch from "../../components/FormSwitch";
import { ToBeFixed } from "../../../../types";

const Settings = () => {
  useFocusWhenNavigate();

  const { notifyStatus } = useNotifyAT();
  const { trackUsage } = useTracking();
  const trackUsageRef = useRef(trackUsage);
  const toggleNotification = useNotification();
  const { lockApp, unlockApp } = useOverlayBlocker();

  const viewPermissions = useMemo(
    () => ({
      access: pluginPermissions.settings.read,
      change: pluginPermissions.settings.change,
    }),
    []
  );

  const {
    isLoading: isLoadingForPermissions,
    allowedActions: { canAccess, canChange },
  } = useRBAC(viewPermissions);

  const [restoreConfigmationVisible, setRestoreConfigmationVisible] =
    useState(false);
  const [restartRequired, setRestartRequired] = useState(false);
  const [contentTypeExpanded, setContentTypeExpanded] = useState(undefined);

  const { fetch, restartMutation, submitMutation, restoreMutation } =
    useConfig(toggleNotification);
  const {
    data: configData,
    isLoading: isConfigLoading,
    err: configErr,
  }: ToBeFixed = fetch;

  const {
    data: allCollectionsData,
    isLoading: areCollectionsLoading,
    err: collectionsErr,
  }: ToBeFixed = useQuery(["get-all-content-types", canAccess], () =>
    fetchAllContentTypes(toggleNotification)
  );

  const {
    data: allRolesData,
    isLoading: areRolesLoading,
    err: rolesErr,
  }: ToBeFixed = useQuery(["get-all-roles", canAccess], () =>
    fetchRoles(toggleNotification)
  );

  const isLoading =
    isLoadingForPermissions ||
    isConfigLoading ||
    areCollectionsLoading ||
    areRolesLoading;
  const isError = configErr || collectionsErr || rolesErr;

  const preparePayload = ({
    enabledCollections,
    gqlAuthEnabled,
    approvalFlow,
    entryLabel,
    clientUrl,
    clientEmail,
    blockedAuthorProps,
    ...rest
  }: ToBeFixed) => ({
    ...rest,
    blockedAuthorProps: blockedAuthorProps.split(",").map(x => x.trim()).filter(x => x),
    enabledCollections,
    approvalFlow: approvalFlow.filter((_) => enabledCollections.includes(_)),
    entryLabel: {
      ...Object.keys(entryLabel).reduce(
        (prev, curr) => ({
          ...prev,
          [curr]: enabledCollections.includes(curr)
            ? entryLabel[curr]
            : undefined,
        }),
        {}
      ),
      "*": entryLabel["*"],
    },
    reportReasons: configData?.reportReasons,
    client: clientEmail || clientUrl ? {
      contactEmail: clientEmail,
      url: clientUrl,
    } : undefined,
    gql: gqlAuthEnabled ? { auth: true } : undefined,
  });

  if (isLoading || isError) {
    return (
      <LoadingIndicatorPage>
        {getMessage("page.settings.loading")}
      </LoadingIndicatorPage>
    );
  }

  const regexUID = !isLoading
    ? new RegExp(
        parseRegExp(fetch.data.regex?.uid).value,
        parseRegExp(fetch.data.regex?.uid).flags
      )
    : null;

  const allRoles = allRolesData?.data || [];
  const allCollections =
    !isLoading &&
    allCollectionsData.filter(
      ({ uid }: ToBeFixed) =>
        first(uid.split(regexUID).filter((s) => s && s.length > 0)) === "api"
    );
  const enabledCollections =
    configData?.enabledCollections
      ?.map((uid: ToBeFixed) =>
        allCollections.find((_) => _.uid === uid) ? uid : undefined
      )
      .filter((_: ToBeFixed) => _) || [];
  const entryLabel = configData?.entryLabel || {};
  const approvalFlow = configData?.approvalFlow || [];
  const badWords = isNil(configData?.badWords) ? true : configData?.badWords;
  const isGQLPluginEnabled = configData?.isGQLPluginEnabled;
  const gqlAuthEnabled = configData?.gql?.auth || undefined;
  const moderatorRoles =
    configData?.moderatorRoles?.filter((code: ToBeFixed) =>
      allRoles.find((_: ToBeFixed) => _.code === code)
    ) || [];
  const clientUrl = configData?.client?.url;
  const clientEmail = configData?.client?.contactEmail;
  const blockedAuthorProps = configData?.blockedAuthorProps ?? [];

  const changeApprovalFlowFor = (
    uid: ToBeFixed,
    current: ToBeFixed,
    value: ToBeFixed
  ) => {
    const currentSet = new Set(current);
    if (value) {
      currentSet.add(uid);
    } else {
      currentSet.delete(uid);
    }
    return Array.from(currentSet);
  };

  const changeEntryLabelFor = (
    uid: ToBeFixed,
    current: ToBeFixed,
    value: ToBeFixed
  ) => ({
    ...current,
    [uid]: value && !isEmpty(value) ? [...value] : undefined,
  });

  const handleUpdateConfiguration = async (form: ToBeFixed) => {
    if (canChange) {
      lockApp();
      const payload = preparePayload(form);
      await submitMutation.mutateAsync(payload);
      const enabledCollectionsChanged = !isEqual(
        payload.enabledCollections,
        configData?.enabledCollections
      );
      const gqlAuthChanged = !isEqual(payload.gql?.auth, configData?.gql?.auth);
      if (enabledCollectionsChanged || gqlAuthChanged) {
        setRestartRequired(true);
      }
      unlockApp();
    }
  };

  const handleRestoreConfirmation = () => setRestoreConfigmationVisible(true);
  const handleRestoreConfiguration = async () => {
    if (canChange) {
      lockApp();
      await restoreMutation.mutateAsync();
      unlockApp();
      setRestartRequired(true);
      setRestoreConfigmationVisible(false);
    }
  };
  const handleRestoreCancel = () => setRestoreConfigmationVisible(false);

  const handleRestart = async () => {
    if (canChange) {
      lockApp();
      await restartMutation.mutateAsync();
      setRestartRequired(false);
      unlockApp();
    }
  };
  const handleRestartDiscard = () => setRestartRequired(false);

  const handleSetContentTypeExpanded = (key: ToBeFixed) =>
    setContentTypeExpanded(key === contentTypeExpanded ? undefined : key);

  const boxDefaultProps = {
    background: "neutral0",
    hasRadius: true,
    shadow: "filterShadow",
    padding: 6,
  };

  return (
    <Main>
      <Formik
        initialValues={{
          enabledCollections,
          moderatorRoles,
          badWords,
          approvalFlow,
          entryLabel,
          clientEmail,
          clientUrl,
          gqlAuthEnabled,
          blockedAuthorProps: blockedAuthorProps.join(", "),
        }}
        enableReinitialize={true}
        onSubmit={handleUpdateConfiguration}
      >
        {({ handleSubmit, setFieldValue, values }: ToBeFixed) => (
          <Form noValidate onSubmit={handleSubmit}>
            <HeaderLayout
              title={getMessage("page.settings.header.title")}
              subtitle={getMessage("page.settings.header.description")}
              primaryAction={
                <CheckPermissions
                  permissions={pluginPermissions.settingsChange}
                >
                  <Button
                    type="submit"
                    startIcon={check}
                    disabled={restartRequired}
                  >
                    {getMessage("page.settings.actions.submit")}
                  </Button>
                </CheckPermissions>
              }
            />
            <ContentLayout>
              <Stack size={4}>
                {restartRequired && (
                  <RestartAlert
                    closeLabel={getMessage(
                      "page.settings.actions.restart.alert.cancel"
                    )}
                    title={getMessage(
                      "page.settings.actions.restart.alert.title"
                    )}
                    action={
                      <Box>
                        <Button onClick={handleRestart} startIcon={play}>
                          {getMessage("page.settings.actions.restart")}
                        </Button>
                      </Box>
                    }
                    onClose={handleRestartDiscard}
                  >
                    {getMessage(
                      "page.settings.actions.restart.alert.description"
                    )}
                  </RestartAlert>
                )}

                <Box {...boxDefaultProps}>
                  <Stack size={4}>
                    <Typography variant="delta" as="h2">
                      {getMessage("page.settings.section.general")}
                    </Typography>
                    <Grid gap={4}>
                      <GridItem col={12}>
                        <Select
                          name="enabledCollections"
                          label={getMessage(
                            "page.settings.form.enabledCollections.label"
                          )}
                          placeholder={getMessage(
                            "page.settings.form.enabledCollections.placeholder"
                          )}
                          hint={getMessage(
                            "page.settings.form.enabledCollections.hint"
                          )}
                          onClear={() =>
                            setFieldValue("enabledCollections", [], false)
                          }
                          value={values.enabledCollections}
                          onChange={(value: ToBeFixed) =>
                            setFieldValue("enabledCollections", value, false)
                          }
                          disabled={restartRequired}
                          multi
                          withTags
                        >
                          {allCollections.map(
                            ({ uid, schema: { displayName } }: ToBeFixed) => (
                              <Option key={uid} value={uid}>
                                {displayName}
                              </Option>
                            )
                          )}
                        </Select>
                      </GridItem>
                      {!isEmpty(values.enabledCollections) && (
                        <GridItem col={12}>
                          <AccordionGroup
                            label={getMessage(
                              "page.settings.form.contentTypesSettings.label"
                            )}
                            labelAction={
                              <Tooltip
                                description={getMessage(
                                  "page.settings.form.contentTypesSettings.tooltip"
                                )}
                              >
                                {information}
                              </Tooltip>
                            }
                          >
                            {orderBy(values.enabledCollections).map((uid) => {
                              const {
                                schema: { displayName, attributes = {} },
                              } = allCollections.find((_) => _.uid === uid);
                              const stringAttributes = Object.keys(
                                attributes
                              ).filter((_) => attributes[_].type === "string");
                              const key = `collectionSettings-${uid}`;
                              return (
                                <Accordion
                                  expanded={contentTypeExpanded === key}
                                  toggle={() =>
                                    handleSetContentTypeExpanded(key)
                                  }
                                  key={key}
                                  id={key}
                                  size="S"
                                >
                                  <AccordionToggle
                                    title={displayName}
                                    togglePosition="left"
                                  />
                                  <AccordionContent>
                                    <Box padding={6}>
                                      <Stack size={4}>
                                        <FormSwitch
                                          name={`collectionSettings-${uid}-approvalFlow`}
                                          label={getMessage(
                                            "page.settings.form.approvalFlow.label"
                                          )}
                                          hint={getMessage({
                                            id: "page.settings.form.approvalFlow.hint",
                                            props: { name: displayName },
                                          })}
                                          selected={values.approvalFlow.includes(
                                            uid
                                          )}
                                          onChange={() =>
                                            setFieldValue(
                                              "approvalFlow",
                                              changeApprovalFlowFor(
                                                uid,
                                                values.approvalFlow,
                                                !values.approvalFlow.includes(
                                                  uid
                                                )
                                              ),
                                              []
                                            )
                                          }
                                          onLabel={getMessage(
                                            "compontents.toogle.enabled"
                                          )}
                                          offLabel={getMessage(
                                            "compontents.toogle.disabled"
                                          )}
                                          disabled={restartRequired}
                                          visibleLabels
                                        />
                                        {!isEmpty(stringAttributes) && (
                                          <Select
                                            name={`collectionSettings-${uid}-entryLabel`}
                                            label={getMessage(
                                              "page.settings.form.entryLabel.label"
                                            )}
                                            placeholder={getMessage(
                                              "page.settings.form.entryLabel.placeholder"
                                            )}
                                            hint={getMessage(
                                              "page.settings.form.entryLabel.hint"
                                            )}
                                            onClear={() =>
                                              setFieldValue(
                                                "entryLabel",
                                                changeEntryLabelFor(
                                                  uid,
                                                  values.entryLabel
                                                )
                                              )
                                            }
                                            value={values.entryLabel[uid] || []}
                                            onChange={(value: ToBeFixed) =>
                                              setFieldValue(
                                                "entryLabel",
                                                changeEntryLabelFor(
                                                  uid,
                                                  values.entryLabel,
                                                  value
                                                )
                                              )
                                            }
                                            multi
                                            withTags
                                            disabled={restartRequired}
                                          >
                                            {stringAttributes.map((key) => (
                                              <Option
                                                key={`collectionSettings-${uid}-entryLabel-${key}`}
                                                value={key}
                                              >
                                                {capitalize(
                                                  key.split("_").join(" ")
                                                )}
                                              </Option>
                                            ))}
                                          </Select>
                                        )}
                                      </Stack>
                                    </Box>
                                  </AccordionContent>
                                </Accordion>
                              );
                            })}
                          </AccordionGroup>
                        </GridItem>
                      )}
                    </Grid>
                  </Stack>
                </Box>

                <Box {...boxDefaultProps}>
                  <Stack size={4}>
                    <Typography variant="delta" as="h2">
                      {getMessage("page.settings.section.additional")}
                    </Typography>
                    <Grid gap={4}>
                      <GridItem col={4} xs={12}>
                        <ToggleInput
                          name="badWords"
                          label={getMessage(
                            "page.settings.form.badWords.label"
                          )}
                          hint={getMessage("page.settings.form.badWords.hint")}
                          checked={values.badWords}
                          onChange={({ target: { checked } }: ToBeFixed) =>
                            setFieldValue("badWords", checked, false)
                          }
                          onLabel={getMessage("compontents.toogle.enabled")}
                          offLabel={getMessage("compontents.toogle.disabled")}
                          disabled={restartRequired}
                        />
                      </GridItem>
                      <GridItem col={4} xs={12}>
                        <TextInput
                          type="text"
                          name="blockedAuthorProps"
                          label={getMessage(
                            "page.settings.form.author.blockedProps.label"
                          )}
                          hint={getMessage("page.settings.form.author.blockedProps.hint")}
                          value={values.blockedAuthorProps}
                          onChange={({ target: { value } }: ToBeFixed) =>
                            setFieldValue("blockedAuthorProps", value, false)
                          }
                          disabled={restartRequired}
                        />
                      </GridItem>
                      {isGQLPluginEnabled && (
                        <GridItem col={4} xs={12}>
                          <ToggleInput
                            name="gqlAuthEnabled"
                            label={getMessage(
                              "page.settings.form.gqlAuth.label"
                            )}
                            hint={getMessage("page.settings.form.gqlAuth.hint")}
                            checked={values.gqlAuthEnabled}
                            onChange={({ target: { checked } }: ToBeFixed) =>
                              setFieldValue("gqlAuthEnabled", checked, false)
                            }
                            onLabel={getMessage("compontents.toogle.enabled")}
                            offLabel={getMessage("compontents.toogle.disabled")}
                            disabled={restartRequired}
                          />
                        </GridItem>
                      )}
                    </Grid>
                  </Stack>
                </Box>

                <Box {...boxDefaultProps}>
                  <Stack size={4}>
                    <Typography variant="delta" as="h2">
                      {getMessage("page.settings.section.client")}
                    </Typography>
                    <Grid gap={4}>
                      <GridItem col={3} xs={12}>
                        <TextInput
                          type="url"
                          name="clientUrl"
                          label={getMessage(
                            "page.settings.form.client.url.label"
                          )}
                          hint={getMessage("page.settings.form.client.url.hint")}
                          value={values.clientUrl}
                          onChange={({ target: { value } }: ToBeFixed) =>
                            setFieldValue("clientUrl", value, false)
                          }
                          disabled={restartRequired}
                        />
                      </GridItem>
                      <GridItem col={3} xs={12}>
                        <TextInput
                          type="email"
                          name="clientEmail"
                          label={getMessage(
                            "page.settings.form.client.email.label"
                          )}
                          hint={getMessage("page.settings.form.client.email.hint")}
                          value={values.clientEmail}
                          onChange={({ target: { value } }: ToBeFixed) =>
                            setFieldValue("clientEmail", value, false)
                          }
                          disabled={restartRequired}
                        />
                      </GridItem>
                      <GridItem col={6} xs={12}>
                        <Select
                          name="moderatorRoles"
                          label={getMessage(
                            "page.settings.form.moderatorRoles.label"
                          )}
                          placeholder={getMessage(
                            "page.settings.form.moderatorRoles.placeholder"
                          )}
                          hint={getMessage(
                            "page.settings.form.moderatorRoles.hint"
                          )}
                          onClear={() =>
                            setFieldValue("moderatorRoles", [], false)
                          }
                          value={values.moderatorRoles}
                          onChange={(value: ToBeFixed) =>
                            setFieldValue("moderatorRoles", value, false)
                          }
                          disabled={restartRequired}
                          multi
                          withTags
                        >
                          {allRoles.map(({ code, name }: ToBeFixed) => (
                            <Option key={code} value={code}>
                              {name}
                            </Option>
                          ))}
                        </Select>
                      </GridItem>
                    </Grid>
                  </Stack>
                </Box>

                <CheckPermissions
                  permissions={pluginPermissions.settingsChange}
                >
                  <Box {...boxDefaultProps}>
                    <Stack size={4}>
                      <Stack size={2}>
                        <Typography variant="delta" as="h2">
                          {getMessage("page.settings.section.restore")}
                        </Typography>
                        <Typography variant="pi" as="h4">
                          {getMessage("page.settings.section.restore.subtitle")}
                        </Typography>
                      </Stack>
                      <Grid gap={4}>
                        <GridItem col={6}>
                          <Button
                            variant="danger-light"
                            startIcon={refresh}
                            onClick={handleRestoreConfirmation}
                          >
                            {getMessage("page.settings.actions.restore")}
                          </Button>

                          <ConfirmationDialog
                            isVisible={restoreConfigmationVisible}
                            isActionAsync={restoreMutation.isLoading}
                            header={getMessage(
                              "page.settings.actions.restore.confirmation.header"
                            )}
                            labelConfirm={getMessage(
                              "page.settings.actions.restore.confirmation.button.confirm"
                            )}
                            iconConfirm={refresh}
                            onConfirm={handleRestoreConfiguration}
                            onCancel={handleRestoreCancel}
                          >
                            {getMessage(
                              "page.settings.actions.restore.confirmation.description"
                            )}
                          </ConfirmationDialog>
                        </GridItem>
                      </Grid>
                    </Stack>
                  </Box>
                </CheckPermissions>
              </Stack>
            </ContentLayout>
          </Form>
        )}
      </Formik>
    </Main>
  );
};

export default Settings;
