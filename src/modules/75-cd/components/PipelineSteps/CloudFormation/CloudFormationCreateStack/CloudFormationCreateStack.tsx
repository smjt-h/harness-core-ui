/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { forwardRef } from 'react'
import * as Yup from 'yup'
import { isEmpty, map, set } from 'lodash-es'
import { IconName, MultiTypeInputType, getMultiTypeFromValue, SelectOption } from '@harness/uicore'
import { yupToFormErrors, FormikErrors } from 'formik'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { CreateStackStepInfo, CreateStackData } from '../CloudFormationInterfaces'
import { CloudFormationCreateStack } from './CloudFormationCreateStackRef'
import CloudFormationCreateStackInputStep from '../InputSteps/CloudFormationInputStep'
const CloudFormationCreateStackWithRef = forwardRef(CloudFormationCreateStack)

export class CFCreateStack extends PipelineStep<CreateStackStepInfo> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.CloudFormationCreateStack
  protected stepIcon: IconName = 'cloud-formation-create'
  protected stepName = 'Cloud Formation Create Stack'

  protected defaultValues: CreateStackStepInfo = {
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
        skipOnStackStatuses: [],
        capabilities: []
      }
    }
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<CreateStackStepInfo>): FormikErrors<CreateStackStepInfo> {
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
  /* istanbul ignore next */
  processFormData(data: any): CreateStackStepInfo {
    const awsConnRef = data.spec.configuration.connectorRef?.value || data.spec.configuration.connectorRef
    let templateFile = data.spec.configuration.templateFile

    if (data?.spec?.configuration?.templateFile?.type === 'Remote') {
      const connectorRef =
        data?.spec?.configuration?.templateFile?.spec?.store?.spec?.connectorRef?.value ||
        data?.spec?.configuration?.templateFile?.spec?.store?.spec?.connectorRef
      templateFile = {
        ...data.spec.configuration.templateFile,
        spec: {
          store: {
            ...data.spec.configuration.templateFile?.spec?.store,
            spec: {
              ...data?.spec?.configuration?.templateFile?.spec?.store?.spec,
              connectorRef
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
        map(params, param => {
          return {
            ...param,
            store: {
              ...param?.store,
              spec: {
                ...param?.store?.spec,
                connectorRef: param.store.spec.connectorRef?.value || param.store.spec.connectorRef,
                ...(param?.store?.spec?.region
                  ? { urls: param?.store?.spec?.paths || param?.store?.spec?.urls }
                  : { paths: param?.store?.spec?.paths })
              }
            }
          }
        })
      )
    } else {
      delete data.spec.configuration.parameters
    }

    if (!isEmpty(data?.spec?.configuration?.skipOnStackStatuses)) {
      let statuses = data?.spec?.configuration?.skipOnStackStatuses
      if (getMultiTypeFromValue(statuses) === MultiTypeInputType.FIXED) {
        statuses = map(statuses, status => status?.value || status)
      }
      set(data, 'spec.configuration.skipOnStackStatuses', statuses)
    }

    if (!isEmpty(data?.spec?.configuration?.capabilities)) {
      let capabilities = data.spec.configuration.capabilities
      if (getMultiTypeFromValue(capabilities) === MultiTypeInputType.FIXED) {
        capabilities = map(capabilities, cap => cap?.value || cap)
      }
      set(data, 'spec.configuration.capabilities', capabilities)
    }

    if (isEmpty(data.spec.configuration?.roleArn)) {
      delete data.spec.configuration?.roleArn
    }

    if (!isEmpty(data.spec.configuration?.parameterOverrides)) {
      set(
        data,
        'spec.configuration.parameterOverrides',
        map(data.spec.configuration?.parameterOverrides, ({ name, value }) => ({ name, value, type: 'String' }))
      )
    } else {
      delete data.spec.configuration?.parameterOverrides
    }

    if (!isEmpty(data.spec.configuration?.tags)) {
      set(data, 'spec.configuration.tags.type', 'Inline')
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

  private getInitialValues(data: CreateStackStepInfo): CreateStackData {
    let capabilities, skipOnStackStatuses: string | string[] | SelectOption[] | string | undefined
    capabilities = data?.spec?.configuration?.capabilities
    if (getMultiTypeFromValue(capabilities) === MultiTypeInputType.FIXED) {
      capabilities = map(data?.spec?.configuration?.capabilities, item => ({ label: item, value: item }))
    }
    skipOnStackStatuses = data?.spec?.configuration?.skipOnStackStatuses
    if (getMultiTypeFromValue(skipOnStackStatuses) === MultiTypeInputType.FIXED) {
      skipOnStackStatuses = map(data?.spec?.configuration?.skipOnStackStatuses, item => ({ label: item, value: item }))
    }
    const formData = {
      ...data,
      spec: {
        ...data?.spec,
        provisionerIdentifier: data?.spec?.provisionerIdentifier || '',
        configuration: {
          ...data?.spec?.configuration,
          connectorRef: data?.spec?.configuration?.connectorRef || '',
          capabilities,
          parameterOverrides: data?.spec?.configuration?.parameterOverrides || [],
          parameters:
            map(data?.spec?.configuration?.parameters, param => {
              return {
                ...param,
                store: {
                  ...param?.store,
                  spec: {
                    ...param?.store?.spec,
                    connectorRef: param.store.spec.connectorRef,
                    ...(param?.store?.spec?.region
                      ? { urls: param?.store?.spec?.urls }
                      : { paths: param?.store?.spec?.paths })
                  }
                }
              }
            }) || [],
          region: data?.spec?.configuration?.region || '',
          roleArn: data?.spec?.configuration?.roleArn || '',
          skipOnStackStatuses,
          stackName: data?.spec?.configuration?.stackName || '',
          tags: data?.spec?.configuration?.tags,
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
    const {
      initialValues,
      onUpdate,
      onChange,
      allowableTypes,
      stepViewType,
      formikRef,
      isNewStep,
      readonly,
      inputSetData,
      path
    } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <CloudFormationCreateStackInputStep
          initialValues={initialValues}
          onUpdate={data => onUpdate?.(this.processFormData(data))}
          onChange={data => onChange?.(this.processFormData(data))}
          allowableTypes={allowableTypes}
          allValues={inputSetData?.allValues}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
          inputSetData={inputSetData}
          path={path}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return <></>
    }

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
