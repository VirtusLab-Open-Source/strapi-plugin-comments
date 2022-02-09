import React, { useRef, useMemo } from 'react';
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
} from '@strapi/helper-plugin';
import { Main } from '@strapi/design-system/Main';
import { ContentLayout, HeaderLayout } from '@strapi/design-system/Layout';
import { Button } from '@strapi/design-system/Button';
import { Box } from '@strapi/design-system/Box';
import { Stack } from '@strapi/design-system/Stack';
import { Typography } from '@strapi/design-system/Typography';
import { Grid, GridItem } from '@strapi/design-system/Grid';
import { ToggleInput } from '@strapi/design-system/ToggleInput';
import { NumberInput } from '@strapi/design-system/NumberInput';
import { TextInput } from '@strapi/design-system/TextInput';
import { Select, Option } from '@strapi/design-system/Select';
import { useNotifyAT } from '@strapi/design-system/LiveRegions';
import {
  Card,
  CardHeader,
  CardBody,
  CardContent,
  CardBadge,
  CardTitle,
  CardSubtitle,
} from '@strapi/design-system/Card';
import { Check, Refresh } from '@strapi/icons';

import pluginPermissions from '../../permissions';
import useConfig from '../../hooks/useConfig';
import { fetchAllContentTypes } from './utils/api';
import { getMessage, parseRegExp } from '../../utils';


