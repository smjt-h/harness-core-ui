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
  getMultiTypeFromValue,
  Icon,
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
import * as Yup from 'yup'
import { FieldArray, Form } from 'formik'

import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { useGetBuildsDetailsForArtifactory, useGetRepositoriesDetailsForArtifactory } from 'services/cd-ng'

import { Connector, PathInterface, RemoteVar, TerraformStoreTypes } from '../TerraformInterfaces'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

import css from './TerraformVarfile.module.scss'

interface TFRemoteProps {
  onSubmitCallBack: (data: RemoteVar) => void
  isEditMode: boolean
  isReadonly?: boolean
  allowableTypes: MultiTypeInputType[]
}
export const TFArtifactoryForm: React.FC<StepProps<any> & TFRemoteProps> = ({
  previousStep,
  prevStepData,
  onSubmitCallBack,
  isEditMode,
  allowableTypes
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
  const initialValues = isEditMode
    ? {
        varFile: {
          identifier: prevStepData?.varFile?.identifier,
          type: TerraformStoreTypes.Remote,
          spec: {
            store: {
              spec: {
                repositoryName: prevStepData?.varFile?.spec?.store?.spec?.repositoryName,
                artifacts: prevStepData?.varFile?.spec?.store?.spec?.artifacts
              }
            }
          }
        }
      }
    : {
        varFile: {
          type: TerraformStoreTypes.Remote,
          spec: {
            store: {
              spec: {
                repositoryName: '',
                artifacts: []
              }
            }
          }
        }
      }
  const connectorValue = prevStepData?.varFile?.spec?.store?.spec?.connectorRef as Connector
  const isArtifactory = prevStepData.selectedType === 'Artifactory'
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
      filePath: filePathIndex?.path
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
    if (prevStepData?.varFile?.spec?.store?.spec?.repositoryName) {
      setSelectedRepo(prevStepData?.varFile?.spec?.store?.spec?.repositoryName)
    }
  }, [prevStepData])

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
    if (isArtifactory && !ArtifactRepoData) {
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
        {getString('cd.varFileDetails')}
      </Text>
      <Formik
        formName="tfRemoteWizardForm"
        initialValues={{ ...initialValues }}
        onSubmit={values => {
          /* istanbul ignore next */
          const payload = {
            ...values,
            connectorRef: prevStepData?.varFile?.spec?.store?.spec?.connectorRef
          }
          /* istanbul ignore next */
          const data = {
            varFile: {
              type: payload.varFile.type,
              identifier: payload.varFile.identifier,
              spec: {
                store: {
                  /* istanbul ignore next */
                  type: payload.connectorRef?.connector?.type || prevStepData?.selectedType,
                  spec: {
                    ...payload.varFile.spec?.store?.spec,
                    connectorRef: payload.connectorRef
                      ? getMultiTypeFromValue(payload?.connectorRef) === MultiTypeInputType.RUNTIME
                        ? payload?.connectorRef
                        : payload.connectorRef?.value
                      : prevStepData.identifier || ''
                  }
                }
              }
            }
          }

          window.console.log('data', data)
          /* istanbul ignore else */
          onSubmitCallBack(data)
        }}
        validationSchema={Yup.object().shape({
          isArtifactory: Yup.boolean(),
          varFile: Yup.object().shape({
            identifier: Yup.string().required(getString('common.validation.identifierIsRequired')),
            spec: Yup.object().shape({
              store: Yup.object().shape({
                spec: Yup.object().shape({
                  artifacts: Yup.array()
                })
              })
            })
          })
        })}
      >
        {formik => {
          return (
            <Form>
              <div className={css.tfRemoteForm}>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Text name="varFile.identifier" label={getString('identifier')} />
                </div>

                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Select
                    items={connectorRepos ? connectorRepos : []}
                    name="varFile.spec.store.spec.repositoryName"
                    label={getString('pipelineSteps.repoName')}
                    placeholder={ArtifactRepoLoading ? 'Loading...' : 'Select a Repository'}
                    disabled={ArtifactRepoLoading}
                    onChange={value => setSelectedRepo(value.value as string)}
                  />
                </div>
                <div className={cx(stepCss.formGroup)}>
                  <MultiTypeFieldSelector
                    name={'varFile.spec.store.spec.artifacts'}
                    label={getString('filePaths')}
                    style={{ width: 370 }}
                    allowedTypes={allowableTypes.filter(item => item !== MultiTypeInputType.EXPRESSION)}
                  >
                    <Layout.Horizontal className={css.artifactHeader} flex={{ justifyContent: 'space-between' }}>
                      <Text font="normal" color={Color.GREY_600}>
                        File Path
                      </Text>
                      <Text font="normal" color={Color.GREY_600}>
                        Artifact Name
                      </Text>
                    </Layout.Horizontal>
                    <FieldArray
                      name={'varFile.spec.store.spec.artifacts'}
                      render={arrayHelpers => {
                        const selectedArtifacts = formik.values?.varFile?.spec?.store?.spec?.artifacts
                        return (
                          <>
                            {map(selectedArtifacts || [], (path: PathInterface, index: number) => {
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
                                    <Icon name="drag-handle-vertical" className={css.drag} />
                                    <Text width={12}>{`${index + 1}.`}</Text>
                                    <FormInput.MultiTextInput
                                      onChange={val => {
                                        setFilePathIndex({ index, path: val as string })
                                      }}
                                      name={`varFile.spec.store.spec.artifacts[${index}].artifactFile.artifactPathExpression`}
                                      label=""
                                      multiTextInputProps={{
                                        expressions,
                                        allowableTypes: allowableTypes.filter(
                                          item => item !== MultiTypeInputType.RUNTIME
                                        )
                                      }}
                                      style={{ width: 240 }}
                                    />
                                    <FormInput.Select
                                      name={`varFile.spec.store.spec.artifacts[${index}].artifactFile.name`}
                                      label=""
                                      items={rowArtifacts}
                                      style={{ width: 240 }}
                                      disabled={ArtifactsLoading}
                                      placeholder={ArtifactsLoading ? 'Loading...' : 'Select a Artifact'}
                                      onChange={val => {
                                        formik?.setFieldValue(
                                          `varFile.spec.store.spec.artifacts[${index}].artifactFile.path`,
                                          val.value
                                        )
                                        formik?.setFieldValue(
                                          `varFile.spec.store.spec.artifacts[${index}].artifactFile.name`,
                                          val.label
                                        )
                                      }}
                                    />
                                    <Button
                                      minimal
                                      icon="main-trash"
                                      data-testid={`remove-header-${index}`}
                                      onClick={() => arrayHelpers.remove(index)}
                                    />
                                  </Layout.Horizontal>
                                </Layout.Horizontal>
                              )
                            })}
                            <Button
                              icon="plus"
                              variation={ButtonVariation.LINK}
                              data-testid="add-header"
                              onClick={() => arrayHelpers.push({ artifactFile: {} })}
                            >
                              {getString('cd.addTFVarFileLabel')}
                            </Button>
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
