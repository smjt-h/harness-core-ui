/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { forwardRef } from 'react'
import * as Yup from 'yup'
import { isEmpty } from 'lodash-es'
import { IconName, MultiTypeInputType, getMultiTypeFromValue } from '@harness/uicore'
import { yupToFormErrors, FormikErrors } from 'formik'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import type { ExecutionElementConfig } from 'services/cd-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import {} from '../CloudFormationInterfaces'
import { CloudFormationCreateStack } from './CloudFormationCreateStackRef'

const CloudFormationCreateStackWithRef = forwardRef(CloudFormationCreateStack)

export type ProvisionersOptions = 'CLOUD_FORMATION'
export interface CloudFormationData {
  provisioner: ExecutionElementConfig
  originalProvisioner?: Partial<ExecutionElementConfig>
  provisionerEnabled: boolean
  provisionerSnippetLoading?: boolean
  selectedProvisioner?: ProvisionersOptions
}
export interface CloudFormationProps {
  initialValues: CloudFormationData
  template?: CloudFormationData
  path?: string
  readonly?: boolean
  stepViewType?: StepViewType
  onUpdate?: (data: CloudFormationData) => void
  onChange?: (data: CloudFormationData) => void
  allowableTypes: MultiTypeInputType[]
}

export class CFCreateStack extends PipelineStep<any> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.CloudFormationCreateStack
  protected stepIcon: IconName = 'cloudformation'
  protected stepName = 'Cloud Formation Create Stack'

  protected defaultValues = {
    type: StepType.CloudFormationCreateStack,
    name: '',
    identifier: '',
    timeout: '10m',
    spec: {
      provisionerIdentifier: '',
      configuration: {
        stackName: '',
        awsConnectorRef: '',
        awsRegion: '',
        parameters: {},
        templateFile: {
          type: '',
          spec: {}
        }
      }
    }
  }

  validateInputSet({ data, template, getString, viewType }: ValidateInputSetProps<any>): FormikErrors<any> {
    /* istanbul ignore next */
    const errors = {} as any
    /* istanbul ignore next */
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    /* istanbul ignore next */
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      /* istanbul ignore next */
      if (isRequired) {
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
      })
      /* istanbul ignore next */
      try {
        timeout.validateSync(data)
      } /* istanbul ignore next */ catch (e) {
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    /* istanbul ignore next */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }
    return errors
  }

  // private getInitialValues(data: any) {
  //   return data
  // }

  processFormData(data: any) {
    const awsConnRef = data.spec.configuration.awsConnectorRef.value
    return {
      ...data,
      spec: {
        ...data.spec,
        configuration: {
          ...data.spec.configuration,
          awsConnectorRef: awsConnRef,
          templateFile: {
            ...data.spec.configuration.templateFile
          }
        }
      }
    }
  }

  renderStep(props: StepProps<any, unknown>): JSX.Element {
    const { initialValues, onUpdate, onChange, allowableTypes, stepViewType, formikRef, isNewStep, readonly } = props

    // if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
    //   return (
    //     <TerraformInputStep
    //       initialValues={initialValues}
    //       onUpdate={onUpdate}
    //       allValues={inputSetData?.allValues}
    //       stepViewType={stepViewType}
    //       readonly={inputSetData?.readonly}
    //       inputSetData={inputSetData}
    //       path={inputSetData?.path}
    //       allowableTypes={allowableTypes}
    //     />
    //   )
    // } else if (stepViewType === StepViewType.InputVariable) {
    //   return ()
    // }

    return (
      <CloudFormationCreateStackWithRef
        initialValues={initialValues}
        onUpdate={(data: any) => onUpdate?.(this.processFormData(data))}
        onChange={(data: any) => onChange?.(this.processFormData(data))}
        allowableTypes={allowableTypes}
        isNewStep={isNewStep}
        ref={formikRef}
        readonly={readonly}
        stepViewType={stepViewType}
      />
    )
  }
}