const Settings = () => {
	useFocusWhenNavigate();

	const { notifyStatus } = useNotifyAT();
	const { trackUsage } = useTracking();
	const trackUsageRef = useRef(trackUsage);
	const toggleNotification = useNotification();
  
	const viewPermissions = useMemo(() => ({ 
	  access: pluginPermissions.settings.read,
	  change: pluginPermissions.settings.change,
	}), []);
  
	const {
	  isLoading: isLoadingForPermissions,
	  allowedActions: { canAccess, canChange },
	} = useRBAC(viewPermissions);


	const { fetch, submitMutation, restoreMutation } = useConfig();
	const { data: configData, isLoading: isConfigLoading, err: configErr } = fetch;

	const { data: allCollectionsData, isLoading: isContentTypesLoading, err: contentTypesErr } = useQuery(
		['get-all-content-types', canAccess],
		() => fetchAllContentTypes(toggleNotification)
	  );

	const isLoading = isLoadingForPermissions || isConfigLoading || isContentTypesLoading;
	const isError = configErr || contentTypesErr;

	const preparePayload = payload => {
		return payload;
	};

	const onSave = (form) => {
		submitMutation.mutate(preparePayload(form));
	}

	const onRestore = () => {
		restoreMutation.mutate();
	}

	if (isLoading || isError) {
		return (
			<LoadingIndicatorPage>
				Fetching plugin config...
			</LoadingIndicatorPage>
		)
	}

	const regexUID = !isLoading ? new RegExp(
		parseRegExp(fetch.data.regex?.uid).value,
		parseRegExp(fetch.data.regex?.uid).flags
	) : null;

	const allCollections = !isLoading && allCollectionsData.filter(({ uid }) => first(uid.split(regexUID).filter(s => s && s.length > 0)) === 'api');
	const selectedCollections = configData?.enabledContentTypes?.map(item => item.uid) || [];
	const entryLabel = configData?.entryLabel || {};
	const approvalFlow = configData?.approvalFlow || [];
	const badWords = configData?.badWords || undefined;
	const isGQLPluginEnabled = false;
	const gqlAuthEnabled = configData?.gql?.auth || undefined;
	const configPerCollection = [];
	// const audienceFieldChecked = navigationConfigData?.additionalFields.includes(navigationItemAdditionalFields.AUDIENCE);
	// const allowedLevels = navigationConfigData?.allowedLevels;

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
		[uid]: !value || isEmpty(value) ? [...value] : undefined,
	});

	return (
		<Main>
			<Formik
				initialValues={{
					selectedCollections,
					configPerCollection,
					badWords,
					approvalFlow,
					entryLabel,
					// audienceFieldChecked,
					// allowedLevels,
					// selectedGraphqlTypes: [],
				}}
				onSubmit={onSave}
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
							<Box
								background="neutral0"
								hasRadius
								shadow="filterShadow"
								paddingTop={6}
								paddingBottom={6}
								paddingLeft={7}
								paddingRight={7}
							>
								<Stack size={4}>
									<Typography variant="delta" as="h2">
										{getMessage('page.settings.section.general')}
									</Typography>
									<Grid gap={4}>
										<GridItem col={12}>
											<Select
												name="selectedCollections"
												label={getMessage('page.settings.form.contentTypes.label')}
												placeholder={getMessage('page.settings.form.contentTypes.placeholder')}
												hint={getMessage('page.settings.form.contentTypes.hint')}
												onClear={() => setFieldValue('selectedCollections', [], false)}
												value={values.selectedCollections}
												onChange={(value) => setFieldValue('selectedCollections', value, false)}
												multi
												withTags
											>
												{ allCollections.map(({ uid, schema: { displayName } }) => 
													(<Option key={uid} value={uid}>{displayName}</Option>))}
											</Select>
										</GridItem>
										{ orderBy(values.selectedCollections, ['schema.displayName'], 'asc').map(uid => {
											const { schema: { displayName, attributes = {} } } = allCollections.find(_ => _.uid === uid);
											console.log(attributes);
											const stringAttributes = Object.keys(attributes).filter(_ => attributes[_].type === 'string');
											return (<GridItem key={`collectionSettings-${uid}`} col={4}>
												<Card>
													<CardBody>
														{/* <Box padding={2} background="primary100">
														<Pencil />
														</Box> */}
														<CardContent>
															<Typography variant="epsilon" as="h3">
															{ displayName }
															</Typography>
															<Stack size={2}>
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
																	onClear={() => setFieldValue('entryLabel')}
																	value={values.entryLabel[uid]}
																	onChange={(value) => setFieldValue('entryLabel', changeEntryLabelFor(uid, values.approvalFlow, value))}
																	multi
																	withTags
																>
																	{ stringAttributes.map(key => 
																		(<Option key={`collectionSettings-${uid}-entryLabel-${key}`} value={key}>{ capitalize(key.split('_').join(' ')) }</Option>))}
																</Select>) }
															</Stack>
														</CardContent>
														{/* <TextInput
																name={`collectionSettings-${uid}-approvalFlow`}
																label={getMessage('page.settings.form.allowedLevels.label')}
																placeholder={getMessage('page.settings.form.allowedLevels.placeholder')}
																hint={getMessage('page.settings.form.allowedLevels.hint')}
																onValueChange={(value) => setFieldValue('allowedLevels', value, false)}
																value={values.allowedLevels}
															/> */}
													</CardBody>
												</Card>
											</GridItem>);
										})}

										{/* <GridItem col={6}>
											<NumberInput
												name="allowedLevels"
												label={getMessage('page.settings.form.allowedLevels.label')}
												placeholder={getMessage('page.settings.form.allowedLevels.placeholder')}
												hint={getMessage('page.settings.form.allowedLevels.hint')}
												onValueChange={(value) => setFieldValue('allowedLevels', value, false)}
												value={values.allowedLevels}
											/>
										</GridItem>
										<GridItem col={6} /> */}
										<GridItem col={6} />
										<GridItem col={6}>
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
									</Grid>
									<Typography variant="delta" as="h2">
										{getMessage('page.settings.section.restore')}
									</Typography>
									<Grid gap={4}>
										<GridItem col={6}>
											<CheckPermissions permissions={pluginPermissions.settingsChange}>
												<Button variant="tertiary" startIcon={<Refresh />} onClick={onRestore}>
													{getMessage('page.settings.actions.restore')}
												</Button>
											</CheckPermissions>
										</GridItem>
									</Grid>
								</Stack>
							</Box>
						</ContentLayout>
					</Form>
				)}
			</Formik>
		</Main>
	);
}


export default Settings;