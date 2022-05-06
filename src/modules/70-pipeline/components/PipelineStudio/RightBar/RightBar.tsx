/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import cx from 'classnames'
import {
  Accordion,
  Button,
  IconName,
  Formik,
  FormikForm,
  RUNTIME_INPUT_VALUE,
  TextInput,
  FormInput,
  Text,
  Layout,
  getMultiTypeFromValue,
  MultiTypeInputType,
  ButtonVariation,
  VisualYamlSelectedView as SelectedView
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { isEmpty, get, set, unset } from 'lodash-es'
import { Classes, Dialog } from '@blueprintjs/core'
import produce from 'immer'
import { useStrings } from 'framework/strings'
import type { MultiTypeSelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import {
  ConnectorInfoDTO,
  getConnectorPromise,
  getTestConnectionResultPromise,
  getTestGitRepoConnectionResultPromise,
  PipelineInfoConfig,
  useGetConnector
} from 'services/cd-ng'
import {
  ConnectorReferenceField,
  ConnectorReferenceFieldProps
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import type { PipelineType, GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import {
  generateSchemaForLimitCPU,
  generateSchemaForLimitMemory
} from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { useQueryParams } from '@common/hooks'
import { PipelineContextType, usePipelineContext } from '../PipelineContext/PipelineContext'
import { DrawerTypes } from '../PipelineContext/PipelineActions'
import { RightDrawer } from '../RightDrawer/RightDrawer'
import css from './RightBar.module.scss'

interface CodebaseValues {
  connectorRef?: ConnectorReferenceFieldProps['selected']
  repoName?: string
  depth?: string
  sslVerify?: number
  prCloneStrategy?: MultiTypeSelectOption
  memoryLimit?: string
  cpuLimit?: string
}

enum CodebaseStatuses {
  ZeroState = 'zeroState',
  NotConfigured = 'notConfigured',
  Valid = 'valid',
  Invalid = 'invalid',
  Validating = 'validating'
}

export const prCloneStrategyOptions = [
  { label: 'Merge Commit', value: 'MergeCommit' },
  { label: 'Source Branch', value: 'SourceBranch' }
]

const sslVerifyOptions = [
  {
    label: 'True',
    value: 1
  },
  {
    label: 'False',
    value: 0
  }
]

const codebaseIcons: Record<CodebaseStatuses, IconName> = {
  [CodebaseStatuses.ZeroState]: 'codebase-zero-state',
  [CodebaseStatuses.NotConfigured]: 'codebase-not-configured',
  [CodebaseStatuses.Valid]: 'codebase-valid',
  [CodebaseStatuses.Invalid]: 'codebase-invalid',
  [CodebaseStatuses.Validating]: 'codebase-validating'
}

declare global {
  interface WindowEventMap {
    OPEN_PIPELINE_TEMPLATE_RIGHT_DRAWER: CustomEvent
  }
}

export function RightBar(): JSX.Element {
  const {
    state: {
      pipeline,
      pipelineView,
      isLoading,
      pipelineView: {
        drawerData: { type }
      },
      isUpdated
    },
    contextType,
    isReadonly,
    view,
    updatePipeline,
    updatePipelineView
  } = usePipelineContext()
  const codebase = pipeline?.properties?.ci?.codebase
  const [codebaseStatus, setCodebaseStatus] = React.useState<CodebaseStatuses>(CodebaseStatuses.ZeroState)
  const enableGovernanceSidebar = useFeatureFlag(FeatureFlag.OPA_PIPELINE_GOVERNANCE)

  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }>
  >()

  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const [isCodebaseDialogOpen, setIsCodebaseDialogOpen] = React.useState(false)
  const codebaseInitialValues: CodebaseValues = {
    repoName: codebase?.repoName,
    depth: codebase?.depth !== undefined ? String(codebase.depth) : undefined,
    sslVerify: codebase?.sslVerify !== undefined ? Number(codebase.sslVerify) : undefined,
    memoryLimit: codebase?.resources?.limits?.memory,
    prCloneStrategy:
      getMultiTypeFromValue(codebase?.prCloneStrategy) === MultiTypeInputType.FIXED
        ? prCloneStrategyOptions.find(option => option.value === codebase?.prCloneStrategy)
        : codebase?.prCloneStrategy,
    cpuLimit: codebase?.resources?.limits?.cpu
  }

  const isYaml = view === SelectedView.YAML
  const isPipelineTemplateContextType = contextType === PipelineContextType.PipelineTemplate

  const connectorId = getIdentifierFromValue((codebase?.connectorRef as string) || '')
  const initialScope = getScopeFromValue((codebase?.connectorRef as string) || '')

  const {
    data: connector,
    loading,
    refetch
  } = useGetConnector({
    identifier: connectorId,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined,
      ...(repoIdentifier && branch ? { repoIdentifier, branch, getDefaultFromOtherRepo: true } : {})
    },
    lazy: true,
    debounce: 300
  })

  const [connectionType, setConnectionType] = React.useState('')
  const [connectorUrl, setConnectorUrl] = React.useState('')

  if (connector?.data?.connector) {
    const scope = getScopeFromDTO<ConnectorInfoDTO>(connector?.data?.connector)
    codebaseInitialValues.connectorRef = {
      label: connector?.data?.connector.name || '',
      value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${connector?.data?.connector.identifier}`,
      scope: scope,
      live: connector?.data?.status?.status === 'SUCCESS',
      connector: connector?.data?.connector
    }
  }

  React.useEffect(() => {
    if (!isEmpty(codebase?.connectorRef)) {
      refetch()
    }
  }, [codebase?.connectorRef])

  React.useEffect(() => {
    if (connector?.data?.connector) {
      setConnectionType(
        connector?.data?.connector?.type === 'Git'
          ? connector?.data?.connector.spec.connectionType
          : connector?.data?.connector.spec.type
      )
      setConnectorUrl(connector?.data?.connector.spec.url)
    }
  }, [
    connector?.data?.connector,
    connector?.data?.connector?.spec.type,
    connector?.data?.connector?.spec.url,
    setConnectionType,
    setConnectorUrl
  ])

  React.useEffect(() => {
    if (!codebase?.connectorRef) {
      setCodebaseStatus(CodebaseStatuses.NotConfigured)
    } else {
      const validate = async () => {
        setCodebaseStatus(CodebaseStatuses.Validating)

        const connectorResult = await getConnectorPromise({
          identifier: connectorId,
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
            projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
          }
        })

        if (connectorResult?.data?.connector?.spec.type === 'Account') {
          try {
            const response = await getTestGitRepoConnectionResultPromise({
              identifier: connectorId,
              queryParams: {
                accountIdentifier: accountId,
                orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
                projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined,
                repoURL:
                  (connectorResult?.data?.connector?.spec.url[connectorResult?.data?.connector?.spec.url.length - 1] ===
                  '/'
                    ? connectorResult?.data?.connector?.spec.url
                    : connectorResult?.data?.connector?.spec.url + '/') + codebase?.repoName
              },
              body: undefined
            })

            if (response?.data?.status === 'SUCCESS') {
              setCodebaseStatus(CodebaseStatuses.Valid)
            } else {
              setCodebaseStatus(CodebaseStatuses.Invalid)
            }
          } catch (error) {
            setCodebaseStatus(CodebaseStatuses.Invalid)
          }
        } else {
          try {
            const response = await getTestConnectionResultPromise({
              identifier: connectorId,
              queryParams: {
                accountIdentifier: accountId,
                orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
                projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
              },
              body: undefined
            })

            if (response?.data?.status === 'SUCCESS') {
              setCodebaseStatus(CodebaseStatuses.Valid)
            } else {
              setCodebaseStatus(CodebaseStatuses.Invalid)
            }
          } catch (error) {
            setCodebaseStatus(CodebaseStatuses.Invalid)
          }
        }
      }

      validate()
    }
  }, [codebase?.connectorRef, codebase?.repoName])

  const openCodebaseDialog = React.useCallback(() => {
    setIsCodebaseDialogOpen(true)
  }, [setIsCodebaseDialogOpen])

  const closeCodebaseDialog = React.useCallback(() => {
    setIsCodebaseDialogOpen(false)

    if (!connector?.data?.connector?.spec.type && !connector?.data?.connector?.spec.url) {
      setConnectionType('')
      setConnectorUrl('')
    }
  }, [
    connector?.data?.connector?.spec.type,
    connector?.data?.connector?.spec.url,
    setIsCodebaseDialogOpen,
    setConnectionType,
    setConnectorUrl
  ])

  const { getString } = useStrings()

  const openVariablesPanel = () => {
    if (isPipelineTemplateContextType) {
      updatePipelineView({
        ...pipelineView,
        isSplitViewOpen: false,
        splitViewData: {}
      })
      window.dispatchEvent(
        new CustomEvent('OPEN_PIPELINE_TEMPLATE_RIGHT_DRAWER', { detail: DrawerTypes.PipelineVariables })
      )
    } else {
      updatePipelineView({
        ...pipelineView,
        isDrawerOpened: true,
        drawerData: { type: DrawerTypes.PipelineVariables },
        isSplitViewOpen: false,
        splitViewData: {}
      })
    }
  }

  const openTemplatesInputDrawer = () => {
    updatePipelineView({
      ...pipelineView,
      isSplitViewOpen: false,
      splitViewData: {}
    })
    window.dispatchEvent(new CustomEvent('OPEN_PIPELINE_TEMPLATE_RIGHT_DRAWER', { detail: DrawerTypes.TemplateInputs }))
  }

  if (isLoading) {
    return <div className={css.rightBar}></div>
  }

  return (
    <div className={css.rightBar}>
      {isPipelineTemplateContextType && (
        <Button
          className={cx(css.iconButton, { [css.selected]: type === DrawerTypes.TemplateInputs })}
          onClick={openTemplatesInputDrawer}
          variation={ButtonVariation.TERTIARY}
          font={{ weight: 'semi-bold', size: 'xsmall' }}
          icon="template-inputs"
          withoutCurrentColor={true}
          iconProps={{ size: 28 }}
          text={getString('pipeline.templateInputs')}
          data-testid="template-inputs"
          disabled={isUpdated}
        />
      )}
      <Button
        className={cx(css.iconButton, { [css.selected]: type === DrawerTypes.PipelineVariables })}
        onClick={openVariablesPanel}
        variation={ButtonVariation.TERTIARY}
        font={{ weight: 'semi-bold', size: 'xsmall' }}
        icon="pipeline-variables"
        withoutCurrentColor={true}
        iconProps={{ size: 28 }}
        text={getString('common.variables')}
        data-testid="input-variable"
      />
      {!pipeline.template && (
        <Button
          className={cx(css.iconButton, {
            [css.selected]: type === DrawerTypes.PipelineNotifications
          })}
          variation={ButtonVariation.TERTIARY}
          onClick={() => {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: true,
              drawerData: {
                type: DrawerTypes.PipelineNotifications
              },
              isSplitViewOpen: false,
              splitViewData: {}
            })
          }}
          font={{ weight: 'semi-bold', size: 'xsmall' }}
          icon="pipeline-deploy"
          iconProps={{ size: 24 }}
          text={getString('notifications.pipelineName')}
          withoutCurrentColor={true}
        />
      )}

      {!pipeline.template && (
        <Button
          className={cx(css.iconButton, {
            [css.selected]: type === DrawerTypes.FlowControl
          })}
          variation={ButtonVariation.TERTIARY}
          onClick={() => {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: true,
              drawerData: { type: DrawerTypes.FlowControl },
              isSplitViewOpen: false,
              splitViewData: {}
            })
          }}
          font={{ weight: 'semi-bold', size: 'xsmall' }}
          icon="settings"
          withoutCurrentColor={true}
          iconProps={{ size: 20 }}
          text={getString('pipeline.barriers.flowControl')}
        />
      )}

      {enableGovernanceSidebar && contextType === PipelineContextType.Pipeline && (
        <Button
          className={cx(css.iconButton, {
            [css.selected]: type === DrawerTypes.PolicySets
          })}
          text={getString('common.policy.policysets')}
          variation={ButtonVariation.TERTIARY}
          font={{ weight: 'semi-bold', size: 'xsmall' }}
          icon="governance"
          iconProps={{ size: 20 }}
          minimal
          withoutCurrentColor
          onClick={() => {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: true,
              drawerData: { type: DrawerTypes.PolicySets },
              isSplitViewOpen: false,
              splitViewData: {}
            })
          }}
        />
      )}

      {!pipeline.template && !isYaml && (
        <Button
          className={css.iconButton}
          text={getString('codebase')}
          variation={ButtonVariation.TERTIARY}
          font={{ weight: 'semi-bold', size: 'xsmall' }}
          icon={codebaseIcons[codebaseStatus]}
          iconProps={{ size: 20 }}
          minimal
          withoutCurrentColor
          onClick={() => {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: false,
              drawerData: { type: DrawerTypes.AddStep },
              isSplitViewOpen: false,
              splitViewData: {}
            })
            openCodebaseDialog()
          }}
        />
      )}

      {!pipeline.template && (
        <Button
          className={cx(css.iconButton, {
            [css.selected]: type === DrawerTypes.AdvancedOptions
          })}
          variation={ButtonVariation.TERTIARY}
          onClick={() => {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: true,
              drawerData: { type: DrawerTypes.AdvancedOptions },
              isSplitViewOpen: false,
              splitViewData: {}
            })
          }}
          font={{ weight: 'semi-bold', size: 'xsmall' }}
          icon="pipeline-advanced"
          withoutCurrentColor={true}
          iconProps={{ size: 24 }}
          text={getString('pipeline.advancedOptions')}
        />
      )}
      <div />
      {isCodebaseDialogOpen && (
        <Dialog
          isOpen={true}
          enforceFocus={false}
          title={
            codebaseStatus === CodebaseStatuses.NotConfigured
              ? getString('pipelineSteps.build.create.configureCodebase')
              : getString('pipeline.rightBar.editCodebaseConfiguration')
          }
          onClose={closeCodebaseDialog}
        >
          <Formik
            formName="rightBarForm"
            enableReinitialize
            initialValues={codebaseInitialValues}
            validationSchema={Yup.object().shape({
              connectorRef: Yup.mixed().required(getString('fieldRequired', { field: getString('connector') })),
              ...(connectionType === 'Account' && {
                repoName: Yup.string().required(getString('common.validation.repositoryName'))
              })
            })}
            validate={values => {
              const errors = {}
              if (getMultiTypeFromValue(values.depth) === MultiTypeInputType.FIXED) {
                try {
                  Yup.number()
                    .notRequired()
                    .integer(getString('pipeline.onlyPositiveInteger'))
                    .positive(getString('pipeline.onlyPositiveInteger'))
                    .typeError(getString('pipeline.onlyPositiveInteger'))
                    .validateSync(values.depth === '' ? undefined : values.depth)
                } catch (error) {
                  set(errors, 'depth', error.message)
                }
              }
              try {
                generateSchemaForLimitMemory({ getString }).validateSync(values.memoryLimit)
              } catch (error) {
                set(errors, 'memoryLimit', error.message)
              }
              try {
                generateSchemaForLimitCPU({ getString }).validateSync(values.cpuLimit)
              } catch (error) {
                set(errors, 'cpuLimit', error.message)
              }
              return errors
            }}
            onSubmit={(values): void => {
              const pipelineData = produce(pipeline, draft => {
                set(draft, 'properties.ci.codebase', {
                  connectorRef:
                    typeof values.connectorRef === 'string' ? values.connectorRef : values.connectorRef?.value,
                  ...(values.repoName && { repoName: values.repoName }),
                  build: RUNTIME_INPUT_VALUE
                })

                // Repo level connectors should not have repoName
                if (connectionType === 'Repo' && (draft as PipelineInfoConfig)?.properties?.ci?.codebase?.repoName) {
                  unset(draft, 'properties.ci.codebase.repoName')
                }

                if (get(draft, 'properties.ci.codebase.depth') !== values.depth) {
                  const depthValue =
                    getMultiTypeFromValue(values.depth) === MultiTypeInputType.FIXED
                      ? values.depth
                        ? Number.parseInt(values.depth)
                        : undefined
                      : values.depth
                  set(draft, 'properties.ci.codebase.depth', depthValue)
                }

                const sslVerifyVal = values.sslVerify === undefined ? values.sslVerify : !!values.sslVerify
                if (get(draft, 'properties.ci.codebase.sslVerify') !== sslVerifyVal) {
                  set(draft, 'properties.ci.codebase.sslVerify', sslVerifyVal)
                }

                if (get(draft, 'properties.ci.codebase.prCloneStrategy') !== values.prCloneStrategy) {
                  set(
                    draft,
                    'properties.ci.codebase.prCloneStrategy',
                    typeof values.prCloneStrategy === 'string' ? values.prCloneStrategy : values.prCloneStrategy?.value
                  )
                }

                if (get(draft, 'properties.ci.codebase.resources.limits.memory') !== values.memoryLimit) {
                  set(draft, 'properties.ci.codebase.resources.limits.memory', values.memoryLimit)
                }

                if (get(draft, 'properties.ci.codebase.resources.limits.cpu') !== values.cpuLimit) {
                  set(draft, 'properties.ci.codebase.resources.limits.cpu', values.cpuLimit)
                }
              })

              updatePipeline(pipelineData)

              closeCodebaseDialog()
            }}
          >
            {({ values, setFieldValue, submitForm, errors }) => (
              <>
                <div className={Classes.DIALOG_BODY}>
                  <FormikForm>
                    <ConnectorReferenceField
                      name="connectorRef"
                      type={['Git', 'Github', 'Gitlab', 'Bitbucket', 'Codecommit']}
                      selected={values.connectorRef}
                      width={460}
                      error={errors?.connectorRef}
                      label={getString('connector')}
                      placeholder={loading ? getString('loading') : getString('connectors.selectConnector')}
                      disabled={loading || isReadonly}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      onChange={(value, scope) => {
                        setConnectionType(value.type === 'Git' ? value.spec.connectionType : value.spec.type)
                        setConnectorUrl(value.spec.url)

                        setFieldValue('connectorRef', {
                          label: value.name || '',
                          value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${value.identifier}`,
                          scope: scope,
                          live: value?.status?.status === 'SUCCESS',
                          connector: value
                        })
                      }}
                      gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                    />
                    {connectionType === 'Repo' ? (
                      <>
                        <Text margin={{ bottom: 'xsmall' }}>{getString('common.repositoryName')}</Text>
                        <TextInput name="repoName" value={connectorUrl} style={{ flexGrow: 1 }} disabled />
                      </>
                    ) : (
                      <>
                        <FormInput.Text
                          label={getString('common.repositoryName')}
                          name="repoName"
                          style={{ flexGrow: 1 }}
                          disabled={isReadonly}
                        />
                        {connectorUrl.length > 0 ? (
                          <div className={css.predefinedValue}>
                            <Text lineClamp={1} width="460px">
                              {(connectorUrl[connectorUrl.length - 1] === '/' ? connectorUrl : connectorUrl + '/') +
                                (values.repoName ? values.repoName : '')}
                            </Text>
                          </div>
                        ) : null}
                      </>
                    )}
                    <Accordion>
                      <Accordion.Panel
                        id="advanced"
                        summary={
                          <Layout.Horizontal>
                            <Text font={{ weight: 'bold' }}>{getString('advancedTitle')}</Text>&nbsp;
                            <Text>{getString('common.optionalLabel')}</Text>
                          </Layout.Horizontal>
                        }
                        details={
                          <div>
                            <FormInput.Text
                              name="depth"
                              label={
                                <Text
                                  tooltipProps={{
                                    dataTooltipId: 'depth'
                                  }}
                                >
                                  {getString('pipeline.depth')}
                                </Text>
                              }
                              disabled={isReadonly}
                            />
                            <FormInput.Select
                              name="sslVerify"
                              label={
                                <Text
                                  tooltipProps={{
                                    dataTooltipId: 'sslVerify'
                                  }}
                                >
                                  {getString('pipeline.sslVerify')}
                                </Text>
                              }
                              items={sslVerifyOptions}
                              disabled={isReadonly}
                            />
                            <MultiTypeSelectField
                              name="prCloneStrategy"
                              label={
                                <Text margin={{ bottom: 'xsmall' }} tooltipProps={{ dataTooltipId: 'prCloneStrategy' }}>
                                  {getString('pipeline.ciCodebase.prCloneStrategy')}
                                </Text>
                              }
                              multiTypeInputProps={{
                                selectItems: prCloneStrategyOptions,
                                placeholder: 'Select',
                                disabled: isReadonly,
                                multiTypeInputProps: {
                                  selectProps: { addClearBtn: true, items: prCloneStrategyOptions },
                                  allowableTypes: [MultiTypeInputType.FIXED]
                                }
                              }}
                              configureOptionsProps={{ variableName: 'prCloneStrategy' }}
                              style={{ marginBottom: 'var(--spacing-medium)' }}
                            />
                            <Text margin={{ top: 'small' }} tooltipProps={{ dataTooltipId: 'setContainerResources' }}>
                              {getString('pipelineSteps.setContainerResources')}
                            </Text>
                            <Layout.Horizontal spacing="small">
                              <FormInput.Text
                                name="memoryLimit"
                                label={
                                  <Text margin={{ bottom: 'xsmall' }}>
                                    {getString('pipelineSteps.limitMemoryLabel')}
                                  </Text>
                                }
                                style={{ flex: 1 }}
                                disabled={isReadonly}
                              />
                              <FormInput.Text
                                name="cpuLimit"
                                label={
                                  <Text margin={{ bottom: 'xsmall' }}>{getString('pipelineSteps.limitCPULabel')}</Text>
                                }
                                style={{ flex: 1 }}
                                disabled={isReadonly}
                              />
                            </Layout.Horizontal>
                          </div>
                        }
                      />
                    </Accordion>
                  </FormikForm>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    text={getString('applyChanges')}
                    onClick={submitForm}
                    disabled={isReadonly}
                  />{' '}
                  &nbsp; &nbsp;
                  <Button
                    variation={ButtonVariation.TERTIARY}
                    text={getString('cancel')}
                    onClick={closeCodebaseDialog}
                  />
                </div>
              </>
            )}
          </Formik>
        </Dialog>
      )}
      <RightDrawer />
    </div>
  )
}
