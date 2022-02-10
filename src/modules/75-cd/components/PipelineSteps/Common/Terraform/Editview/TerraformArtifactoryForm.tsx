/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  Button,
  ButtonVariation,
  Color,
  Formik,
  FormInput,
  Layout,
  MultiTypeInputType,
  SelectOption,
  StepProps,
  Text,
  useToaster
} from '@wings-software/uicore'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { map } from 'lodash-es'
import cx from 'classnames'
import { FieldArray, Form } from 'formik'

import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { useGetArtifactsBuildsDetailsForArtifactory, useGetRepositoriesDetailsForArtifactory } from 'services/cd-ng'
import examples from './examples.json'
import {
  formatInitialValues,
  terraformArtifactorySchema,
  tfArtifactoryFormINputNames,
  getConnectorRef,
  formatOnSubmitData
} from './TerraformArtifactoryFormHelper'
import type { Connector, PathInterface } from '../TerraformInterfaces'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

import css from './TerraformVarfile.module.scss'

interface TFRemoteProps {
  onSubmitCallBack: (data: any, prevStepData?: any) => void
  isEditMode: boolean
  isReadonly?: boolean
  allowableTypes: MultiTypeInputType[]
  isConfig: boolean
  isTerraformPlan: boolean
}
export const TFArtifactoryForm: React.FC<StepProps<any> & TFRemoteProps> = ({
  previousStep,
  prevStepData,
  onSubmitCallBack,
  allowableTypes,
  isConfig,
  isTerraformPlan
}) => {
  const [selectedRepo, setSelectedRepo] = useState('')
  const [connectorRepos, setConnectorRepos] = useState<SelectOption[]>()
  const [filePathIndex, setFilePathIndex] = useState<{ index: number; path: string }>()
  const [artifacts, setArtifacts] = useState<any>()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { getString } = useStrings()
  const { showError } = useToaster()
  const initialValues = formatInitialValues(isConfig, prevStepData, isTerraformPlan)
  const connectorValue = getConnectorRef(isConfig, isTerraformPlan, prevStepData) as Connector
  const connectorRef = connectorValue?.connector?.identifier
    ? connectorValue.connector.identifier
    : typeof connectorValue === 'string'
    ? connectorValue
    : prevStepData?.identifier
  const {
    data: ArtifactRepoData,
    loading: ArtifactRepoLoading,
    refetch: getArtifactRepos,
    error: ArtifactRepoError
  } = useGetRepositoriesDetailsForArtifactory({
    queryParams: {
      connectorRef: connectorRef,
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
  } = useGetArtifactsBuildsDetailsForArtifactory({
    queryParams: {
      connectorRef: connectorRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repositoryName: selectedRepo,
      maxVersions: 50,
      filePath: filePathIndex?.path
    },
    debounce: 500,
    lazy: true
  })

  useEffect(() => {
    const repoName =
      prevStepData?.varFile?.spec?.store?.spec?.repositoryName ||
      prevStepData.formValues?.spec?.configuration?.configFiles?.store?.spec?.repositoryName ||
      prevStepData.formValues?.spec?.configuration?.spec?.configFiles?.store?.spec?.repositoryName
    if (repoName) {
      setSelectedRepo(repoName)
    }
  }, [prevStepData])

  useEffect(() => {
    if (ArtifactRepoError) {
      showError(ArtifactRepoError.message)
      setConnectorRepos(map(examples.repositories, repo => ({ label: repo, value: repo })))
    }
  }, [ArtifactRepoError])

  useEffect(() => {
    if (ArtifactsError) {
      showError(ArtifactsError.message)
      setArtifacts({
        ...artifacts,
        [`${filePathIndex?.path}-${filePathIndex?.index}`]: map(examples.artifacts, artifact => ({
          label: artifact.artifactName as string,
          value: artifact.artifactPath as string
        }))
      })
    }
  }, [ArtifactsError])

  useEffect(() => {
    if (selectedRepo && filePathIndex?.path) {
      GetArtifacts()
    }
  }, [filePathIndex, selectedRepo])

  useEffect(() => {
    if (Artifacts && !ArtifactsLoading) {
      setArtifacts({
        ...artifacts,
        [`${filePathIndex?.path}-${filePathIndex?.index}`]: map(Artifacts.data, artifact => ({
          label: artifact.artifactName as string,
          value: artifact.artifactPath as string
        }))
      })
    }
  }, [Artifacts])

  useEffect(() => {
    if (!ArtifactRepoData) {
      getArtifactRepos()
    }

    if (ArtifactRepoData) {
      setConnectorRepos(map(ArtifactRepoData.data?.repositories, repo => ({ label: repo, value: repo })))
    }
  }, [ArtifactRepoData])

  const { expressions } = useVariablesExpression()

  return (
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.tfVarStore}>
      <Text font="large" color={Color.GREY_800}>
        {isConfig ? getString('cd.configFileDetails') : getString('cd.varFileDetails')}
      </Text>
      <Formik
        formName="tfRemoteWizardForm"
        initialValues={initialValues}
        enableReinitialize
        validationSchema={terraformArtifactorySchema(isConfig, getString)}
        onSubmit={values => {
          if (isConfig) {
            onSubmitCallBack(values, prevStepData)
          } else {
            const data = formatOnSubmitData(values, prevStepData, connectorRef)
            onSubmitCallBack(data)
          }
        }}
      >
        {formik => {
          const filteredTypes = allowableTypes.filter(type => type === MultiTypeInputType.FIXED)
          return (
            <Form>
              <div className={css.tfRemoteForm}>
                {!isConfig && (
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.Text name="varFile.identifier" label={getString('identifier')} />
                  </div>
                )}

                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Select
                    items={connectorRepos ? connectorRepos : []}
                    name={tfArtifactoryFormINputNames(isConfig).repositoryName}
                    label={getString('pipelineSteps.repoName')}
                    placeholder={getString(ArtifactRepoLoading ? 'common.loading' : 'cd.selectRepository')}
                    disabled={ArtifactRepoLoading}
                    onChange={value => setSelectedRepo(value.value as string)}
                  />
                </div>
                <div className={cx(stepCss.formGroup)}>
                  <MultiTypeFieldSelector
                    name={tfArtifactoryFormINputNames(isConfig).artifacts}
                    label={getString('filePaths')}
                    style={{ width: 370 }}
                    allowedTypes={filteredTypes}
                  >
                    <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
                      <Text font="normal" color={Color.GREY_600}>
                        {getString('common.git.filePath')}
                      </Text>
                      <Text font="normal" color={Color.GREY_600} padding={{ right: '20px' }}>
                        {getString('cd.artifactName')}
                      </Text>
                    </Layout.Horizontal>
                    <FieldArray
                      name={tfArtifactoryFormINputNames(isConfig).artifacts}
                      render={arrayHelpers => {
                        let selectedArtifacts = []
                        if (isConfig) {
                          selectedArtifacts = formik?.values?.spec?.configuration?.configFiles?.store?.spec?.artifacts
                        } else {
                          selectedArtifacts = formik.values?.varFile?.spec?.store?.spec?.artifacts
                        }
                        return (
                          <>
                            {map(
                              selectedArtifacts.length > 0
                                ? selectedArtifacts
                                : [{ artifactFile: { artifactPathExpression: '', name: '', path: '' } }],
                              (path: PathInterface, index: number) => {
                                const key = `${filePathIndex?.path}-${filePathIndex?.index}`
                                const rowArtifacts = artifacts && artifacts[key] ? artifacts[key] : []
                                return (
                                  <Layout.Horizontal
                                    key={`${path}-${index}`}
                                    flex={{ distribution: 'space-between' }}
                                    style={{ alignItems: 'end' }}
                                  >
                                    <Layout.Horizontal
                                      spacing="medium"
                                      style={{ alignItems: 'baseline' }}
                                      className={css.tfContainer}
                                      key={`${path}-${index}`}
                                      draggable={false}
                                    >
                                      <FormInput.MultiTextInput
                                        onChange={val => {
                                          setFilePathIndex({ index, path: val as string })
                                        }}
                                        name={`${
                                          tfArtifactoryFormINputNames(isConfig).artifacts
                                        }[${index}].artifactFile.artifactPathExpression`}
                                        label=""
                                        multiTextInputProps={{
                                          expressions,
                                          allowableTypes: filteredTypes
                                        }}
                                        style={{ width: 240 }}
                                      />
                                      <FormInput.Select
                                        name={`${
                                          tfArtifactoryFormINputNames(isConfig).artifacts
                                        }[${index}].artifactFile.name`}
                                        label=""
                                        items={rowArtifacts}
                                        style={{ width: 240 }}
                                        disabled={ArtifactsLoading}
                                        placeholder={getString(
                                          ArtifactsLoading ? 'common.loading' : 'cd.selectArtifact'
                                        )}
                                        onChange={val => {
                                          formik?.setFieldValue(
                                            `${
                                              tfArtifactoryFormINputNames(isConfig).artifacts
                                            }[${index}].artifactFile.path`,
                                            val.value
                                          )
                                          formik?.setFieldValue(
                                            `${
                                              tfArtifactoryFormINputNames(isConfig).artifacts
                                            }[${index}].artifactFile.name`,
                                            val.label
                                          )
                                        }}
                                      />
                                      {!isConfig && (
                                        <Button
                                          minimal
                                          icon="main-trash"
                                          data-testid={`remove-header-${index}`}
                                          onClick={() => arrayHelpers.remove(index)}
                                        />
                                      )}
                                    </Layout.Horizontal>
                                  </Layout.Horizontal>
                                )
                              }
                            )}
                            {!isConfig && (
                              <Button
                                icon="plus"
                                variation={ButtonVariation.LINK}
                                data-testid="add-header"
                                onClick={() => arrayHelpers.push({ artifactFile: {} })}
                              >
                                {getString('cd.addTFVarFileLabel')}
                              </Button>
                            )}
                          </>
                        )
                      }}
                    />
                  </MultiTypeFieldSelector>
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
