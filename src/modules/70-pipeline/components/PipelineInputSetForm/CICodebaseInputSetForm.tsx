/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react'
import { useParams } from 'react-router-dom'
import { get, isEmpty, isUndefined } from 'lodash-es'
import {
  FormInput,
  MultiTypeInputType,
  Container,
  Layout,
  Text,
  Radio,
  Icon,
  TextInput,
  RUNTIME_INPUT_VALUE,
  SelectOption
} from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { connect } from 'formik'
import { useStrings } from 'framework/strings'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { Connectors } from '@connectors/constants'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConnectorInfoDTO, PipelineInfoConfig, useGetConnector } from 'services/cd-ng'
import { getConnectorRefWidth, getPrCloneStrategyOptions, sslVerifyOptions } from '@pipeline/utils/constants'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { getOptionalSubLabel } from '@pipeline/components/Volumes/Volumes'
import { CodebaseTypes } from '@pipeline/utils/CIUtils'
import { isRuntimeInput } from '../PipelineStudio/RightBar/RightBarUtils'
import { StepViewType } from '../AbstractSteps/Step'
import css from './CICodebaseInputSetForm.module.scss'
export interface CICodebaseInputSetFormProps {
  path: string
  readonly?: boolean
  formik?: any
  template?: PipelineInfoConfig
  originalPipeline: PipelineInfoConfig
  viewType: StepViewType
  isTriggerForm?: boolean
}

type CodeBaseType = 'branch' | 'tag' | 'PR'

export enum ConnectionType {
  Repo = 'Repo',
  Account = 'Account'
}

const inputNames = {
  branch: 'branch',
  tag: 'tag',
  PR: 'number'
}

const defaultValues = {
  branch: '<+trigger.branch>',
  tag: '<+trigger.tag>',
  PR: '<+trigger.prNumber>'
}

const placeholderValues = {
  branch: defaultValues['branch'],
  tag: defaultValues['tag'],
  PR: defaultValues['PR']
}

export interface ConnectorRefInterface {
  record?: { spec?: { type?: string; url?: string; connectionType?: string } }
}

export const handleCIConnectorRefOnChange = ({
  value,
  connectorRefType,
  setConnectionType,
  setConnectorUrl,
  setFieldValue,
  setIsConnectorExpression,
  codeBaseInputFieldFormName
}: {
  value: ConnectorRefInterface | undefined
  connectorRefType: MultiTypeInputType
  setConnectionType: Dispatch<SetStateAction<string>>
  setConnectorUrl: Dispatch<SetStateAction<string>>
  setFieldValue: (field: string, value: unknown) => void
  setIsConnectorExpression?: Dispatch<SetStateAction<boolean>> // used in inputset form
  codeBaseInputFieldFormName?: { [key: string]: string } // only used when setting nested values in input set
}): void => {
  const newConnectorRef = value as ConnectorRefInterface
  if (connectorRefType === MultiTypeInputType.FIXED) {
    if (newConnectorRef?.record?.spec?.type === ConnectionType.Account) {
      setConnectionType(ConnectionType.Account)
      setConnectorUrl(newConnectorRef.record?.spec?.url || '')
      setFieldValue(codeBaseInputFieldFormName?.repoName || 'repoName', '')
    } else if (
      newConnectorRef?.record?.spec?.type === ConnectionType.Repo ||
      newConnectorRef?.record?.spec?.connectionType === ConnectionType.Repo
    ) {
      setConnectionType(ConnectionType.Repo)
      setConnectorUrl(newConnectorRef.record?.spec?.url || '')
      //  clear repoName from yaml
      setFieldValue(codeBaseInputFieldFormName?.repoName || 'repoName', undefined)
    } else {
      setConnectionType('')
      setConnectorUrl('')
    }
    setIsConnectorExpression?.(false)
  } else if (connectorRefType === MultiTypeInputType.EXPRESSION) {
    setConnectionType('')
    setConnectorUrl('')
    setIsConnectorExpression?.(true)
  } else {
    setConnectionType('')
    setConnectorUrl('')
    setIsConnectorExpression?.(false)

    setFieldValue(
      codeBaseInputFieldFormName?.repoName || 'repoName',
      connectorRefType === MultiTypeInputType.RUNTIME ? RUNTIME_INPUT_VALUE : ''
    )
  }
}

