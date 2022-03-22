/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  IconName,
  Text,
  Layout,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Icon,
  SelectOption,
  Accordion
} from '@wings-software/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { debounce, noop, isEmpty, get, set, defaultTo } from 'lodash-es'
import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import {
  getConnectorListV2Promise,
  AzureInfrastructure,
  useGetSubscriptionsForAzure,
  useGetResourceGroupsForAzure,
  useGetClustersForAzure,
  getSubscriptionsForAzurePromise,
  getResourceGroupsForAzurePromise,
  getClustersForAzurePromise
} from 'services/cd-ng'
import {
  ConnectorReferenceDTO,
  FormMultiTypeConnectorField
} from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'

import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'

import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import { getConnectorName, getConnectorValue } from '@pipeline/components/PipelineSteps/Steps/StepsHelper'
import { Connectors } from '@connectors/constants'
import { getConnectorSchema, getNameSpaceSchema, getReleaseNameSchema } from '../PipelineStepsUtil'
import css from './AzureInfrastructureSpec.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const logger = loggerFor(ModuleName.CD)
type AzureInfrastructureTemplate = { [key in keyof AzureInfrastructure]: string }

const subscriptionLabel = 'connectors.ACR.subscription'
const resourceGroupLabel = 'common.resourceGroupLabel'
const clusterLabel = 'common.cluster'
const errorMessage = 'data.message'
const yamlErrorMessage = 'cd.parsingYamlError'

function getValidationSchema(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    connectorRef: getConnectorSchema(getString),
    subscription: Yup.string().required(getString(subscriptionLabel)),
    resourceGroup: Yup.string().required(getString(resourceGroupLabel)),
    cluster: Yup.string().required(getString(clusterLabel)),
    namespace: getNameSpaceSchema(getString),
    releaseName: getReleaseNameSchema(getString)
  })
}
interface AzureInfrastructureSpecEditableProps {
  initialValues: AzureInfrastructure
  allValues?: AzureInfrastructure
  onUpdate?: (data: AzureInfrastructure) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: AzureInfrastructureTemplate
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: AzureInfrastructure
  allowableTypes: MultiTypeInputType[]
}

interface AzureInfrastructureUI extends Omit<AzureInfrastructure, 'subscription' | 'cluster' | 'resourceGroup'> {
  subscription?: any
  cluster?: any
  resourceGroup?: any
}

