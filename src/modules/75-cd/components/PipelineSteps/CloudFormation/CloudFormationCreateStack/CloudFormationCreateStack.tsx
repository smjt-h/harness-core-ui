/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName, MultiTypeInputType } from '@wings-software/uicore'
import type { FormikErrors } from 'formik'
import type { StepViewType, StepProps } from '@pipeline/components/AbstractSteps/Step'
import type { ExecutionElementConfig } from 'services/cd-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { CloudFormationCreateStack } from './CloudFormationCreateStackRef'

export type ProvisionersOptions = 'CLOUD_FORMATION'
export interface CloudFormationData {
  provisioner: ExecutionElementConfig
  originalProvisioner?: Partial<ExecutionElementConfig>
  provisionerEnabled: boolean
  provisionerSnippetLoading?: boolean
  selectedProvisioner?: ProvisionersOptions
}

export interface CloudFormationDataUI extends Omit<CloudFormationData, 'provisioner'> {
  provisioner: {
    stage: {
      spec: {
        execution: ExecutionElementConfig
      }
    }
  }
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
  protected defaultValues: any = {}

  protected stepIcon: IconName = 'cloudformation'
  protected stepName = 'Cloud Formation Create Stack'

  validateInputSet(): FormikErrors<any> {
    return {}
  }

  renderStep(props: StepProps<any>): JSX.Element {
    window.console.log('props: ', props)
    const { initialValues, onUpdate, onChange, allowableTypes, stepViewType, formikRef, isNewStep } = props

    return (
      <CloudFormationCreateStack
        initialValues={initialValues}
        onUpdate={(data: any) => onUpdate?.(this.processFormData(data))}
        onChange={(data: any) => onChange?.(this.processFormData(data))}
        allowableTypes={allowableTypes}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        ref={formikRef}
        stepType={StepType.TerraformPlan}
        readonly={props.readonly}
      />
    )
  }
}
