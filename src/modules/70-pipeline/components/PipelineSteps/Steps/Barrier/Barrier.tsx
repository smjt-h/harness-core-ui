import React from 'react'
import {
  IconName,
  Formik,
  FormInput,
  Button,
  Layout,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { FormikProps, yupToFormErrors } from 'formik'
import { isEmpty } from 'lodash-es'
import { StepViewType } from '@pipeline/exports'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepElementConfig } from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useStrings, UseStringsReturn } from 'framework/exports'
import {
  DurationInputFieldForInputSet,
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { StepType } from '../../PipelineStepInterface'
import { PipelineStep, StepProps } from '../../PipelineStep'
import stepCss from '../Steps.module.scss'

type BarrierData = StepElementConfig

export interface BarrierVariableStepProps {
  initialValues: BarrierData
  stageIdentifier: string
  onUpdate?(data: BarrierData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: BarrierData
}

interface BarrierProps {
  initialValues: BarrierData
  onUpdate?: (data: BarrierData) => void
  stepViewType?: StepViewType
  inputSetData?: {
    template?: BarrierData
    path?: string
    readonly?: boolean
  }
}

function BarrierWidget(props: BarrierProps, formikRef: StepFormikFowardRef<BarrierData>): React.ReactElement {
  const { initialValues, onUpdate } = props
  const { getString } = useStrings()
  return (
    <>
      <Formik<BarrierData>
        onSubmit={(values: BarrierData) => {
          onUpdate?.(values)
        }}
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          name: Yup.string().required(getString('pipelineSteps.stepNameRequired')),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum'))
        })}
      >
        {(formik: FormikProps<BarrierData>) => {
          const { submitForm, values, setFieldValue } = formik
          setFormikRef(formikRef, formik)
          return (
            <>
              <>
                <FormInput.InputWithIdentifier inputLabel={getString('name')} />
                <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                  <FormMultiTypeDurationField
                    name="timeout"
                    label={getString('pipelineSteps.timeoutLabel')}
                    multiTypeDurationProps={{ enableConfigureOptions: false }}
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
                    />
                  )}
                </Layout.Horizontal>
              </>

              <div className={stepCss.actionsPanel}>
                <Button intent="primary" text={getString('submit')} onClick={submitForm} />
              </div>
            </>
          )
        }}
      </Formik>
    </>
  )
}

const BarrierInputStep: React.FC<BarrierProps> = ({ inputSetData }) => {
  const { getString } = useStrings()
  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <DurationInputFieldForInputSet
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
          disabled={inputSetData?.readonly}
        />
      )}
    </>
  )
}

const BarrierVariableStep: React.FC<BarrierVariableStepProps> = ({ variablesData, metadataMap, initialValues }) => {
  return <VariablesListTable data={variablesData.spec} originalData={initialValues.spec} metadataMap={metadataMap} />
}

const BarrierWidgetWithRef = React.forwardRef(BarrierWidget)
export class BarrierStep extends PipelineStep<BarrierData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  renderStep(props: StepProps<BarrierData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <BarrierInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <BarrierVariableStep
          {...(customStepProps as BarrierVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <BarrierWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        ref={formikRef}
      />
    )
  }
  validateInputSet(data: BarrierData, template: BarrierData, getString?: UseStringsReturn['getString']): object {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = {} as any
    if (isEmpty(data?.timeout) && getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      const timeout = Yup.object().shape({
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString?.('validation.timeout10SecMinimum'))
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

  protected type = StepType.Barrier
  protected stepName = 'Barrier'
  protected stepIcon: IconName = 'command-barrier'

  protected defaultValues: BarrierData = {
    identifier: '',
    timeout: '10m'
  }
}
