/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  Button,
  Color,
  Formik,
  Layout,
  Text,
  Heading,
  Card,
  Icon,
  ButtonVariation,
  ButtonSize,
  FormInput,
  SelectOption,
  getMultiTypeFromValue,
  MultiTypeInputType,
  StepProps,
  useToaster
} from '@wings-software/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { map } from 'lodash-es'
import { Form } from 'formik'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useGetBuildsDetailsForArtifactory, useGetRepositoriesDetailsForArtifactory } from 'services/cd-ng'
import {
  AllowedTypes,
  tfVarIcons,
  ConnectorMap,
  ConnectorLabelMap,
  ConnectorTypes,
  formInputNames,
  formikOnChangeNames,
  stepTwoValidationSchema
} from './TerraformConfigFormHelper'

import type { Connector } from '../TerraformInterfaces'

import css from './TerraformConfigForm.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface TerraformConfigStepOneProps {
  data: any
  isReadonly: boolean
  allowableTypes: MultiTypeInputType[]
  isEditMode: boolean
  selectedConnector: string
  setConnectorView: (val: boolean) => void
  setSelectedConnector: (val: ConnectorTypes) => void
  isTerraformPlan?: boolean
}

export const TerraformConfigStepOne: React.FC<StepProps<any> & TerraformConfigStepOneProps> = ({
  data,
  isReadonly,
  allowableTypes,
  nextStep,
  setConnectorView,
  selectedConnector,
  setSelectedConnector,
  isTerraformPlan = false
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  useEffect(() => {
    const selectedStore = isTerraformPlan
      ? data?.spec?.configuration?.configFiles?.store?.type
      : data?.spec?.configuration?.spec?.configFiles?.store?.type
    setSelectedConnector(selectedStore)
  }, [])

  const newConnectorLabel = `${getString('newLabel')} ${
    !!selectedConnector && getString(ConnectorLabelMap[selectedConnector as ConnectorTypes])
  } ${getString('connector')}`
  const connectorError = getString('pipelineSteps.build.create.connectorRequiredError')
  const configSchema = {
    configFiles: Yup.object().shape({
      store: Yup.object().shape({
        spec: Yup.object().shape({
          connectorRef: Yup.string().required(connectorError)
        })
      })
    })
  }
  const validationSchema = isTerraformPlan
    ? Yup.object().shape({
        spec: Yup.object().shape({
          configuration: Yup.object().shape({
            ...configSchema
          })
        })
      })
    : Yup.object().shape({
        spec: Yup.object().shape({
          configuration: Yup.object().shape({
            spec: Yup.object().shape({
              ...configSchema
            })
          })
        })
      })

  return (
    <Layout.Vertical padding="small" className={css.tfConfigForm}>
      <Heading level={2} style={{ color: Color.BLACK, fontSize: 24, fontWeight: 'bold' }} margin={{ bottom: 'xlarge' }}>
        {getString('cd.configFileStore')}
      </Heading>
      <Layout.Horizontal className={css.horizontalFlex} margin={{ top: 'xlarge', bottom: 'xlarge' }}>
        {AllowedTypes.map(item => (
          <div key={item} className={css.squareCardContainer}>
            <Card
              className={css.connectorIcon}
              selected={item === selectedConnector}
              data-testid={`varStore-${item}`}
              onClick={() => {
                setSelectedConnector(item as ConnectorTypes)
              }}
            >
              <Icon name={tfVarIcons[item]} size={26} />
            </Card>
            <Text color={Color.BLACK_100}>{item}</Text>
          </div>
        ))}
      </Layout.Horizontal>

      <Formik
        formName="tfPlanConfigForm"
        enableReinitialize={true}
        onSubmit={() => {
          /* istanbul ignore next */
        }}
        initialValues={data}
        validationSchema={validationSchema}
      >
        {formik => {
          const config = formik?.values?.spec?.configuration
          const connectorRef = isTerraformPlan
            ? config?.configFiles?.store?.spec?.connectorRef
            : config?.spec?.configFiles?.store?.spec?.connectorRef
          const disabled =
            !connectorRef || (connectorRef?.connector?.type && connectorRef?.connector?.type !== selectedConnector)
          return (
            <Form className={css.formComponent}>
              <div className={css.formContainerStepOne}>
                {selectedConnector && (
                  <Layout.Horizontal className={css.horizontalFlex} spacing={'medium'}>
                    <FormMultiTypeConnectorField
                      label={
                        <Text style={{ display: 'flex', alignItems: 'center' }}>
                          {ConnectorMap[selectedConnector]} {getString('connector')}
                          <Button
                            icon="question"
                            minimal
                            tooltip={`${ConnectorMap[selectedConnector]} ${getString('connector')}`}
                            iconProps={{ size: 14 }}
                          />
                        </Text>
                      }
                      type={ConnectorMap[selectedConnector]}
                      width={400}
                      name={
                        isTerraformPlan
                          ? 'spec.configuration.configFiles.store.spec.connectorRef'
                          : 'spec.configuration.spec.configFiles.store.spec.connectorRef'
                      }
                      placeholder={getString('select')}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      style={{ marginBottom: 10 }}
                      multiTypeProps={{ expressions, allowableTypes }}
                    />
                    <Button
                      className={css.newConnectorButton}
                      variation={ButtonVariation.LINK}
                      size={ButtonSize.SMALL}
                      disabled={isReadonly}
                      id="new-config-connector"
                      text={newConnectorLabel}
                      icon="plus"
                      iconProps={{ size: 12 }}
                      onClick={() => {
                        setConnectorView(true)
                        nextStep?.({ formValues: data, selectedType: selectedConnector })
                      }}
                    />
                  </Layout.Horizontal>
                )}
              </div>
              <Layout.Horizontal spacing="xxlarge">
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  text={getString('continue')}
                  rightIcon="chevron-right"
                  onClick={() => {
                    nextStep?.({ formValues: formik.values, selectedType: selectedConnector })
                  }}
                  disabled={disabled}
                />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

interface TerraformConfigStepTwoProps {
  allowableTypes: MultiTypeInputType[]
  isReadonly: boolean
  onSubmitCallBack: any
  isTerraformPlan?: boolean
}

export const TerraformConfigStepTwo: React.FC<StepProps<any> & TerraformConfigStepTwoProps> = ({
  previousStep,
  prevStepData,
  onSubmitCallBack,
  isReadonly = false,
  allowableTypes,
  isTerraformPlan = false
}) => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { expressions } = useVariablesExpression()
  const [filePath, setFilePath] = useState<string>()
  const [selectedRepo, setSelectedRepo] = useState('')
  const [artifacts, setArtifacts] = useState<SelectOption[]>()
  const [connectorRepos, setConnectorRepos] = useState<SelectOption[]>()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const isArtifactory = prevStepData.selectedType === 'Artifactory'
  const connectorValue = (
    isTerraformPlan
      ? prevStepData.spec?.configuration?.configFiles?.store?.spec?.connectorRef
      : prevStepData.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef
  ) as Connector
  const {
    data: ArtifactRepoData,
    loading: ArtifactRepoLoading,
    refetch: getArtifactRepos,
    error: ArtifactRepoError
  } = useGetRepositoriesDetailsForArtifactory({
    queryParams: {
      connectorRef: connectorValue.connector?.identifier,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })
  const {
    data: Artifacts,
    loading: ArtifactsLoading,
    refetch: GetArtifacts,
    error: ArtifactsError
  } = useGetBuildsDetailsForArtifactory({
    queryParams: {
      connectorRef: connectorValue.connector?.identifier,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repositoryName: selectedRepo,
      maxVersions: 50,
      filePath: filePath
    },
    debounce: 500,
    lazy: true
  })

  if (ArtifactRepoError) {
    showError(ArtifactRepoError.message)
  }

  if (ArtifactsError) {
    showError(ArtifactsError.message)
  }

  useEffect(() => {
    if (selectedRepo && filePath) {
      GetArtifacts()
    }
  }, [filePath])

  useEffect(() => {
    if (Artifacts && !ArtifactsLoading) {
      setArtifacts(
        map(Artifacts.data, artifact => ({
          label: artifact.artifactName as string,
          value: artifact.artifactPath as string
        }))
      )
    }
  }, [Artifacts])

  useEffect(() => {
    if (isArtifactory && getMultiTypeFromValue(connectorValue) === MultiTypeInputType.FIXED && !ArtifactRepoData) {
      getArtifactRepos()
    }

    if (ArtifactRepoData) {
      setConnectorRepos(map(ArtifactRepoData.data?.repositories, repo => ({ label: repo, value: repo })))
    }
  }, [ArtifactRepoData])
  const gitFetchTypes: SelectOption[] = [
    { label: getString('gitFetchTypes.fromBranch'), value: getString('pipelineSteps.deploy.inputSet.branch') },
    { label: getString('gitFetchTypes.fromCommit'), value: getString('pipelineSteps.commitIdValue') }
  ]
  const validationSchema = stepTwoValidationSchema(isTerraformPlan, getString)

  return (
    <Layout.Vertical padding="small" className={css.tfConfigForm}>
      <Heading level={2} style={{ color: Color.BLACK, fontSize: 24, fontWeight: 'bold' }} margin={{ bottom: 'xlarge' }}>
        {getString('cd.configFileDetails')}
      </Heading>
      <Formik
        formName="tfRemoteWizardForm"
        initialValues={{ ...prevStepData.formValues, isArtifactory: isArtifactory }}
        onSubmit={data => onSubmitCallBack(data, prevStepData)}
        validationSchema={validationSchema}
      >
        {formik => {
          const store = isTerraformPlan
            ? formik.values?.spec?.configuration?.configFiles?.store?.spec
            : formik.values?.spec?.configuration?.spec?.configFiles?.store?.spec
          return (
            <Form className={css.formComponent}>
              <div className={css.tfRemoteForm}>
                {isArtifactory && getMultiTypeFromValue(connectorValue) === MultiTypeInputType.FIXED && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.Select
                      items={connectorRepos ? connectorRepos : []}
                      name={formInputNames(isTerraformPlan).repositoryName}
                      label={getString('pipelineSteps.repoName')}
                      placeholder={ArtifactRepoLoading ? 'Loading...' : 'Select a Repository'}
                      disabled={ArtifactRepoLoading}
                      onChange={value => {
                        setSelectedRepo(value.value as string)
                        formik.setFieldValue(formikOnChangeNames(isTerraformPlan).repositoryName, value.value)
                      }}
                    />
                  </div>
                )}
                {connectorValue?.connector?.spec?.connectionType === 'Account' ||
                  connectorValue?.connector?.spec?.type === 'Account' ||
                  (isArtifactory && getMultiTypeFromValue(connectorValue) !== MultiTypeInputType.FIXED && (
                    <div className={cx(stepCss.formGroup, stepCss.md)}>
                      <FormInput.MultiTextInput
                        label={getString('pipelineSteps.repoName')}
                        name={formInputNames(isTerraformPlan).repoName}
                        placeholder={getString('pipelineSteps.repoName')}
                        multiTextInputProps={{ expressions, allowableTypes: allowableTypes }}
                      />
                      {getMultiTypeFromValue(store?.repoName) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          style={{ alignSelf: 'center', marginTop: 1 }}
                          value={store?.repoName as string}
                          type="String"
                          variableName="configuration.configFiles.store.spec.repoName"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => formik.setFieldValue(formikOnChangeNames(isTerraformPlan).repoName, value)}
                          isReadonly={isReadonly}
                        />
                      )}
                    </div>
                  ))}
                {!isArtifactory && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.Select
                      items={gitFetchTypes}
                      name={formInputNames(isTerraformPlan).gitFetchType}
                      label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                      placeholder={getString('pipeline.manifestType.gitFetchTypeLabel')}
                    />
                  </div>
                )}
                {store?.gitFetchType === gitFetchTypes[0].value && !isArtifactory && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipelineSteps.deploy.inputSet.branch')}
                      placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                      name={formInputNames(isTerraformPlan).branch}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(store?.branch) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginTop: 1 }}
                        value={store?.branch as string}
                        type="String"
                        variableName="configuration.spec.configFiles.store.spec.branch"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue(formikOnChangeNames(isTerraformPlan).branch, value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                )}

                {store?.gitFetchType === gitFetchTypes[1].value && !isArtifactory && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.manifestType.commitId')}
                      placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                      name={formInputNames(isTerraformPlan).commitId}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(store?.commitId) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center', marginTop: 1 }}
                        value={store?.commitId as string}
                        type="String"
                        variableName={formInputNames(isTerraformPlan).commitId}
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue(formikOnChangeNames(isTerraformPlan).commitId, value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                )}

                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.MultiTextInput
                    label={getString('cd.folderPath')}
                    placeholder={getString('pipeline.manifestType.pathPlaceholder')}
                    name={formInputNames(isTerraformPlan).folderPath}
                    multiTextInputProps={{ expressions, allowableTypes }}
                    onChange={value => {
                      formik?.setFieldValue(formikOnChangeNames(isTerraformPlan).artifactPathExpression, value)
                      setFilePath(value as string)
                    }}
                  />
                  {getMultiTypeFromValue(store?.folderPath) === MultiTypeInputType.RUNTIME && !isArtifactory && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center', marginTop: 1 }}
                      value={store?.folderPath as string}
                      type="String"
                      variableName={formInputNames(isTerraformPlan).folderPath}
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => formik.setFieldValue(formikOnChangeNames(isTerraformPlan).folderPath, value)}
                      isReadonly={isReadonly}
                    />
                  )}
                  {getMultiTypeFromValue(connectorValue) === MultiTypeInputType.FIXED && isArtifactory && (
                    <FormInput.Select
                      name={formikOnChangeNames(isTerraformPlan).artifactName}
                      label=""
                      items={artifacts ? artifacts : []}
                      style={{ width: isArtifactory ? 240 : 300 }}
                      disabled={ArtifactsLoading}
                      placeholder={ArtifactsLoading ? 'Loading...' : 'Select a Artifact'}
                      onChange={val => {
                        formik?.setFieldValue(formikOnChangeNames(isTerraformPlan).artifactPath, val.value)
                        formik?.setFieldValue(formikOnChangeNames(isTerraformPlan).artifactName, val.label)
                      }}
                    />
                  )}
                </div>
              </div>

              <Layout.Horizontal spacing="xxlarge">
                <Button
                  text={getString('back')}
                  variation={ButtonVariation.SECONDARY}
                  icon="chevron-left"
                  onClick={() => previousStep?.()}
                  data-name="tf-remote-back-btn"
                />
                <Button
                  type="submit"
                  variation={ButtonVariation.PRIMARY}
                  text={getString('submit')}
                  rightIcon="chevron-right"
                />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