const AzureInfrastructureSpecEditable: React.FC<AzureInfrastructureSpecEditableProps> = ({
  initialValues,
  onUpdate,
  readonly,
  allowableTypes
}): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [subscriptions, setSubscriptions] = React.useState<SelectOption[]>([])
  const [clusters, setClusters] = React.useState<SelectOption[]>([])
  const [resourceGroups, setResourceGroups] = React.useState<SelectOption[]>([])
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()

  const {
    data: subscriptionsData,
    refetch: refetchSubscriptionsData,
    loading: loadingSubscriptionsData,
    error: subscriptionsError
  } = useGetSubscriptionsForAzure({
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    const options =
      subscriptionsData?.data?.map(name => ({ label: name, value: name })) || /* istanbul ignore next */ []
    setSubscriptions(options)
  }, [subscriptionsData])

  useEffect(() => {
    if (initialValues.connectorRef && getMultiTypeFromValue(initialValues.connectorRef) === MultiTypeInputType.FIXED) {
      refetchSubscriptionsData({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          connectorRef: initialValues.connectorRef
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues.connectorRef])

  const {
    data: resourceGroupData,
    refetch: refetchResourceGroups,
    loading: loadingResourceGroupsData,
    error: resourceGroupsError
  } = useGetResourceGroupsForAzure({
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    const options =
      resourceGroupData?.data?.map(name => ({ label: name, value: name })) || /* istanbul ignore next */ []
    setResourceGroups(options)
  }, [resourceGroupData])

  useEffect(() => {
    if (
      initialValues.connectorRef &&
      getMultiTypeFromValue(initialValues.connectorRef) === MultiTypeInputType.FIXED &&
      initialValues.subscription &&
      getMultiTypeFromValue(initialValues.subscription) === MultiTypeInputType.FIXED
    ) {
      refetchResourceGroups({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          connectorRef: initialValues.connectorRef,
          subscription: initialValues.subscription
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues.connectorRef, initialValues.subscription])

  const {
    data: clustersData,
    refetch: refetchClustersData,
    loading: loadingClustersData,
    error: clustersError
  } = useGetClustersForAzure({
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    const options = clustersData?.data?.map(name => ({ label: name, value: name })) || /* istanbul ignore next */ []
    setClusters(options)
  }, [clustersData])

  useEffect(() => {
    if (
      initialValues.connectorRef &&
      getMultiTypeFromValue(initialValues.connectorRef) === MultiTypeInputType.FIXED &&
      initialValues.subscription &&
      getMultiTypeFromValue(initialValues.subscription) === MultiTypeInputType.FIXED &&
      initialValues.resourceGroup &&
      getMultiTypeFromValue(initialValues.resourceGroup) === MultiTypeInputType.FIXED
    ) {
      refetchClustersData({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          connectorRef: initialValues.connectorRef,
          subscription: initialValues.subscription,
          resourceGroup: initialValues.resourceGroup
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues.connectorRef, initialValues.subscription, initialValues.resourceGroup])

  const getValue = (value: { label?: string; value?: string } | string | any): string => {
    return typeof value === 'string' ? value : value?.value
  }

  const getInitialValues = (): AzureInfrastructureUI => {
    const values: AzureInfrastructureUI = {
      ...initialValues
    }

    if (getMultiTypeFromValue(initialValues.subscription) === MultiTypeInputType.FIXED) {
      values.subscription = { label: initialValues.subscription, value: initialValues.subscription }
    }

    if (getMultiTypeFromValue(initialValues.cluster) === MultiTypeInputType.FIXED) {
      values.cluster = { label: initialValues.cluster, value: initialValues.cluster }
    }

    if (getMultiTypeFromValue(initialValues.resourceGroup) === MultiTypeInputType.FIXED) {
      values.resourceGroup = { label: initialValues.resourceGroup, value: initialValues.resourceGroup }
    }

    return values
  }

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Layout.Vertical spacing="medium">
      <Formik<AzureInfrastructureUI>
        formName="azureInfra"
        initialValues={getInitialValues()}
        validate={value => {
          const data: Partial<AzureInfrastructure> = {
            namespace: value.namespace === '' ? /* istanbul ignore next */ undefined : value.namespace,
            releaseName: value.releaseName === '' ? /* istanbul ignore next */ undefined : value.releaseName,
            connectorRef: undefined,
            subscription:
              getValue(value.subscription) === '' ? /* istanbul ignore next */ undefined : getValue(value.subscription),
            resourceGroup:
              getValue(value.resourceGroup) === ''
                ? /* istanbul ignore next */ undefined
                : getValue(value.resourceGroup),
            cluster: getValue(value.cluster) === '' ? /* istanbul ignore next */ undefined : getValue(value.cluser),
            allowSimultaneousDeployments: value.allowSimultaneousDeployments
          }
          /* istanbul ignore else */ if (value.connectorRef) {
            data.connectorRef = value.connectorRef?.value || /* istanbul ignore next */ value.connectorRef
          }

          delayedOnUpdate(data)
        }}
        validationSchema={getValidationSchema(getString)}
        onSubmit={noop}
      >
        {formik => {
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.INFRASTRUCTURE }))
          formikRef.current = formik
          return (
            <FormikForm>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormMultiTypeConnectorField
                  name="connectorRef"
                  label={getString('connector')}
                  placeholder={getString('connectors.selectConnector')}
                  disabled={readonly}
                  accountIdentifier={accountId}
                  multiTypeProps={{ expressions, allowableTypes }}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  width={450}
                  connectorLabelClass={css.connectorRef}
                  enableConfigureOptions={false}
                  style={{ marginBottom: 'var(--spacing-large)' }}
                  type={Connectors.AZURE}
                  onChange={(value: any, _valueType, type) => {
                    /* istanbul ignore next */
                    if (type === MultiTypeInputType.FIXED && value.record) {
                      const { record, scope } = value as unknown as { record: ConnectorReferenceDTO; scope: Scope }
                      const connectorRef =
                        scope === Scope.ORG || scope === Scope.ACCOUNT
                          ? `${scope}.${record.identifier}`
                          : record.identifier
                      refetchSubscriptionsData({
                        queryParams: {
                          accountIdentifier: accountId,
                          projectIdentifier,
                          orgIdentifier,
                          connectorRef
                        }
                      })
                    }
                  }}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                />
                {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.connectorRef as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Icon name={getIconByType(Connectors.AZURE)}></Icon>
                        <Text>{getString('pipelineSteps.gcpConnectorLabel')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="connectorRef"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      /* istanbul ignore next */
                      formik.setFieldValue('connectorRef', value)
                    }}
                    isReadonly={readonly}
                  />
                )}
              </Layout.Horizontal>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTypeInput
                  name="subscription"
                  className={css.inputWidth}
                  selectItems={subscriptions}
                  disabled={loadingSubscriptionsData || readonly}
                  placeholder={
                    loadingSubscriptionsData
                      ? /* istanbul ignore next */ getString('loading')
                      : getString('cd.steps.azureInfraStep.subscriptionPlaceholder')
                  }
                  multiTypeInputProps={{
                    expressions,
                    disabled: readonly,
                    selectProps: {
                      items: subscriptions,
                      allowCreatingNewItems: true,
                      addClearBtn: !(loadingSubscriptionsData || readonly),
                      noResults: (
                        <Text padding={'small'}>
                          {get(subscriptionsError, errorMessage, null) ||
                            getString('cd.pipelineSteps.infraTab.subscriptionError')}
                        </Text>
                      )
                    },
                    allowableTypes
                  }}
                  label={getString(subscriptionLabel)}
                />
                {getMultiTypeFromValue(getValue(formik.values.subscription)) === MultiTypeInputType.RUNTIME &&
                  !readonly && (
                    <ConfigureOptions
                      value={getValue(formik.values.subscription)}
                      type="String"
                      variableName="subscription"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        /* istanbul ignore next */
                        formik.setFieldValue('subscription', value)
                      }}
                      isReadonly={readonly}
                    />
                  )}
              </Layout.Horizontal>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTypeInput
                  name="resourceGroup"
                  className={css.inputWidth}
                  selectItems={resourceGroups}
                  disabled={loadingResourceGroupsData || readonly}
                  placeholder={
                    loadingResourceGroupsData
                      ? /* istanbul ignore next */ getString('loading')
                      : getString('cd.steps.azureInfraStep.resourceGroupPlaceholder')
                  }
                  multiTypeInputProps={{
                    expressions,
                    disabled: readonly,
                    selectProps: {
                      items: resourceGroups,
                      allowCreatingNewItems: true,
                      addClearBtn: !(loadingResourceGroupsData || readonly),
                      noResults: (
                        <Text padding={'small'}>
                          {get(resourceGroupsError, errorMessage, null) ||
                            getString('cd.pipelineSteps.infraTab.resourceGroupError')}
                        </Text>
                      )
                    },
                    allowableTypes
                  }}
                  label={getString(resourceGroupLabel)}
                />
                {getMultiTypeFromValue(getValue(formik.values.resourceGroup)) === MultiTypeInputType.RUNTIME &&
                  !readonly && (
                    <ConfigureOptions
                      value={getValue(formik.values.resourceGroup)}
                      type="String"
                      variableName="resourceGroup"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        /* istanbul ignore next */
                        formik.setFieldValue('resourceGroup', value)
                      }}
                      isReadonly={readonly}
                    />
                  )}
              </Layout.Horizontal>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTypeInput
                  name="cluster"
                  className={css.inputWidth}
                  selectItems={clusters}
                  disabled={loadingClustersData || readonly}
                  placeholder={
                    loadingClustersData
                      ? /* istanbul ignore next */ getString('loading')
                      : getString('cd.steps.common.selectOrEnterClusterPlaceholder')
                  }
                  multiTypeInputProps={{
                    expressions,
                    disabled: readonly,
                    selectProps: {
                      items: clusters,
                      allowCreatingNewItems: true,
                      addClearBtn: !(loadingClustersData || readonly),
                      noResults: (
                        <Text padding={'small'}>
                          {get(clustersError, errorMessage, null) ||
                            getString('cd.pipelineSteps.infraTab.clusterErrorAzure')}
                        </Text>
                      )
                    },
                    allowableTypes
                  }}
                  label={getString(clusterLabel)}
                />
                {getMultiTypeFromValue(getValue(formik.values.cluster)) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={getValue(formik.values.cluster)}
                    type="String"
                    variableName="cluster"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      /* istanbul ignore next */
                      formik.setFieldValue('cluster', value)
                    }}
                    isReadonly={readonly}
                  />
                )}
              </Layout.Horizontal>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTextInput
                  name="namespace"
                  className={css.inputWidth}
                  label={getString('common.namespace')}
                  placeholder={getString('pipeline.infraSpecifications.namespacePlaceholder')}
                  multiTextInputProps={{ expressions, textProps: { disabled: readonly }, allowableTypes }}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(formik.values.namespace) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.namespace as string}
                    type="String"
                    variableName="namespace"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      /* istanbul ignore next */
                      formik.setFieldValue('namespace', value)
                    }}
                    isReadonly={readonly}
                  />
                )}
              </Layout.Horizontal>
              <Accordion
                panelClassName={css.accordionPanel}
                detailsClassName={css.accordionDetails}
                activeId={!isEmpty(formik.errors.releaseName) ? /* istanbul ignore next */ 'advanced' : ''}
              >
                <Accordion.Panel
                  id="advanced"
                  addDomId={true}
                  summary={getString('common.advanced')}
                  details={
                    <Layout.Horizontal className={css.formRow} spacing="medium">
                      <FormInput.MultiTextInput
                        name="releaseName"
                        className={css.inputWidth}
                        label={getString('common.releaseName')}
                        placeholder={getString('cd.steps.common.releaseNamePlaceholder')}
                        multiTextInputProps={{ expressions, textProps: { disabled: readonly }, allowableTypes }}
                        disabled={readonly}
                      />
                      {getMultiTypeFromValue(formik.values.releaseName) === MultiTypeInputType.RUNTIME && !readonly && (
                        <ConfigureOptions
                          value={formik.values.releaseName as string}
                          type="String"
                          variableName="releaseName"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => {
                            /* istanbul ignore next */
                            formik.setFieldValue('releaseName', value)
                          }}
                          isReadonly={readonly}
                        />
                      )}
                    </Layout.Horizontal>
                  }
                />
              </Accordion>
              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }} className={css.lastRow}>
                <FormInput.CheckBox
                  className={css.simultaneousDeployment}
                  tooltipProps={{
                    dataTooltipId: 'azureAllowSimultaneousDeployments'
                  }}
                  name={'allowSimultaneousDeployments'}
                  label={getString('cd.allowSimultaneousDeployments')}
                  disabled={readonly}
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

