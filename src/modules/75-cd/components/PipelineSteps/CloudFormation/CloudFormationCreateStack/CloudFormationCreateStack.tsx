/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { forwardRef } from 'react'
import * as Yup from 'yup'
import { isEmpty, map, set } from 'lodash-es'
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
  protected stepIcon: IconName = 'cloud-formation-create'
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
        connectorRef: '',
        region: '',
        roleArn: '',
        parameters: [],
        templateFile: {
          type: 'Remote',
          spec: {}
        },
        parameterOverrides: [],
        skipOnStakStatuses: [],
        capabilities: []
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
    const awsConnRef = data.spec.configuration.connectorRef.value
    let templateFile = data.spec.configuration.templateFile

    if (data?.spec?.configuration?.templateFile?.type === 'Remote') {
      templateFile = {
        ...data.spec.configuration.templateFile,
        spec: {
          store: {
            spec: {
              ...data?.spec?.configuration?.templateFile?.spec?.store?.spec,
              connectorRef: data?.spec?.configuration?.templateFile?.spec?.store?.spec?.connectorRef?.value
            }
          }
        }
      }
    }
    if (!isEmpty(data.spec.configuration.parameters)) {
      const params = data.spec.configuration.parameters
      set(
        data,
        'spec.configuration.parameters',
        map(params, param => ({
          ...param,
          store: {
            ...param?.store,
            spec: {
              ...param.store.spec,
              connectorRef: param.store.spec.connectorRef?.value || param.store.spec.connectorRef
            }
          }
        }))
      )
    } else {
      delete data.spec.configuration.parameters
    }

    if (!isEmpty(data.spec.configuration?.skipBasedOnStackStatuses)) {
      const statuses = data.spec.configuration.parameters
      set(
        data,
        'spec.configuration.skipBasedOnStackStatuses',
        map(statuses, status => status.value)
      )
    } else {
      delete data.spec.configuration?.skipBasedOnStackStatuses
    }

    if (!isEmpty(data.spec.configuration?.capabilities)) {
      const capabilities = data.spec.configuration.capabilities
      set(
        data,
        'spec.configuration.capabilities',
        map(capabilities, status => status.value)
      )
    } else {
      delete data.spec.configuration?.capabilities
    }

    if (isEmpty(data.spec.configuration?.tags)) {
      delete data.spec.configuration?.tags
    }

    if (isEmpty(data.spec.configuration?.roleArn)) {
      delete data.spec.configuration?.roleArn
    }

    if (isEmpty(data.spec.configuration?.parameterOverrides)) {
      delete data.spec.configuration?.parameterOverrides
    }

    if (isEmpty(data.spec.configuration?.skipOnStackStatuses)) {
      delete data.spec.configuration?.skipOnStackStatuses
    }

    return {
      ...data,
      spec: {
        ...data.spec,
        configuration: {
          ...data.spec.configuration,
          connectorRef: awsConnRef,
          templateFile: templateFile
        }
      }
    }
  }

  private getInitialValues(data: any): any {
    const formData = {
      ...data,
      spec: {
        ...data?.spec,
        provisionerIdentifier: data?.spec?.provisionerIdentifier || '',
        configuration: {
          ...data?.spec?.configuration,
          connectorRef: data?.spec?.configuration?.connectorRef || '',
          capabilities: data?.spec?.configuration?.capabilities || [],
          parameterOverrides: data?.spec?.configuration?.parameterOverrides || [],
          parameters: data?.spec?.configuration?.parameters || [],
          region: data?.spec?.configuration?.region || '',
          roleArn: data?.spec?.configuration?.roleArn || '',
          skipOnStackStatuses: data?.spec?.configuration?.skipOnStackStatuses || [],
          stackName: data?.spec?.configuration?.stackName || '',
          tags: data?.spec?.configuration?.tags || '',
          templateFile: data?.spec?.configuration?.templateFile || {
            type: 'Remote',
            spec: {}
          }
        }
      }
    }
    return formData
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
        initialValues={this.getInitialValues(initialValues)}
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
