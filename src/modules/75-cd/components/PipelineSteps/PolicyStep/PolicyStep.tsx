/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, Color } from '@wings-software/uicore'
import type { FormikErrors } from 'formik'
import type { StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import type { StringsMap } from 'stringTypes'

import type { PolicyStepData, PolicyStepFormData } from './PolicyStepTypes'
import { PolicyStepWidgetWithRef } from './PolicyStepWidget'

export class PolicyStep extends PipelineStep<PolicyStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.Policy
  protected stepName = 'Configure Run Test Steps'
  // TODO: Change icon name
  protected stepIcon: IconName = 'command-shell-script'
  protected stepIconColor = Color.GREY_700
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.Policy'

  renderStep(props: StepProps<PolicyStepData>): JSX.Element {
    const { initialValues, onUpdate, onChange, allowableTypes, stepViewType, formikRef, isNewStep, readonly } = props

    return (
      <PolicyStepWidgetWithRef
        initialValues={this.getInitialValues(initialValues)}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        onChange={data => onChange?.(this.processFormData(data))}
        allowableTypes={allowableTypes}
        stepViewType={stepViewType}
        isNewStep={isNewStep}
        readonly={readonly}
        ref={formikRef}
      />
    )
  }

  validateInputSet(props: ValidateInputSetProps<PolicyStepData>): FormikErrors<PolicyStepData> {
    const errors: FormikErrors<PolicyStepData> = { ...(props as any) }

    return errors
  }

  protected defaultValues: PolicyStepData = {
    name: '',
    identifier: '',
    type: StepType.Policy,
    timeout: '10m',
    spec: {
      policySets: [],
      type: 'Custom',
      policySpec: {
        payload: ''
      }
    }
  }

  protected async getSecretsListForYaml(): Promise<CompletionItemInterface[]> {
    return new Promise(resolve => {
      resolve([])
    })
  }

  private getInitialValues(initialValues: PolicyStepData): PolicyStepFormData {
    return {
      ...initialValues
    }
  }

  processFormData(data: PolicyStepFormData): PolicyStepData {
    return {
      ...data
    }
  }
}