const AzureInfrastructureSpecInputForm: React.FC<AzureInfrastructureSpecEditableProps & { path: string }> = ({
  template,
  initialValues,
  readonly = false,
  path,
  onUpdate,
  allowableTypes,
  allValues
}) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [subscriptions, setSubscriptions] = useState<SelectOption[]>([])
  const [resourceGroups, setResourceGroups] = useState<SelectOption[]>([])
  const [clusters, setClusters] = useState<SelectOption[]>([])
  const { expressions } = useVariablesExpression()

  const { getString } = useStrings()

  const {
    data: subscriptionsData,
    refetch: refetchSubscriptionsData,
    loading: loadingSubscriptionsData,
    error: subscriptionsError
  } = useGetSubscriptionsForAzure({
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    const options =
      subscriptionsData?.data?.map(name => ({ label: name, value: name })) || /* istanbul ignore next */ []
    setSubscriptions(options)
  }, [subscriptionsData])

  useEffect(() => {
    const connectorRef = defaultTo(initialValues.connectorRef, allValues?.connectorRef)
    if (connectorRef && getMultiTypeFromValue(connectorRef) === MultiTypeInputType.FIXED) {
      refetchSubscriptionsData({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          connectorRef: initialValues.connectorRef
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues.connectorRef, allValues?.connectorRef])

  const {
    data: resourceGroupData,
    refetch: refetchResourceGroups,
    loading: loadingResourceGroupsData,
    error: resourceGroupsError
  } = useGetResourceGroupsForAzure({
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    const options =
      resourceGroupData?.data?.map(name => ({ label: name, value: name })) || /* istanbul ignore next */ []
    setResourceGroups(options)
  }, [resourceGroupData])

  useEffect(() => {
    const connectorRef = defaultTo(initialValues.connectorRef, allValues?.connectorRef)
    const subscription = defaultTo(initialValues.subscription, allValues?.subscription)
    if (
      connectorRef &&
      getMultiTypeFromValue(connectorRef) === MultiTypeInputType.FIXED &&
      subscription &&
      getMultiTypeFromValue(subscription) === MultiTypeInputType.FIXED
    ) {
      refetchResourceGroups({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          connectorRef,
          subscription
        }
      })
      /* istanbul ignore else */
      if (
        getMultiTypeFromValue(template?.resourceGroup) === MultiTypeInputType.RUNTIME &&
        getMultiTypeFromValue(initialValues?.resourceGroup) !== MultiTypeInputType.RUNTIME
      ) {
        set(initialValues, 'resourceGroup', '')
        onUpdate?.(initialValues)
      }
    } else {
      setResourceGroups([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues.connectorRef, initialValues.subscription, allValues?.connectorRef, allValues?.subscription])

  const {
    data: clustersData,
    refetch: refetchClusterNames,
    loading: loadingClusterNames,
    error: clustersError
  } = useGetClustersForAzure({
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    const options = clustersData?.data?.map(name => ({ label: name, value: name }))
    setClusters(defaultTo(options, []))
  }, [clustersData])

  useEffect(() => {
    const connectorRef = defaultTo(initialValues.connectorRef, allValues?.connectorRef)
    const subscription = defaultTo(initialValues.subscription, allValues?.subscription)
    const resourceGroup = defaultTo(initialValues.resourceGroup, allValues?.resourceGroup)

    /* istanbul ignore else */
    if (
      connectorRef &&
      getMultiTypeFromValue(connectorRef) === MultiTypeInputType.FIXED &&
      subscription &&
      getMultiTypeFromValue(subscription) === MultiTypeInputType.FIXED &&
      resourceGroup &&
      getMultiTypeFromValue(resourceGroup) === MultiTypeInputType.FIXED
    ) {
      refetchClusterNames({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          connectorRef,
          subscription,
          resourceGroup
        }
      })

      /* istanbul ignore else */
      if (
        getMultiTypeFromValue(template?.cluster) === MultiTypeInputType.RUNTIME &&
        getMultiTypeFromValue(initialValues?.cluster) !== MultiTypeInputType.RUNTIME
      ) {
        set(initialValues, 'cluster', '')
        onUpdate?.(initialValues)
      }
    } else {
      setClusters([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialValues.connectorRef,
    initialValues.subscription,
    allValues?.connectorRef,
    allValues?.subscription,
    initialValues.resourceGroup,
    allValues?.resourceGroup
  ])

  return (
    <Layout.Vertical padding="medium" spacing="small">
      {getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            name={`${path}.connectorRef`}
            label={getString('connector')}
            enableConfigureOptions={false}
            placeholder={getString('connectors.selectConnector')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions }}
            type={Connectors.AZURE}
            setRefValue
            onChange={(selected, _typeValue, type) => {
              const item = selected as unknown as { record?: ConnectorReferenceDTO; scope: Scope }
              if (type === MultiTypeInputType.FIXED) {
                const connectorRefValue =
                  item.scope === Scope.ORG || item.scope === Scope.ACCOUNT
                    ? `${item.scope}.${item?.record?.identifier}`
                    : item.record?.identifier
                if (connectorRefValue) {
                  refetchSubscriptionsData({
                    queryParams: {
                      accountIdentifier: accountId,
                      projectIdentifier,
                      orgIdentifier,
                      connectorRef: connectorRefValue
                    }
                  })
                }
              } else {
                setSubscriptions([])
              }
            }}
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.subscription) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md, css.clusterInputWrapper)}>
          <FormInput.MultiTypeInput
            name={`${path}.subscription`}
            disabled={loadingSubscriptionsData || readonly}
            placeholder={
              loadingSubscriptionsData
                ? /* istanbul ignore next */ getString('loading')
                : getString('cd.steps.azureInfraStep.subscriptionPlaceholder')
            }
            useValue
            selectItems={subscriptions}
            label={getString(subscriptionLabel)}
            multiTypeInputProps={{
              selectProps: {
                items: subscriptions,
                allowCreatingNewItems: true,
                addClearBtn: !(loadingSubscriptionsData || readonly),
                noResults: (
                  <Text padding={'small'}>
                    {defaultTo(
                      get(subscriptionsError, errorMessage, subscriptionsError?.message),
                      getString('cd.pipelineSteps.infraTab.subscriptionError')
                    )}
                  </Text>
                )
              },
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.resourceGroup) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md, css.clusterInputWrapper)}>
          <FormInput.MultiTypeInput
            name={`${path}.resourceGroup`}
            disabled={loadingResourceGroupsData || readonly}
            placeholder={
              loadingResourceGroupsData
                ? /* istanbul ignore next */ getString('loading')
                : getString('cd.steps.azureInfraStep.resourceGroupPlaceholder')
            }
            useValue
            selectItems={resourceGroups}
            label={getString(resourceGroupLabel)}
            multiTypeInputProps={{
              selectProps: {
                items: resourceGroups,
                allowCreatingNewItems: true,
                addClearBtn: !(loadingResourceGroupsData || readonly),
                noResults: (
                  <Text padding={'small'}>
                    {defaultTo(
                      get(resourceGroupsError, errorMessage, resourceGroupsError?.message),
                      getString('cd.pipelineSteps.infraTab.resourceGroupError')
                    )}
                  </Text>
                )
              },
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.cluster) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md, css.clusterInputWrapper)}>
          <FormInput.MultiTypeInput
            name={`${path}.cluster`}
            disabled={loadingClusterNames || readonly}
            placeholder={
              loadingClusterNames
                ? /* istanbul ignore next */ getString('loading')
                : getString('cd.steps.common.selectOrEnterClusterPlaceholder')
            }
            useValue
            selectItems={clusters}
            label={getString(clusterLabel)}
            multiTypeInputProps={{
              selectProps: {
                items: clusters,
                allowCreatingNewItems: true,
                addClearBtn: !(loadingClusterNames || readonly),
                noResults: (
                  <Text padding={'small'}>
                    {defaultTo(
                      get(clustersError, errorMessage, clustersError?.message),
                      getString('cd.pipelineSteps.infraTab.clusterErrorAzure')
                    )}
                  </Text>
                )
              },
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.namespace) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${path}.namespace`}
            label={getString('common.namespace')}
            disabled={readonly}
            multiTextInputProps={{
              allowableTypes,
              expressions
            }}
            placeholder={getString('pipeline.infraSpecifications.namespacePlaceholder')}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.releaseName) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${path}.releaseName`}
            multiTextInputProps={{
              allowableTypes,
              expressions
            }}
            label={getString('common.releaseName')}
            disabled={readonly}
            placeholder={getString('cd.steps.common.releaseNamePlaceholder')}
          />
        </div>
      )}
    </Layout.Vertical>
  )
}

