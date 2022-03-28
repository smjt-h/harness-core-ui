/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
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
  SelectOption
} from '@wings-software/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { debounce, noop, isEmpty, get, defaultTo } from 'lodash-es'
import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { getConnectorListV2Promise } from 'services/cd-ng'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'

import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'

import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
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
import type { ServerlessAzureInfrastructure } from '@pipeline/utils/stageHelpers'
import { getConnectorSchema } from '../PipelineStepsUtil'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ServerlessAzure.module.scss'

const logger = loggerFor(ModuleName.CD)
type ServerlessAzureInfrastructureTemplate = { [key in keyof ServerlessAzureInfrastructure]: string }

function getValidationSchema(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    connectorRef: getConnectorSchema(getString),
    stage: Yup.lazy((value): Yup.Schema<unknown> => {
      /* istanbul ignore else */ if (typeof value === 'string') {
        return Yup.string().required(getString('common.stage'))
      }
      return Yup.object().test({
        test(valueObj: SelectOption): boolean | Yup.ValidationError {
          if (isEmpty(valueObj) || isEmpty(valueObj.value)) {
            return this.createError({ message: getString('fieldRequired', { field: getString('common.stage') }) })
          }
          return true
        }
      })
    })
  })
}
interface ServerlessAzureSpecEditableProps {
  initialValues: ServerlessAzureInfrastructure
  allValues?: ServerlessAzureInfrastructure
  onUpdate?: (data: ServerlessAzureInfrastructure) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: ServerlessAzureInfrastructureTemplate
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: ServerlessAzureInfrastructure
  allowableTypes: MultiTypeInputType[]
}

interface ServerlessAzureInfrastructureUI extends Omit<ServerlessAzureInfrastructure, 'cluster'> {
  cluster?: { label?: string; value?: string } | string | any
}

const ServerlessAzureSpecEditable: React.FC<ServerlessAzureSpecEditableProps> = ({
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
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()

  const getInitialValues = (): ServerlessAzureInfrastructureUI => {
    const values: ServerlessAzureInfrastructureUI = {
      ...initialValues
    }
    return values
  }

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
  }, [])

  return (
    <Layout.Vertical spacing="medium">
      <Formik<ServerlessAzureInfrastructureUI>
        formName="serverlessAWSInfra"
        initialValues={getInitialValues()}
        validate={value => {
          const data: Partial<ServerlessAzureInfrastructure> = {
            connectorRef: undefined,
            stage: value.stage === '' ? undefined : value.stage
          }
          /* istanbul ignore else */ if (value.connectorRef) {
            data.connectorRef = (value.connectorRef as any)?.value || /* istanbul ignore next */ value.connectorRef
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
                  tooltipProps={{
                    dataTooltipId: 'gcpInfraConnector'
                  }}
                  multiTypeProps={{ expressions, allowableTypes }}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  width={450}
                  connectorLabelClass={css.connectorRef}
                  enableConfigureOptions={false}
                  style={{ marginBottom: 'var(--spacing-large)' }}
                  type={'Gcp'}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                />
                {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.connectorRef as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Icon name={getIconByType('Gcp')}></Icon>
                        <Text>{getString('pipelineSteps.gcpConnectorLabel')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="connectorRef"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('connectorRef', value)
                    }}
                    isReadonly={readonly}
                    className={css.marginTop}
                  />
                )}
              </Layout.Horizontal>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTextInput
                  name="stage"
                  tooltipProps={{
                    dataTooltipId: 'awsStage'
                  }}
                  className={css.inputWidth}
                  label={getString('common.stage')}
                  placeholder={getString('cd.steps.serverless.stagePlaceholder')}
                  multiTextInputProps={{ expressions, textProps: { disabled: readonly }, allowableTypes }}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(formik.values.stage) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.stage as string}
                    type="String"
                    variableName="stage"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('stage', value)
                    }}
                    isReadonly={readonly}
                    className={css.marginTop}
                  />
                )}
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

