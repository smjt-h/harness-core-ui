/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect } from 'react'
import {
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  Button,
  SelectOption,
  StepProps,
  Text,
  ButtonVariation
} from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import { Form, FormikContext } from 'formik'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { defaultTo, forIn, get, isNil, merge } from 'lodash-es'
import {
  AcrBuildDetailsDTO,
  ConnectorConfigDTO,
  useGetBuildDetailsForACRRepository,
  useGetAzureSubscriptions,
  useGetACRRegistriesBySubscription,
  useGetACRRepositories
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { getHelpeTextForTags } from '@pipeline/utils/stageHelpers'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { useQueryParams } from '@common/hooks'
import {
  checkIfQueryParamsisNotEmpty,
  getArtifactFormData,
  getConnectorIdValue,
  getFinalArtifactObj,
  helperTextData,
  resetTag,
  shouldFetchTags
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type {
  ACRArtifactType,
  ArtifactType,
  ACRArtifactProps
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ArtifactIdentifierValidation, ModalViewFor, tagOptions } from '../../../ArtifactHelper'
import { NoTagResults } from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import SideCarArtifactIdentifier from '../SideCarArtifactIdentifier'
import css from '../../ArtifactConnector.module.scss'

export function ACRArtifact({
  context,
  handleSubmit,
  expressions,
  allowableTypes,
  prevStepData,
  initialValues,
  previousStep,
  artifactIdentifiers,
  isReadonly = false,
  selectedArtifact
}: StepProps<ConnectorConfigDTO> & ACRArtifactProps): React.ReactElement {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [tagList, setTagList] = React.useState([])
  const [subscriptions, setSubscriptions] = React.useState<SelectOption[]>([])
  const [registries, setRegistries] = React.useState<SelectOption[]>([])
  const [repositories, setRepositories] = React.useState<SelectOption[]>([])
  const [lastQueryData, setLastQueryData] = React.useState<{
    subscription: string
    registry: string
    repository: string
  }>({
    subscription: '',
    registry: '',
    repository: ''
  })

  const formikRef = React.useRef<FormikContext<ACRArtifactType>>()

  const schemaObject = {
    subscription: Yup.string().required(getString('pipeline.ACR.validation.subscription')),
    registry: Yup.string().required(getString('pipeline.ACR.validation.registry')),
    repository: Yup.string().required(getString('pipeline.ACR.validation.repository')),
    tagRegex: Yup.string().when('tagType', {
      is: 'regex',
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.tagRegex'))
    }),
    tag: Yup.mixed().when('tagType', {
      is: 'value',
      then: Yup.mixed().required(getString('pipeline.artifactsSelection.validation.tag'))
    })
  }

  const primarySchema = Yup.object().shape(schemaObject)
  const sideCarSchema = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  const getConnectorRefQueryData = (): string => {
    return defaultTo(prevStepData?.connectorId?.value, prevStepData?.identifier)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getValue = (item: { label?: string; value?: string } | string | any): string => {
    return typeof item === 'string' ? (item as string) : item?.value
  }

  const {
    data: acrBuildData,
    loading: acrBuildDetailsLoading,
    refetch: refetchAcrBuildData,
    error: acrTagError
  } = useGetBuildDetailsForACRRepository({
    queryParams: {
      subscription: getValue(lastQueryData?.subscription),
      registry: getValue(lastQueryData?.registry),
      repository: getValue(lastQueryData?.repository),
      connectorRef: getConnectorRefQueryData(),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    lazy: true
  })
  useEffect(() => {
    /* istanbul ignore next */
    if (acrTagError) {
      setTagList([])
    } /* istanbul ignore next */ else if (Array.isArray(acrBuildData?.data?.buildDetailsList)) {
      setTagList(acrBuildData?.data?.buildDetailsList as [])
    }
  }, [acrBuildData, acrTagError])

  useEffect(() => {
    /* istanbul ignore next */
    if (checkIfQueryParamsisNotEmpty(Object.values(lastQueryData))) {
      refetchAcrBuildData()
    }
  }, [lastQueryData, prevStepData, refetchAcrBuildData])

  const {
    data: subscriptionsData,
    loading: loadingSubscriptions,
    error: subscriptionsError
  } = useGetAzureSubscriptions({
    queryParams: {
      connectorRef: getConnectorRefQueryData(),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  useEffect(() => {
    const subscriptionValues = [] as SelectOption[]
    forIn(defaultTo(subscriptionsData?.data, {}), (value: string, key: string) => {
      subscriptionValues.push({ label: value, value: key })
    })

    setSubscriptions(subscriptionValues as SelectOption[])
  }, [subscriptionsData])

  const {
    data: registiresData,
    refetch: refetchRegistries,
    loading: loadingRegistries,
    error: registriesError
  } = useGetACRRegistriesBySubscription({
    queryParams: {
      connectorRef: getConnectorRefQueryData(),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      subscription: initialValues?.subscription
    },
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    /* istanbul ignore else */
    if (
      initialValues?.subscription &&
      getMultiTypeFromValue(initialValues?.subscription) === MultiTypeInputType.FIXED &&
      initialValues?.registry &&
      getMultiTypeFromValue(initialValues?.registry) === MultiTypeInputType.FIXED
    ) {
      refetchRegistries({
        queryParams: {
          connectorRef: getConnectorRefQueryData(),
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          subscription: getValue(initialValues.subscription)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues?.subscription, initialValues?.registry])

  useEffect(() => {
    const options =
      defaultTo(registiresData?.data, []).map(registry => ({
        label: registry,
        value: registry
      })) || /* istanbul ignore next */ []

    setRegistries(options)
  }, [registiresData])

  const {
    data: repositoriesData,
    refetch: refetchRepositories,
    loading: loadingRepositories,
    error: repositoriesError
  } = useGetACRRepositories({
    queryParams: {
      connectorRef: getConnectorRefQueryData(),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      subscription: initialValues?.subscription
    },
    registry: initialValues?.registry,
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    /* istanbul ignore else */
    if (
      initialValues?.subscription &&
      getMultiTypeFromValue(initialValues?.subscription) === MultiTypeInputType.FIXED &&
      initialValues?.registry &&
      getMultiTypeFromValue(initialValues?.registry) === MultiTypeInputType.FIXED &&
      initialValues?.repository &&
      getMultiTypeFromValue(initialValues?.repository) === MultiTypeInputType.FIXED
    ) {
      refetchRepositories({
        queryParams: {
          connectorRef: getConnectorRefQueryData(),
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          subscription: getValue(initialValues.subscription)
        },
        pathParams: {
          registry: getValue(initialValues.registry)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues?.subscription, initialValues?.registry, initialValues?.repository])

  useEffect(() => {
    const options =
      defaultTo(repositoriesData?.data, []).map(repository => ({
        label: repository,
        value: repository
      })) || /* istanbul ignore next */ []
    setRepositories(options)
  }, [repositoriesData])

  const fetchTags = (subscription = '', registry = '', repository = ''): void => {
    /* istanbul ignore next */
    if (canFetchTags(subscription, registry, repository)) {
      setLastQueryData({ subscription, registry, repository })
    }
  }
  const canFetchTags = useCallback(
    /* istanbul ignore next */
    (subscription: string, registry: string, repository: string): boolean =>
      !!(
        (lastQueryData?.subscription !== subscription ||
          lastQueryData?.registry !== registry ||
          lastQueryData?.repository !== repository) &&
        shouldFetchTags(prevStepData, [subscription, registry, repository])
      ),
    [lastQueryData, prevStepData]
  )

  const isTagDisabled = useCallback((formikValue): boolean => {
    return !checkIfQueryParamsisNotEmpty([formikValue?.subscription, formikValue?.registry, formikValue?.repository])
  }, [])

  const getInitialValues = useCallback((): ACRArtifactType => {
    const values = getArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      context === ModalViewFor.SIDECAR
    ) as ACRArtifactType

    /* istanbul ignore else */
    if (getMultiTypeFromValue(values?.subscription) === MultiTypeInputType.FIXED) {
      const value = values?.subscription ? values?.subscription : formikRef?.current?.values?.subscription.value
      values.subscription = subscriptions.find(subscription => subscription.value === value) || {
        label: value,
        value: value
      }

      formikRef?.current?.setFieldValue('subscription', values.subscription)
    }
    /* istanbul ignore else */
    if (getMultiTypeFromValue(values?.registry) === MultiTypeInputType.FIXED) {
      values.registry = {
        label: values.registry,
        value: values.registry
      }
    }
    /* istanbul ignore else */
    if (getMultiTypeFromValue(values?.repository) === MultiTypeInputType.FIXED) {
      values.repository = {
        label: values.repository,
        value: values.repository
      }
    }

    return { ...values, ...initialValues }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, initialValues, subscriptions, registries, repositories, selectedArtifact])

  const submitFormData = (formData: ACRArtifactType & { connectorId?: string }): void => {
    const artifactObj = getFinalArtifactObj(formData, context === ModalViewFor.SIDECAR)
    merge(artifactObj.spec, {
      subscription: formData?.subscription,
      registry: formData?.registry,
      repository: formData?.repository
    })
    handleSubmit(artifactObj)
  }

  const getSelectItems = useCallback(() => {
    return (tagList as AcrBuildDetailsDTO[])?.map(tag => ({ label: tag.tag, value: tag.tag })) as SelectOption[]
  }, [tagList])

  const tags = acrBuildDetailsLoading
    ? /* istanbul ignore next */ [{ label: 'Loading Tags...', value: 'Loading Tags...' }]
    : getSelectItems()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resetTagList = (formik: any): void => {
    tagList.length && setTagList([])
    resetTag(formik)
  }

  useEffect(() => {
    /* istanbul ignore else */
    if (!isNil(formikRef?.current?.values?.tag)) {
      /* istanbul ignore else */
      if (getMultiTypeFromValue(formikRef?.current?.values?.tag) !== MultiTypeInputType.FIXED) {
        formikRef?.current?.setFieldValue('tagRegex', formikRef?.current?.values?.tag)
      } else {
        formikRef?.current?.setFieldValue('tagRegex', '')
      }
    }
  }, [formikRef?.current?.values?.tag])

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        validationSchema={context === ModalViewFor.SIDECAR ? sideCarSchema : primarySchema}
        formName="acrArtifact"
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData,
            connectorId: getConnectorIdValue(prevStepData),
            subscription: getValue(formData.subscription),
            registry: getValue(formData.registry),
            repository: getValue(formData.repository)
          })
        }}
        enableReinitialize={true}
      >
        {formik => {
          formikRef.current = formik
          return (
            <Form>
              <div className={css.connectorForm}>
                {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTypeInput
                    name="subscription"
                    selectItems={subscriptions}
                    multiTypeInputProps={{
                      onChange: value => {
                        refetchRegistries({
                          queryParams: {
                            connectorRef: getConnectorRefQueryData(),
                            accountIdentifier: accountId,
                            orgIdentifier,
                            projectIdentifier,
                            subscription: getValue(value)
                          }
                        })
                        resetTagList(formik)
                      },
                      selectProps: {
                        defaultSelectedItem: formik.values.subscription,
                        items: subscriptions,
                        allowCreatingNewItems: true,
                        addClearBtn: !(loadingSubscriptions || isReadonly),
                        noResults: (
                          <Text padding={'small'}>
                            {get(subscriptionsError, 'data.message', null) ||
                              getString('pipeline.ACR.subscriptionError')}
                          </Text>
                        )
                      }
                    }}
                    label={getString('pipeline.ACR.subscription')}
                    disabled={loadingSubscriptions || isReadonly}
                    placeholder={
                      loadingSubscriptions
                        ? /* istanbul ignore next */ getString('loading')
                        : getString('pipeline.ACR.subscriptionPlaceholder')
                    }
                  />

                  {getMultiTypeFromValue(getValue(formik.values.subscription)) === MultiTypeInputType.RUNTIME && (
                    <div className={css.configureOptions}>
                      <ConfigureOptions
                        value={formik.values?.subscription}
                        type="String"
                        variableName="subscription"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        isReadonly={isReadonly}
                        onChange={value => {
                          formik.setFieldValue('subscription', value)
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTypeInput
                    name="registry"
                    selectItems={registries}
                    disabled={loadingRegistries || isReadonly}
                    placeholder={
                      loadingRegistries
                        ? /* istanbul ignore next */ getString('loading')
                        : getString('pipeline.ACR.registryPlaceholder')
                    }
                    multiTypeInputProps={{
                      expressions,
                      disabled: isReadonly,
                      onChange: value => {
                        refetchRepositories({
                          queryParams: {
                            connectorRef: getConnectorRefQueryData(),
                            accountIdentifier: accountId,
                            orgIdentifier,
                            projectIdentifier,
                            subscription: getValue(formik.values.subscription)
                          },
                          pathParams: {
                            registry: getValue(value)
                          }
                        })
                        resetTagList(formik)
                      },
                      selectProps: {
                        defaultSelectedItem: formik.values.registry,
                        items: registries,
                        allowCreatingNewItems: true,
                        addClearBtn: !(loadingRegistries || isReadonly),
                        noResults: (
                          <Text padding={'small'}>
                            {get(registriesError, 'data.message', null) || getString('pipeline.ACR.registryError')}
                          </Text>
                        )
                      },
                      allowableTypes
                    }}
                    label={getString('pipeline.ACR.registry')}
                  />
                  {getMultiTypeFromValue(getValue(formik.values.registry)) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={formik.values.registry}
                      type="String"
                      variableName="registry"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      isReadonly={isReadonly}
                      onChange={value => {
                        formik.setFieldValue('registry', value)
                      }}
                    />
                  )}
                </div>
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTypeInput
                    name="repository"
                    selectItems={repositories}
                    disabled={loadingRepositories || isReadonly}
                    placeholder={
                      loadingRepositories
                        ? /* istanbul ignore next */ getString('loading')
                        : getString('pipeline.ACR.repositoryPlaceholder')
                    }
                    multiTypeInputProps={{
                      expressions,
                      disabled: isReadonly,
                      onChange: () => resetTagList(formik),
                      selectProps: {
                        items: repositories,
                        allowCreatingNewItems: true,
                        defaultSelectedItem: formik.values.repository,
                        addClearBtn: !(loadingRepositories || isReadonly),
                        noResults: (
                          <Text padding={'small'}>
                            {get(repositoriesError, 'data.message', null) || getString('pipeline.ACR.repositoryError')}
                          </Text>
                        )
                      },
                      allowableTypes
                    }}
                    label={getString('repository')}
                  />
                  {getMultiTypeFromValue(getValue(formik.values.repository)) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={formik.values.repository}
                      type="String"
                      variableName="repository"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      isReadonly={isReadonly}
                      onChange={value => {
                        formik.setFieldValue('repository', value)
                      }}
                    />
                  )}
                </div>
                <div className={css.tagGroup}>
                  <FormInput.RadioGroup
                    name="tagType"
                    radioGroup={{ inline: true }}
                    items={tagOptions}
                    className={css.radioGroup}
                  />
                </div>
                {formik.values?.tagType === 'value' ? (
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTypeInput
                      selectItems={tags}
                      disabled={isTagDisabled(formik?.values)}
                      helperText={
                        getMultiTypeFromValue(formik.values?.tag) === MultiTypeInputType.FIXED &&
                        selectedArtifact &&
                        getHelpeTextForTags(
                          helperTextData(selectedArtifact, formik, getConnectorIdValue(prevStepData)),
                          getString
                        )
                      }
                      multiTypeInputProps={{
                        expressions,
                        allowableTypes,
                        selectProps: {
                          defaultSelectedItem: formik.values?.tag,
                          noResults: <NoTagResults tagError={acrTagError} />,
                          items: tags,
                          addClearBtn: true,
                          allowCreatingNewItems: true
                        },
                        onFocus: /* istanbul ignore next */ (e: React.FocusEvent<HTMLInputElement>) => {
                          if (
                            e?.target?.type !== 'text' ||
                            (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                          ) {
                            return
                          }
                          fetchTags(formik.values.subscription, formik.values.registry, formik.values.repository)
                        }
                      }}
                      label={getString('tagLabel')}
                      name="tag"
                      className={css.tagInputButton}
                    />

                    {getMultiTypeFromValue(formik.values.tag) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          value={formik.values.tag}
                          type="String"
                          variableName="tag"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={
                            /* istanbul ignore next */ value => {
                              formik.setFieldValue('tag', value)
                            }
                          }
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                ) : null}

                {formik.values?.tagType === 'regex' ? (
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('tagRegex')}
                      name="tagRegex"
                      placeholder={getString('pipeline.artifactsSelection.existingDocker.enterTagRegex')}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values.tagRegex) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          value={formik.values.tagRegex}
                          type="String"
                          variableName="tagRegex"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={
                            /* istanbul ignore next */ value => {
                              formik.setFieldValue('tagRegex', value)
                            }
                          }
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <Layout.Horizontal spacing="medium">
                <Button
                  variation={ButtonVariation.SECONDARY}
                  text={getString('back')}
                  icon="chevron-left"
                  onClick={() => {
                    previousStep?.(prevStepData)
                  }}
                />
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
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
