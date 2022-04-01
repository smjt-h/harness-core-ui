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
  Icon
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

import { getConnectorListV2Promise, ServerlessAwsLambdaInfrastructure } from 'services/cd-ng'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'

import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
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
import { getConnectorSchema } from '../PipelineStepsUtil'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ServerlessStep.module.scss'

const logger = loggerFor(ModuleName.CD)
type ServerlessAwsLambdaInfrastructureTemplate = { [key in keyof ServerlessAwsLambdaInfrastructure]: string }

function getValidationSchema(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    connectorRef: getConnectorSchema(getString),
    region: Yup.lazy((): Yup.Schema<unknown> => {
      return Yup.string().required(getString('validation.regionRequired'))
    }),
    stage: Yup.lazy((): Yup.Schema<unknown> => {
      return Yup.string().required(getString('cd.pipelineSteps.infraTab.stageIsRequired'))
    })
  })
}
interface ServerlessAwsLambdaSpecEditableProps {
  initialValues: ServerlessAwsLambdaInfrastructure
  onUpdate?: (data: ServerlessAwsLambdaInfrastructure) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: ServerlessAwsLambdaInfrastructureTemplate
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: ServerlessAwsLambdaInfrastructure
  allowableTypes: MultiTypeInputType[]
}

const ServerlessAwsLambdaSpecEditable: React.FC<ServerlessAwsLambdaSpecEditableProps> = ({
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

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
  }, [])

  return (
    <Layout.Vertical spacing="medium">
      <Formik<ServerlessAwsLambdaInfrastructure>
        formName="serverlessAWSInfra"
        initialValues={initialValues}
        validate={value => {
          const data: Partial<ServerlessAwsLambdaInfrastructure> = {
            connectorRef: undefined,
            region: value.region === '' ? undefined : value.region,
            stage: value.stage === '' ? undefined : value.stage
          }
          if (value.connectorRef) {
            data.connectorRef = (value.connectorRef as any)?.value || value.connectorRef
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
                    dataTooltipId: 'awsInfraConnector'
                  }}
                  multiTypeProps={{ expressions, allowableTypes }}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  width={450}
                  connectorLabelClass={css.connectorRef}
                  enableConfigureOptions={false}
                  style={{ marginBottom: 'var(--spacing-large)' }}
                  type={'Aws'}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                />
                {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.connectorRef as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Icon name={getIconByType('Aws')}></Icon>
                        <Text>{getString('pipelineSteps.awsConnectorLabel')}</Text>
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
                  name="region"
                  tooltipProps={{
                    dataTooltipId: 'awsRegion'
                  }}
                  className={css.inputWidth}
                  disabled={readonly}
                  placeholder={getString('cd.steps.serverless.regionPlaceholder')}
                  multiTextInputProps={{
                    expressions,
                    disabled: readonly,
                    allowableTypes
                  }}
                  label={getString('regionLabel')}
                />
                {getMultiTypeFromValue(formik.values.region) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.region}
                    type="String"
                    variableName="region"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('region', value)
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

const ServerlessAwsLambdaSpecInputForm: React.FC<ServerlessAwsLambdaSpecEditableProps & { path: string }> = ({
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
              dataTooltipId: 'awsInfraConnector'
            }}
            name={`${path}.connectorRef`}
            label={getString('connector')}
            enableConfigureOptions={false}
            placeholder={getString('connectors.selectConnector')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions }}
            type={'Aws'}
            setRefValue
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.region) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md, css.regionInputWrapper)}>
          <FormInput.MultiTextInput
            name={`${path}.region`}
            disabled={readonly}
            placeholder={getString('cd.steps.serverless.regionPlaceholder')}
            label={getString('regionLabel')}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
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

const ServerlessAwsLambdaInfrastructureSpecVariablesForm: React.FC<ServerlessAwsLambdaSpecEditableProps> = ({
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

interface ServerlessAwsLambdaInfrastructureSpecStep extends ServerlessAwsLambdaInfrastructure {
  name?: string
  identifier?: string
}

const ServerlessAwsConnectorRegex = /^.+infrastructure\.infrastructureDefinition\.spec\.connectorRef$/
export class ServerlessAwsLambdaSpec extends PipelineStep<ServerlessAwsLambdaInfrastructureSpecStep> {
  lastFetched: number
  protected type = StepType.ServerlessAwsLambda
  protected defaultValues: ServerlessAwsLambdaInfrastructure = { connectorRef: '', region: '', stage: '' }

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
      if (obj?.type === 'ServerlessAwsLambda') {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: { types: ['Aws'], filterType: 'Connector' }
        }).then(response => {
          return (
            response?.data?.content?.map(connector => ({
              label: getConnectorName(connector),
              insertText: getConnectorValue(connector),
              kind: CompletionItemKind.Field
            })) || /* istanbul ignore next */ []
          )
        })
      }
    }

    return Promise.resolve([])
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<ServerlessAwsLambdaInfrastructure>): FormikErrors<ServerlessAwsLambdaInfrastructure> {
    const errors: Partial<ServerlessAwsLambdaInfrastructureTemplate> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (
      isEmpty(data.connectorRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      errors.connectorRef = getString?.('fieldRequired', { field: getString('connector') })
    }
    /* istanbul ignore else */ if (
      getString &&
      getMultiTypeFromValue(template?.region) === MultiTypeInputType.RUNTIME
    ) {
      const region = Yup.object().shape({
        region: Yup.lazy((): Yup.Schema<unknown> => {
          return Yup.string().required(getString('regionLabel'))
        })
      })

      try {
        region.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
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

  renderStep(props: StepProps<ServerlessAwsLambdaInfrastructure>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, customStepProps, readonly, allowableTypes } = props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <ServerlessAwsLambdaSpecInputForm
          {...(customStepProps as ServerlessAwsLambdaSpecEditableProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <ServerlessAwsLambdaInfrastructureSpecVariablesForm
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          {...(customStepProps as ServerlessAwsLambdaSpecEditableProps)}
          initialValues={initialValues}
        />
      )
    }

    return (
      <ServerlessAwsLambdaSpecEditable
        onUpdate={onUpdate}
        readonly={readonly}
        stepViewType={stepViewType}
        {...(customStepProps as ServerlessAwsLambdaSpecEditableProps)}
        initialValues={initialValues}
        allowableTypes={allowableTypes}
      />
    )
  }
}