const ServerlessAzureSpecInputForm: React.FC<ServerlessAzureSpecEditableProps & { path: string }> = ({
  template,
  readonly = false,
  path,
  allowableTypes
}) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="small">
      {getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            tooltipProps={{
              dataTooltipId: 'gcpInfraConnector'
            }}
            name={`${path}.connectorRef`}
            label={getString('connector')}
            enableConfigureOptions={false}
            placeholder={getString('connectors.selectConnector')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions }}
            type={'Gcp'}
            setRefValue
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.stage) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${path}.stage`}
            label={getString('common.stage')}
            disabled={readonly}
            multiTextInputProps={{
              allowableTypes,
              expressions
            }}
            placeholder={getString('cd.steps.serverless.stagePlaceholder')}
          />
        </div>
      )}
    </Layout.Vertical>
  )
}

const ServerlessAzureInfrastructureSpecVariablesForm: React.FC<ServerlessAzureSpecEditableProps> = ({
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

interface ServerlessAzureInfrastructureSpecStep extends ServerlessAzureInfrastructure {
  name?: string
  identifier?: string
}

const ServerlessAwsConnectorRegex = /^.+infrastructure\.infrastructureDefinition\.spec\.connectorRef$/
const KubernetesGcpType = 'KubernetesGcp'
export class ServerlessAzureSpec extends PipelineStep<ServerlessAzureInfrastructureSpecStep> {
  lastFetched: number
  protected type = StepType.ServerlessAzure
  protected defaultValues: ServerlessAzureInfrastructure = { connectorRef: '', stage: '' }

  protected stepIcon: IconName = 'service-aws'
  protected stepName = 'Specify your AWS connector'
  protected stepPaletteVisible = false
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.lastFetched = new Date().getTime()
    this.invocationMap.set(ServerlessAwsConnectorRegex, this.getConnectorsListForYaml.bind(this))
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
    } catch (err) {
      /* istanbul ignore next */ logger.error('Error while parsing the yaml', err)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.connectorRef', ''))
      if (obj?.type === KubernetesGcpType) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: { types: ['Gcp'], filterType: 'Connector' }
        }).then(response => {
          const data =
            response?.data?.content?.map(connector => ({
              label: getConnectorName(connector),
              insertText: getConnectorValue(connector),
              kind: CompletionItemKind.Field
            })) || /* istanbul ignore next */ []
          return data
        })
      }
    }

    return new Promise(resolve => {
      resolve([])
    })
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<ServerlessAzureInfrastructure>): FormikErrors<ServerlessAzureInfrastructure> {
    const errors: Partial<ServerlessAzureInfrastructureTemplate> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (
      isEmpty(data.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      errors.connectorRef = getString?.('fieldRequired', { field: getString('connector') })
    }
    /* istanbul ignore else */ if (getString && getMultiTypeFromValue(template?.stage) === MultiTypeInputType.RUNTIME) {
      const stage = Yup.object().shape({
        stage: Yup.lazy((): Yup.Schema<unknown> => {
          return Yup.string().required(getString('common.stage'))
        })
      })

      try {
        stage.validateSync(data)
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

  renderStep(props: StepProps<ServerlessAzureInfrastructure>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, customStepProps, readonly, allowableTypes } = props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <ServerlessAzureSpecInputForm
          {...(customStepProps as ServerlessAzureSpecEditableProps)}
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
        <ServerlessAzureInfrastructureSpecVariablesForm
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          {...(customStepProps as ServerlessAzureSpecEditableProps)}
          initialValues={initialValues}
        />
      )
    }

    return (
      <ServerlessAzureSpecEditable
        onUpdate={onUpdate}
        readonly={readonly}
        stepViewType={stepViewType}
        {...(customStepProps as ServerlessAzureSpecEditableProps)}
        initialValues={initialValues}
        allowableTypes={allowableTypes}
      />
    )
  }
}
