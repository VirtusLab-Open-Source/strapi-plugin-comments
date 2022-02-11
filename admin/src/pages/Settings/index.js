import React, { useRef, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { Formik } from 'formik';
import { capitalize, first, orderBy, isEmpty } from 'lodash';
import {
	CheckPermissions,
	LoadingIndicatorPage,
	Form,
	useTracking,
	useNotification,
	useRBAC,
	useFocusWhenNavigate,
	useOverlayBlocker,
} from '@strapi/helper-plugin';
import { Main } from '@strapi/design-system/Main';
import { ContentLayout, HeaderLayout } from '@strapi/design-system/Layout';
import { Button } from '@strapi/design-system/Button';
import { Box } from '@strapi/design-system/Box';
import { Stack } from '@strapi/design-system/Stack';
import { Typography } from '@strapi/design-system/Typography';
import { Grid, GridItem } from '@strapi/design-system/Grid';
import { ToggleInput } from '@strapi/design-system/ToggleInput';
import { Select, Option } from '@strapi/design-system/Select';
import { useNotifyAT } from '@strapi/design-system/LiveRegions';
import {
  Card,
  CardBody,
  CardContent,
} from '@strapi/design-system/Card';
import { Check, Refresh } from '@strapi/icons';

import pluginPermissions from '../../permissions';
import useConfig from '../../hooks/useConfig';
import { fetchAllContentTypes, fetchRoles } from './utils/api';
import { getMessage, parseRegExp } from '../../utils';
import ConfirmationDialog from '../../components/ConfirmationDialog';


const Settings = () => {
	useFocusWhenNavigate();

	const { notifyStatus } = useNotifyAT();
	const { trackUsage } = useTracking();
	const trackUsageRef = useRef(trackUsage);
	const toggleNotification = useNotification();
    const { lockApp, unlockApp } = useOverlayBlocker();
  
	const viewPermissions = useMemo(() => ({ 
	  access: pluginPermissions.settings.read,
	  change: pluginPermissions.settings.change,
	}), []);
  
	const {
	  isLoading: isLoadingForPermissions,
	  allowedActions: { canAccess, canChange },
	} = useRBAC(viewPermissions);

	const [restoreConfigmationVisible, setRestoreConfigmationVisible] = useState(false);

	const { fetch, submitMutation, restoreMutation } = useConfig(toggleNotification);
	const { data: configData, isLoading: isConfigLoading, err: configErr } = fetch;

	const { data: allCollectionsData, isLoading: areCollectionsLoading, err: collectionsErr } = useQuery(
		['get-all-content-types', canAccess],
		() => fetchAllContentTypes(toggleNotification)
	  );

	const { data: allRolesData, isLoading: areRolesLoading, err: rolesErr } = useQuery(
		['get-all-roles', canAccess],
		() => fetchRoles(toggleNotification)
	);

	const isLoading = isLoadingForPermissions || isConfigLoading || areCollectionsLoading || areRolesLoading;
	const isError = configErr || collectionsErr || rolesErr;

	const preparePayload = ({ enabledCollections, gqlAuthEnabled, approvalFlow, entryLabel, ...rest }) => ({
		...rest,
		enabledCollections,
		approvalFlow: approvalFlow.filter(_ => enabledCollections.includes(_)),
		entryLabel: {
			...Object.keys(entryLabel).reduce((prev, curr) => ({
				...prev,
				[curr]: enabledCollections.includes(curr) ? entryLabel[curr] : undefined,
			}), {}),
			'*': entryLabel['*'],
		},
		gql: gqlAuthEnabled ? { auth: true } : undefined,
	});

	if (isLoading || isError) {
		return (<LoadingIndicatorPage>
				{ getMessage('page.settings.loading')}
			</LoadingIndicatorPage>);
	}

	const regexUID = !isLoading ? new RegExp(
		parseRegExp(fetch.data.regex?.uid).value,
		parseRegExp(fetch.data.regex?.uid).flags
	) : null;

	const allRoles = allRolesData?.data || [];
	const allCollections = !isLoading && allCollectionsData
		.filter(({ uid }) => first(uid.split(regexUID).filter(s => s && s.length > 0)) === 'api');
	const enabledCollections = configData?.enabledCollections
		?.map(uid => allCollections.find(_ => _.uid === uid) ? uid : undefined)
		.filter(_ => _) || [];
	const entryLabel = configData?.entryLabel || {};
	const approvalFlow = configData?.approvalFlow || [];
	const badWords = configData?.badWords || undefined;
	const isGQLPluginEnabled = false;
	const gqlAuthEnabled = configData?.gql?.auth || undefined;
	const moderatorRoles = configData?.moderatorRoles
		?.filter(code => allRoles.find(_ => _.code === code)) || [];

	const changeApprovalFlowFor = (uid, current, value) => {
		const currentSet = new Set(current);
		if (value) {
			currentSet.add(uid);
		} else {
			currentSet.delete(uid);
		}
		return Array.from(currentSet);
	};

	const changeEntryLabelFor = (uid, current, value) => ({
		...current,
		[uid]: value && !isEmpty(value) ? [...value] : undefined,
	});

	const handleUpdateConfiguration = async (form) => {
		if (canChange) {
			lockApp();
			await submitMutation.mutateAsync(preparePayload(form));
			unlockApp();
		}
	};

	const handleRestoreConfirmation = () => setRestoreConfigmationVisible(true);
	const handleRestoreConfiguration = async () => {
		if (canChange) {
			lockApp();
			await restoreMutation.mutateAsync();
			unlockApp();
			setRestoreConfigmationVisible(false);
		}
	};
	const handleRestoreCancel = () => setRestoreConfigmationVisible(false);

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
					gqlAuthEnabled,
				}}
				onSubmit={handleUpdateConfiguration}
			>
				{({ handleSubmit, setFieldValue, values }) => (
					<Form noValidate onSubmit={handleSubmit}>
						<HeaderLayout
							title={getMessage('page.settings.header.title')}
							subtitle={getMessage('page.settings.header.description')}
							primaryAction={
								<CheckPermissions permissions={pluginPermissions.settingsChange}>
									<Button type="submit" startIcon={<Check />} >
										{getMessage('page.settings.actions.submit')}
									</Button>
								</CheckPermissions>
							}
						/>
						<ContentLayout>
							<Stack size={6}>
								<Box {...boxDefaultProps}>
									<Stack size={4}>
										<Typography variant="delta" as="h2">
											{getMessage('page.settings.section.general')}
										</Typography>
										<Grid gap={4}>
											<GridItem col={12}>
												<Select
													name="enabledCollections"
													label={getMessage('page.settings.form.enabledCollections.label')}
													placeholder={getMessage('page.settings.form.enabledCollections.placeholder')}
													hint={getMessage('page.settings.form.enabledCollections.hint')}
													onClear={() => setFieldValue('enabledCollections', [], false)}
													value={values.enabledCollections}
													onChange={(value) => setFieldValue('enabledCollections', value, false)}
													multi
													withTags
												>
													{ allCollections.map(({ uid, schema: { displayName } }) => 
														(<Option key={uid} value={uid}>{displayName}</Option>))}
												</Select>
											</GridItem>
											<GridItem col={6} xs={12}>
												<Select
													name="moderatorRoles"
													label={getMessage('page.settings.form.moderatorRoles.label')}
													placeholder={getMessage('page.settings.form.moderatorRoles.placeholder')}
													hint={getMessage('page.settings.form.moderatorRoles.hint')}
													onClear={() => setFieldValue('moderatorRoles', [], false)}
													value={values.moderatorRoles}
													onChange={(value) => setFieldValue('moderatorRoles', value, false)}
													multi
													withTags
												>
													{ allRoles.map(({ code, name }) => 
														(<Option key={code} value={code}>{name}</Option>))}
												</Select>
											</GridItem>
											<GridItem col={6} xs={12}>
												<ToggleInput
													name="badWords"
													label={getMessage('page.settings.form.badWords.label')}
													hint={getMessage('page.settings.form.badWords.hint')}
													checked={values.badWords}
													onChange={({ target: { checked } }) => setFieldValue('badWords', checked, false)}
													onLabel={getMessage('compontents.toogle.enabled')}
													offLabel={getMessage('compontents.toogle.disabled')}
												/>
											</GridItem>
											{ isGQLPluginEnabled && (<GridItem col={6} xs={12}>
												<ToggleInput
													name="badWords"
													label={getMessage('page.settings.form.gqlAuth.label')}
													hint={getMessage('page.settings.form.gqlAuth.hint')}
													checked={values.gqlAuthEnabled}
													onChange={({ target: { checked } }) => setFieldValue('gqlAuthEnabled', checked, false)}
													onLabel={getMessage('compontents.toogle.enabled')}
													offLabel={getMessage('compontents.toogle.disabled')}
												/>
											</GridItem>) }
										</Grid>
									</Stack>
								</Box>
								{ !isEmpty(values.enabledCollections) && (<Box {...boxDefaultProps}>
									<Stack size={4}>
										<Typography variant="delta" as="h2">
											{getMessage('page.settings.section.collections')}
										</Typography>
										<Grid gap={4}>
											{ orderBy(values.enabledCollections).map(uid => {
												const { schema: { displayName, attributes = {} } } = allCollections.find(_ => _.uid === uid);
												const stringAttributes = Object.keys(attributes).filter(_ => attributes[_].type === 'string');
												return (<GridItem key={`collectionSettings-${uid}`} col={6} s={12} xs={12}>
													<Card background="primary100" borderColor="primary200">
														<CardBody>
															<CardContent style={{ width: '100%' }}>
																<Stack size={4}>
																	<Typography variant="epsilon" fontWeight="semibold" as="h3">{ displayName }</Typography>
																	<ToggleInput
																		name={`collectionSettings-${uid}-approvalFlow`}
																		label={getMessage('page.settings.form.approvalFlow.label')}
																		hind={getMessage({
																			id: 'page.settings.form.approvalFlow.hint',
																			params: { name: displayName },
																		})}
																		checked={values.approvalFlow.includes(uid)}
																		onChange={({ target: { checked } }) => setFieldValue('approvalFlow', changeApprovalFlowFor(uid, values.approvalFlow, checked), [])}
																		onLabel={getMessage('compontents.toogle.enabled')}
																		offLabel={getMessage('compontents.toogle.disabled')}
																	/>
																	{ !isEmpty(stringAttributes) && (<Select
																		name={`collectionSettings-${uid}-entryLabel`}
																		label={getMessage('page.settings.form.entryLabel.label')}
																		placeholder={getMessage('page.settings.form.entryLabel.placeholder')}
																		hint={getMessage('page.settings.form.entryLabel.hint')}
																		onClear={() => setFieldValue('entryLabel', changeEntryLabelFor(uid, values.entryLabel))}
																		value={values.entryLabel[uid] || []}
																		onChange={(value) => setFieldValue('entryLabel', changeEntryLabelFor(uid, values.entryLabel, value))}
																		multi
																		withTags
																	>
																		{ stringAttributes.map(key => 
																			(<Option key={`collectionSettings-${uid}-entryLabel-${key}`} value={key}>{ capitalize(key.split('_').join(' ')) }</Option>))}
																	</Select>) }
																</Stack>
															</CardContent>
														</CardBody>
													</Card>
												</GridItem>);
											})}
										</Grid>
									</Stack>
								</Box>)}

								<CheckPermissions permissions={pluginPermissions.settingsChange}>
									<Box {...boxDefaultProps}>
										<Stack size={4}>
											<Stack size={2}>
												<Typography variant="delta" textColor="danger700" as="h2">
													{getMessage('page.settings.section.restore')}
												</Typography>
												<Typography variant="pi"as="h4">
													{getMessage('page.settings.section.restore.subtitle')}
												</Typography>
											</Stack>
											<Grid gap={4}>
												<GridItem col={6}>
													<Button variant="danger-light" startIcon={<Refresh />} onClick={handleRestoreConfirmation}>
														{getMessage('page.settings.actions.restore')}
													</Button>

													<ConfirmationDialog 
														isVisible={restoreConfigmationVisible}
														isActionAsync={restoreMutation.isLoading}
														header={getMessage('page.settings.actions.restore.confirmation.header')}
														labelConfirm={getMessage('page.settings.actions.restore.confirmation.button.confirm')}
														iconConfirm={<Refresh />}
														onConfirm={handleRestoreConfiguration} 
														onCancel={handleRestoreCancel}>
															{ getMessage('page.settings.actions.restore.confirmation.description') }
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
}


export default Settings;