function CICodebaseInputSetFormInternal({
  path,
  readonly,
  formik,
  template,
  originalPipeline,
  viewType,
  isTriggerForm
}: CICodebaseInputSetFormProps): JSX.Element {
  const { triggerIdentifier, accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()

  const [isInputTouched, setIsInputTouched] = useState(false)
  const [connectorType, setConnectorType] = useState<ConnectorInfoDTO['type']>()
  const [connectorId, setConnectorId] = useState<string>('')
  const [connectorRef, setConnectorRef] = useState<string>('')
  const [codeBaseType, setCodeBaseType] = useState<CodeBaseType>()

  const [connectionType, setConnectionType] = React.useState('')
  const [connectorUrl, setConnectorUrl] = React.useState('')
  const isConnectorRuntimeInput = template?.properties?.ci?.codebase?.connectorRef
  const isCpuLimitRuntimeInput = template?.properties?.ci?.codebase?.resources?.limits?.cpu
  const isMemoryLimitRuntimeInput = template?.properties?.ci?.codebase?.resources?.limits?.memory
  const isDeploymentOrTriggerForm = viewType === StepViewType.DeploymentForm || isTriggerForm
  const [isConnectorExpression, setIsConnectorExpression] = useState<boolean>(false)
  const savedValues = useRef<Record<string, string>>({
    branch: '',
    tag: '',
    PR: ''
  })
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const formattedPath = isEmpty(path) ? '' : `${path}.`
  const codeBaseTypePath = `${formattedPath}properties.ci.codebase.build.type`
  const buildSpecPath = `${formattedPath}properties.ci.codebase.build.spec`
  const prCloneStrategyOptions = getPrCloneStrategyOptions(getString)
  const radioLabels = {
    branch: getString('gitBranch'),
    tag: getString('gitTag'),
    PR: getString('pipeline.gitPullRequest')
  }

  const inputLabels = {
    branch: getString('common.branchName'),
    tag: getString('common.tagName'),
    PR: getString('pipeline.ciCodebase.pullRequestNumber')
  }

  const codeBaseInputFieldFormName = {
    branch: `${formattedPath}properties.ci.codebase.build.spec.branch`,
    tag: `${formattedPath}properties.ci.codebase.build.spec.tag`,
    PR: `${formattedPath}properties.ci.codebase.build.spec.number`,
    connectorRef: `${formattedPath}properties.ci.codebase.connectorRef`,
    repoName: `${formattedPath}properties.ci.codebase.repoName`,
    depth: `${formattedPath}properties.ci.codebase.depth`,
    sslVerify: `${formattedPath}properties.ci.codebase.sslVerify`,
    prCloneStrategy: `${formattedPath}properties.ci.codebase.prCloneStrategy`,
    memoryLimit: `${formattedPath}properties.ci.codebase.resources.limits.memory`,
    cpuLimit: `${formattedPath}properties.ci.codebase.resources.limits.cpu`
  }

  const {
    data: connectorDetails,
    loading: loadingConnectorDetails,
    refetch: getConnectorDetails
  } = useGetConnector({
    identifier: connectorId,
    lazy: true
  })

  useEffect(() => {
    if (connectorId) {
      const connectorScope = getScopeFromValue(connectorRef)
      getConnectorDetails({
        pathParams: {
          identifier: connectorId
        },
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier: connectorScope === Scope.ORG || connectorScope === Scope.PROJECT ? orgIdentifier : undefined,
          projectIdentifier: connectorScope === Scope.PROJECT ? projectIdentifier : undefined
        }
      })
    }
  }, [connectorId])

  useEffect(() => {
    if (!loadingConnectorDetails && !isUndefined(connectorDetails)) {
      setConnectorType(get(connectorDetails, 'data.connector.type', '') as ConnectorInfoDTO['type'])
    }

    if (connectorDetails?.data?.connector) {
      setConnectionType(
        connectorDetails?.data?.connector?.type === Connectors.GIT
          ? connectorDetails?.data?.connector.spec.connectionType
          : connectorDetails?.data?.connector.spec.type
      )
      setConnectorUrl(connectorDetails?.data?.connector.spec.url)
    }
  }, [loadingConnectorDetails, connectorDetails])

  useEffect(() => {
    const type = get(formik?.values, codeBaseTypePath) as CodeBaseType
    if (type) {
      setCodeBaseType(type)
    }
    const typeOfConnector = get(formik?.values, 'connectorRef.connector.type', '') as ConnectorInfoDTO['type']
    if (typeOfConnector) {
      setConnectorType(typeOfConnector)
    } else {
      let ctrRef = get(originalPipeline, 'properties.ci.codebase.connectorRef') as string
      if (isConnectorExpression) {
        return
      }
      if (isRuntimeInput(ctrRef)) {
        ctrRef = get(formik?.values, codeBaseInputFieldFormName.connectorRef, '')
      }

      setConnectorRef(ctrRef)
      setConnectorId(getIdentifierFromValue(ctrRef))
    }
  }, [formik?.values])

  useEffect(() => {
    // OnEdit Case, persists saved ciCodebase build spec
    if (codeBaseType) {
      savedValues.current = Object.assign(savedValues.current, {
        [codeBaseType]: get(
          formik?.values,
          `${formattedPath}properties.ci.codebase.build.spec.${inputNames[codeBaseType]}`,
          ''
        )
      })
      formik?.setFieldValue(buildSpecPath, { [inputNames[codeBaseType]]: savedValues.current[codeBaseType] })
    }
  }, [codeBaseType])

  const handleTypeChange = (newType: CodeBaseType): void => {
    formik?.setFieldValue(`${formattedPath}properties.ci.codebase.build`, '')
    formik?.setFieldValue(codeBaseTypePath, newType)

    if (!isInputTouched && triggerIdentifier) {
      formik?.setFieldValue(buildSpecPath, { [inputNames[newType]]: defaultValues[newType] })
    } else {
      formik?.setFieldValue(buildSpecPath, { [inputNames[newType]]: savedValues.current[newType] })
    }
  }
  const renderCodeBaseTypeInput = (type: CodeBaseType): JSX.Element => {
    return (
      <Container>
        <FormInput.MultiTextInput
          label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{inputLabels[type]}</Text>}
          name={codeBaseInputFieldFormName[type]}
          multiTextInputProps={{
            expressions,
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
          }}
          placeholder={triggerIdentifier ? placeholderValues[type] : ''}
          disabled={readonly}
          onChange={() => setIsInputTouched(true)}
        />
      </Container>
    )
  }

  return (
    <Layout.Vertical spacing="small">
      {loadingConnectorDetails ? (
        <Container flex={{ justifyContent: 'center' }}>
          <Icon name="steps-spinner" size={25} />
        </Container>
      ) : (
        <>
          {isConnectorRuntimeInput && (
            <Container width="50%" className={css.bottomMargin3}>
              <FormMultiTypeConnectorField
                name={codeBaseInputFieldFormName.connectorRef}
                width={getConnectorRefWidth(viewType)}
                error={formik?.errors?.connectorRef}
                type={[
                  Connectors.GIT,
                  Connectors.GITHUB,
                  Connectors.GITLAB,
                  Connectors.BITBUCKET,
                  Connectors.AWS_CODECOMMIT
                ]}
                label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('connector')}</Text>}
                placeholder={loadingConnectorDetails ? getString('loading') : getString('connectors.selectConnector')}
                accountIdentifier={accountId}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                setRefValue={true}
                multiTypeProps={{
                  expressions,
                  disabled: readonly,
                  allowableTypes: [MultiTypeInputType.FIXED]
                }}
                onChange={(value, _valueType, connectorRefType) =>
                  handleCIConnectorRefOnChange({
                    value: value as ConnectorRefInterface,
                    connectorRefType,
                    setConnectionType,
                    setConnectorUrl,
                    setFieldValue: formik?.setFieldValue as (field: string, value: any) => void,
                    codeBaseInputFieldFormName,
                    setIsConnectorExpression
                  })
                }
              />
            </Container>
          )}
          {isConnectorRuntimeInput &&
            (!isRuntimeInput(formik?.values.connectorRef) && connectionType === ConnectionType.Repo ? (
              <Container width={'50%'}>
                <Text
                  font={{ variation: FontVariation.FORM_LABEL }}
                  margin={{ bottom: 'xsmall' }}
                  tooltipProps={{ dataTooltipId: 'rightBarForm_repoName' }}
                >
                  {getString('common.repositoryName')}
                </Text>
                <TextInput
                  name={codeBaseInputFieldFormName.repoName}
                  value={connectorUrl}
                  style={{ flexGrow: 1 }}
                  disabled
                />
              </Container>
            ) : (
              <>
                <Container width={'50%'} className={css.bottomMargin3}>
                  <MultiTypeTextField
                    label={
                      <Layout.Horizontal className={css.inpLabel}>
                        <Text
                          font={{ variation: FontVariation.FORM_LABEL }}
                          tooltipProps={{ dataTooltipId: 'rightBarForm_repoName' }}
                        >
                          {getString('common.repositoryName')}
                        </Text>
                      </Layout.Horizontal>
                    }
                    name={codeBaseInputFieldFormName.repoName}
                    multiTextInputProps={{
                      multiTextInputProps: {
                        expressions,
                        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                      },
                      disabled: readonly
                    }}
                  />
                </Container>
                {!isRuntimeInput(formik?.values.connectorRef) &&
                !isRuntimeInput(formik?.values.repoName) &&
                connectorUrl?.length > 0 ? (
                  <div className={css.predefinedValue}>
                    <Text lineClamp={1} width="460px">
                      {(connectorUrl[connectorUrl.length - 1] === '/' ? connectorUrl : connectorUrl + '/') +
                        get(formik?.values, codeBaseInputFieldFormName.repoName, '')}
                    </Text>
                  </div>
                ) : null}
              </>
            ))}
          {template?.properties?.ci?.codebase?.depth && (
            <Container width={'50%'} className={css.bottomMargin3}>
              <MultiTypeTextField
                label={
                  <Layout.Horizontal className={css.inpLabel} style={{ display: 'flex', alignItems: 'baseline' }}>
                    <Text
                      font={{ variation: FontVariation.FORM_LABEL }}
                      {...(!isDeploymentOrTriggerForm && { tooltipProps: { dataTooltipId: 'depth' } })}
                    >
                      {getString('pipeline.depth')}
                    </Text>
                    &nbsp;
                    {isDeploymentOrTriggerForm && getOptionalSubLabel(getString, 'depth')}
                  </Layout.Horizontal>
                }
                name={codeBaseInputFieldFormName.depth}
                multiTextInputProps={{
                  multiTextInputProps: {
                    expressions,
                    allowableTypes: [MultiTypeInputType.FIXED]
                  },
                  disabled: readonly
                }}
              />
            </Container>
          )}
          {template?.properties?.ci?.codebase?.sslVerify && (
            <Container width={'50%'} className={css.bottomMargin3}>
              <MultiTypeSelectField
                name={codeBaseInputFieldFormName.sslVerify}
                label={
                  <Layout.Horizontal className={css.inpLabel} style={{ display: 'flex', alignItems: 'baseline' }}>
                    <Text
                      color={Color.GREY_600}
                      font={{ size: 'small', weight: 'semi-bold' }}
                      {...(!isDeploymentOrTriggerForm && { tooltipProps: { dataTooltipId: 'sslVerify' } })}
                    >
                      {getString('pipeline.sslVerify')}
                    </Text>
                    &nbsp;
                    {isDeploymentOrTriggerForm && getOptionalSubLabel(getString, 'sslVerify')}
                  </Layout.Horizontal>
                }
                multiTypeInputProps={{
                  selectItems: sslVerifyOptions as unknown as SelectOption[],
                  placeholder: getString('select'),
                  multiTypeInputProps: {
                    expressions,
                    selectProps: { addClearBtn: true, items: sslVerifyOptions as unknown as SelectOption[] },
                    allowableTypes: [MultiTypeInputType.FIXED]
                  },
                  disabled: readonly
                }}
                useValue
                disabled={readonly}
              />
            </Container>
          )}
          {template?.properties?.ci?.codebase?.prCloneStrategy && (
            <Container width={'50%'} className={css.bottomMargin3}>
              <MultiTypeSelectField
                name={codeBaseInputFieldFormName.prCloneStrategy}
                label={
                  <Layout.Horizontal className={css.inpLabel} style={{ display: 'flex', alignItems: 'baseline' }}>
                    <Text
                      color={Color.GREY_600}
                      font={{ size: 'small', weight: 'semi-bold' }}
                      {...(!isDeploymentOrTriggerForm && { tooltipProps: { dataTooltipId: 'prCloneStrategy' } })}
                    >
                      {getString('pipeline.ciCodebase.prCloneStrategy')}
                    </Text>
                    &nbsp;
                    {isDeploymentOrTriggerForm && getOptionalSubLabel(getString, 'prCloneStrategy')}
                  </Layout.Horizontal>
                }
                multiTypeInputProps={{
                  selectItems: prCloneStrategyOptions,
                  placeholder: getString('select'),
                  multiTypeInputProps: {
                    expressions,
                    selectProps: { addClearBtn: true, items: prCloneStrategyOptions },
                    allowableTypes: [MultiTypeInputType.FIXED]
                  },
                  disabled: readonly
                }}
                useValue
                disabled={readonly}
              />
            </Container>
          )}
          {(isCpuLimitRuntimeInput || isMemoryLimitRuntimeInput) && (
            <Layout.Vertical width={'50%'} className={css.bottomMargin3} spacing="medium">
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={{ dataTooltipId: 'setContainerResources' }}
              >
                {getString('pipelineSteps.setContainerResources')}
              </Text>
              <Layout.Horizontal spacing="small">
                {isMemoryLimitRuntimeInput && (
                  <MultiTypeTextField
                    name={codeBaseInputFieldFormName.memoryLimit}
                    label={
                      <Layout.Horizontal style={{ display: 'flex', alignItems: 'baseline' }}>
                        <Text
                          className={css.inpLabel}
                          color={Color.GREY_600}
                          font={{ size: 'small', weight: 'semi-bold' }}
                          {...(!isDeploymentOrTriggerForm && { tooltipProps: { dataTooltipId: 'limitMemory' } })}
                        >
                          {getString('pipelineSteps.limitMemoryLabel')}
                        </Text>
                        &nbsp;
                        {isDeploymentOrTriggerForm && getOptionalSubLabel(getString, 'limitMemory')}
                      </Layout.Horizontal>
                    }
                    multiTextInputProps={{
                      multiTextInputProps: {
                        expressions,
                        allowableTypes: [MultiTypeInputType.FIXED]
                      },
                      disabled: readonly
                    }}
                    configureOptionsProps={{ variableName: 'spec.limit.memory' }}
                    style={{ flexGrow: 1, flexBasis: '50%' }}
                  />
                )}

                {isCpuLimitRuntimeInput && (
                  <MultiTypeTextField
                    name={codeBaseInputFieldFormName.cpuLimit}
                    label={
                      <Layout.Horizontal style={{ display: 'flex', alignItems: 'baseline' }}>
                        <Text
                          className={css.inpLabel}
                          color={Color.GREY_600}
                          font={{ size: 'small', weight: 'semi-bold' }}
                          {...(!isDeploymentOrTriggerForm && { tooltipProps: { dataTooltipId: 'limitCPULabel' } })}
                        >
                          {getString('pipelineSteps.limitCPULabel')}
                        </Text>
                        &nbsp;
                        {isDeploymentOrTriggerForm && getOptionalSubLabel(getString, 'limitCPULabel')}
                      </Layout.Horizontal>
                    }
                    multiTextInputProps={{
                      multiTextInputProps: {
                        expressions,
                        allowableTypes: [MultiTypeInputType.FIXED]
                      },
                      disabled: readonly
                    }}
                    configureOptionsProps={{ variableName: 'spec.limit.cpu' }}
                    style={{ flexGrow: 1, flexBasis: '50%' }}
                  />
                )}
              </Layout.Horizontal>
            </Layout.Vertical>
          )}
          {(!isConnectorRuntimeInput ||
            (isConnectorRuntimeInput && get(formik?.values, codeBaseInputFieldFormName.connectorRef))) && (
            <>
              <Layout.Horizontal
                flex={{ justifyContent: 'start' }}
                padding={{ top: 'small', left: 'xsmall', bottom: 'xsmall' }}
                margin={{ left: 'large' }}
              >
                <Radio
                  label={radioLabels['branch']}
                  width={110}
                  onClick={() => handleTypeChange('branch')}
                  checked={codeBaseType === CodebaseTypes.branch}
                  disabled={readonly}
                  font={{ variation: FontVariation.FORM_LABEL }}
                  key="branch-radio-option"
                />
                <Radio
                  label={radioLabels['tag']}
                  width={90}
                  margin={{ left: 'huge' }}
                  onClick={() => handleTypeChange('tag')}
                  checked={codeBaseType === CodebaseTypes.tag}
                  disabled={readonly}
                  font={{ variation: FontVariation.FORM_LABEL }}
                  key="tag-radio-option"
                />
                {connectorType !== 'Codecommit' ? (
                  <Radio
                    label={radioLabels['PR']}
                    width={110}
                    margin={{ left: 'huge' }}
                    onClick={() => handleTypeChange('PR')}
                    checked={codeBaseType === CodebaseTypes.PR}
                    disabled={readonly}
                    font={{ variation: FontVariation.FORM_LABEL }}
                    key="pr-radio-option"
                  />
                ) : null}
              </Layout.Horizontal>

              <Container width={'50%'}>
                {codeBaseType === CodebaseTypes.branch ? renderCodeBaseTypeInput('branch') : null}
                {codeBaseType === CodebaseTypes.tag ? renderCodeBaseTypeInput('tag') : null}
                {codeBaseType === CodebaseTypes.PR ? renderCodeBaseTypeInput('PR') : null}
              </Container>
            </>
          )}
        </>
      )}
    </Layout.Vertical>
  )
}

export const CICodebaseInputSetForm = connect(CICodebaseInputSetFormInternal)