const AzureInfrastructureSpecVariablesForm: React.FC<AzureInfrastructureSpecEditableProps> = ({
  metadataMap,
  variablesData,
  initialValues
}) => {
  const infraVariables = variablesData?.infrastructureDefinition?.spec
  return infraVariables ? (
    /* istanbul ignore next */ <VariablesListTable
      data={infraVariables}
      originalData={initialValues?.infrastructureDefinition?.spec || initialValues}
      metadataMap={metadataMap}
    />
  ) : null
}

interface AzureInfrastructureSpecStep extends AzureInfrastructure {
  name?: string
  identifier?: string
}

const AzureConnectorRegex = /^.+infrastructure\.infrastructureDefinition\.spec\.connectorRef$/
const AzureSubscriptionRegex = /^.+infrastructure\.infrastructureDefinition\.spec\.subscription$/
const AzureResourceGroupRegex = /^.+infrastructure\.infrastructureDefinition\.spec\.resourceGroup$/
const AzureClusterRegex = /^.+infrastructure\.infrastructureDefinition\.spec\.cluster$/
const AzureType = Connectors.AZURE
export class AzureInfrastructureSpec extends PipelineStep<AzureInfrastructureSpecStep> {
  lastFetched: number
  protected type = StepType.Azure
  protected defaultValues: AzureInfrastructure = {
    connectorRef: '',
    subscription: '',
    cluster: '',
    resourceGroup: '',
    namespace: '',
    releaseName: ''
  }

