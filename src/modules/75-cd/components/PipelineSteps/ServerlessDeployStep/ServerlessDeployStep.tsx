/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, Formik, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import cx from 'classnames'
import * as Yup from 'yup'

import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'
import { isEmpty } from 'lodash-es'
import {
  StepViewType,
  StepProps,
  ValidateInputSetProps,
  setFormikRef,
  StepFormikFowardRef,
  InputSetData
} from '@pipeline/components/AbstractSteps/Step'
import type { StepElementConfig } from 'services/cd-ng'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { StringsMap } from 'framework/strings/StringsContext'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { ServerlessDeployCommandOptions } from './ServerlessDeployCommandOptions'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface ServerlessAwsLambdaDeployProps {
  initialValues: StepElementConfig
  onUpdate?: (data: StepElementConfig) => void
  stepViewType?: StepViewType
  onChange?: (data: StepElementConfig) => void
  allowableTypes: MultiTypeInputType[]
  readonly?: boolean
  isNewStep?: boolean
  inputSetData: {
    template?: StepElementConfig
    path?: string
    readonly?: boolean
  }
}

function ServerlessAwsLambdaDeployWidget(
  props: ServerlessAwsLambdaDeployProps,
  formikRef: StepFormikFowardRef<StepElementConfig>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep = true, readonly, onChange, allowableTypes, stepViewType } = props
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  return (
    <>
      <Formik<StepElementConfig>
        onSubmit={(values: StepElementConfig) => {
          onUpdate?.(values)
        }}
        formName="ServerlessAwsLambdaDeploy"
        initialValues={initialValues}
        validate={data => {
          onChange?.(data)
        }}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<StepElementConfig>) => {
          setFormikRef(formikRef, formik)
          const { values, setFieldValue } = formik
          return (
            <>
              {stepViewType !== StepViewType.Template && (
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormInput.InputWithIdentifier
                    inputLabel={getString('name')}
                    isIdentifierEditable={isNewStep && !readonly}
                    inputGroupProps={{
                      placeholder: getString('pipeline.stepNamePlaceholder'),
                      disabled: readonly
                    }}
                  />
                </div>
              )}

              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormMultiTypeDurationField
                  name="timeout"
                  label={getString('pipelineSteps.timeoutLabel')}
                  multiTypeDurationProps={{
                    enableConfigureOptions: false,
                    expressions,
                    disabled: readonly,
                    allowableTypes
                  }}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(values.timeout) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={values.timeout as string}
                    type="String"
                    variableName="step.timeout"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      setFieldValue('timeout', value)
                    }}
                    isReadonly={readonly}
                  />
                )}
              </div>
              <div className={stepCss.divider} />

              <ServerlessDeployCommandOptions isReadonly={readonly} stepViewType={props.stepViewType} />
            </>
          )
        }}
      </Formik>
    </>
  )
}

const ServerlessAwsLambdaDeployInputStep: React.FC<ServerlessAwsLambdaDeployProps> = ({
  inputSetData,
  allowableTypes,
  stepViewType
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      {getMultiTypeFromValue(inputSetData.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeDurationField
            name={`${isEmpty(inputSetData.path) ? '' : `${inputSetData.path}.`}timeout`}
            label={getString('pipelineSteps.timeoutLabel')}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: inputSetData.readonly
            }}
            disabled={inputSetData.readonly}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData.template?.spec?.commandOptions) === MultiTypeInputType.RUNTIME && (
        <ServerlessDeployCommandOptions
          isReadonly={inputSetData.readonly}
          inputSetData={inputSetData}
          stepViewType={stepViewType}
        />
      )}
    </>
  )
}
export interface ServerlessAwsLambdaDeployVariableStepProps {
  initialValues: StepElementConfig
  stageIdentifier: string
  onUpdate?(data: StepElementConfig): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: StepElementConfig
}

const ServerlessAwsLambdaDeployVariableStep: React.FC<ServerlessAwsLambdaDeployVariableStepProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => {
  return (
    <VariablesListTable
      className={pipelineVariableCss.variablePaddingL3}
      data={variablesData.spec}
      originalData={initialValues.spec}
      metadataMap={metadataMap}
    />
  )
}

const ServerlessAwsLambdaDeployRef = React.forwardRef(ServerlessAwsLambdaDeployWidget)

export class ServerlessAwsLambdaDeployStep extends PipelineStep<StepElementConfig> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  renderStep(props: StepProps<StepElementConfig>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      allowableTypes,
      onChange
    } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <ServerlessAwsLambdaDeployInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          allowableTypes={allowableTypes}
          stepViewType={stepViewType}
          inputSetData={inputSetData as InputSetData<StepElementConfig>}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <ServerlessAwsLambdaDeployVariableStep
          {...(customStepProps as ServerlessAwsLambdaDeployVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <ServerlessAwsLambdaDeployRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={stepViewType}
        ref={formikRef}
        readonly={readonly}
        inputSetData={inputSetData as InputSetData<StepElementConfig>}
      />
    )
  }
  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<StepElementConfig>): FormikErrors<StepElementConfig> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = { spec: {} } as any
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      if (isRequired) {
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
      })

      try {
        timeout.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    /* istanbul ignore else */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }

  protected type = StepType.ServerlessAwsLambdaDeploy
  protected stepName = 'Serverless Deploy Step'
  protected stepIcon: IconName = 'serverless-deploy-step'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.ServerlessAwsLambdaDeploy'
  protected isHarnessSpecific = true

  protected defaultValues: StepElementConfig = {
    identifier: '',
    name: '',
    type: StepType.ServerlessAwsLambdaDeploy,
    timeout: '10m',
    spec: {
      commandOptions: ''
    }
  }
}