  protected stepIcon: IconName = 'microsoft-azure'
  protected stepName = 'Specify your Azure Connector'
  protected stepPaletteVisible = false
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.lastFetched = new Date().getTime()
    this.invocationMap.set(AzureConnectorRegex, this.getConnectorsListForYaml.bind(this))
    this.invocationMap.set(AzureSubscriptionRegex, this.getSubscriptionListForYaml.bind(this))
    this.invocationMap.set(AzureResourceGroupRegex, this.getClusterListForYaml.bind(this))
    this.invocationMap.set(AzureClusterRegex, this.getClusterListForYaml.bind(this))

    this._hasStepVariables = true
  }

  protected getConnectorsListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err: any) {
      /* istanbul ignore next */ logger.error(yamlErrorMessage, err)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    /* istanbul ignore else */
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.connectorRef', ''))
      if (obj?.type === AzureType) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: { types: [AzureType], filterType: 'Connector' }
        }).then(
          response =>
            response?.data?.content?.map(connector => ({
              label: getConnectorName(connector),
              insertText: getConnectorValue(connector),
              kind: CompletionItemKind.Field
            })) || /* istanbul ignore next */ []
        )
      }
    }

    return Promise.resolve([])
  }

  protected getSubscriptionListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err: any) {
      /* istanbul ignore next */ logger.error(yamlErrorMessage, err)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    /* istanbul ignore else */
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.subscription', ''))
      if (
        obj?.type === AzureType &&
        obj?.spec?.connectorRef &&
        getMultiTypeFromValue(obj.spec?.connectorRef) === MultiTypeInputType.FIXED
      ) {
        return getSubscriptionsForAzurePromise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            connectorRef: obj.spec?.connectorRef
          }
        }).then(
          response =>
            response?.data?.map(subscription => ({
              label: subscription,
              insertText: subscription,
              kind: CompletionItemKind.Field
            })) || /* istanbul ignore next */ []
        )
      }
    }

    return Promise.resolve([])
  }

  protected getResourceGroupListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err: any) {
      /* istanbul ignore next */ logger.error(yamlErrorMessage, err)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    /* istanbul ignore else */
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.resourceGroup', ''))
      if (
        obj?.type === AzureType &&
        obj?.spec?.connectorRef &&
        getMultiTypeFromValue(obj.spec?.connectorRef) === MultiTypeInputType.FIXED &&
        obj?.spec?.subscription &&
        getMultiTypeFromValue(obj.spec?.subscription) === MultiTypeInputType.FIXED
      ) {
        return getResourceGroupsForAzurePromise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            connectorRef: obj.spec?.connectorRef,
            subscription: obj.spec?.subscription
          }
        }).then(
          response =>
            response?.data?.map(resourceGroup => ({
              label: resourceGroup,
              insertText: resourceGroup,
              kind: CompletionItemKind.Field
            })) || /* istanbul ignore next */ []
        )
      }
    }

    return Promise.resolve([])
  }

  protected getClusterListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err: any) {
      /* istanbul ignore next */ logger.error(yamlErrorMessage, err)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    /* istanbul ignore else */
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.cluster', ''))
      if (
        obj?.type === AzureType &&
        obj?.spec?.connectorRef &&
        getMultiTypeFromValue(obj.spec?.connectorRef) === MultiTypeInputType.FIXED &&
        obj?.spec?.subscription &&
        getMultiTypeFromValue(obj.spec?.subscription) === MultiTypeInputType.FIXED &&
        obj?.spec?.resourceGroup &&
        getMultiTypeFromValue(obj.spec?.resourceGroup) === MultiTypeInputType.FIXED
      ) {
        return getClustersForAzurePromise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            connectorRef: obj.spec?.connectorRef,
            subscription: obj.spec?.subscription,
            resourceGroup: obj.spec?.resourceGroup
          }
        }).then(
          response =>
            response?.data?.map(cluster => ({
              label: cluster,
              insertText: cluster,
              kind: CompletionItemKind.Field
            })) || /* istanbul ignore next */ []
        )
      }
    }

    return Promise.resolve([])
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<AzureInfrastructure>): FormikErrors<AzureInfrastructure> {
    const errors: Partial<AzureInfrastructureTemplate> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (
      isEmpty(data.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      errors.connectorRef = getString?.('fieldRequired', { field: getString('connector') })
    }
    if (
      isEmpty(data.subscription) &&
      isRequired &&
      getMultiTypeFromValue(template?.subscription) === MultiTypeInputType.RUNTIME
    ) {
      errors.subscription = getString?.('fieldRequired', { field: getString(subscriptionLabel) })
    }
    if (
      isEmpty(data.resourceGroup) &&
      isRequired &&
      getMultiTypeFromValue(template?.resourceGroup) === MultiTypeInputType.RUNTIME
    ) {
      errors.resourceGroup = getString?.('fieldRequired', { field: getString(resourceGroupLabel) })
    }
    if (
      isEmpty(data.cluster) &&
      isRequired &&
      getMultiTypeFromValue(template?.cluster) === MultiTypeInputType.RUNTIME
    ) {
      errors.cluster = getString?.('fieldRequired', { field: getString(clusterLabel) })
    }
    /* istanbul ignore else */ if (
      getString &&
      getMultiTypeFromValue(template?.namespace) === MultiTypeInputType.RUNTIME
    ) {
      const namespace = Yup.object().shape({
        namespace: getNameSpaceSchema(getString, isRequired)
      })

      try {
        namespace.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    /* istanbul ignore else */ if (
      getString &&
      getMultiTypeFromValue(template?.releaseName) === MultiTypeInputType.RUNTIME
    ) {
      const releaseName = Yup.object().shape({
        releaseName: getReleaseNameSchema(getString, isRequired)
      })

      try {
        releaseName.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    return errors
  }

  renderStep(props: StepProps<AzureInfrastructure>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, customStepProps, readonly, allowableTypes } = props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <AzureInfrastructureSpecInputForm
          {...(customStepProps as AzureInfrastructureSpecEditableProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
          template={inputSetData?.template}
          allValues={inputSetData?.allValues}
          path={inputSetData?.path || ''}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <AzureInfrastructureSpecVariablesForm
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          {...(customStepProps as AzureInfrastructureSpecEditableProps)}
          initialValues={initialValues}
        />
      )
    }

    return (
      <AzureInfrastructureSpecEditable
        onUpdate={onUpdate}
        readonly={readonly}
        stepViewType={stepViewType}
        {...(customStepProps as AzureInfrastructureSpecEditableProps)}
        initialValues={initialValues}
        allowableTypes={allowableTypes}
      />
    )
  }
}
