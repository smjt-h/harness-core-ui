/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { PolicyStepFormData } from './PolicyStepTypes'
import BasePolicyStep from './BasePolicyStep'

/**
 * Spec
 * https://harness.atlassian.net/wiki/spaces/CDNG/pages/1203634286/Shell+Script
 */

interface PolicyStepWidgetProps {
  initialValues: PolicyStepFormData
  onUpdate?: (data: PolicyStepFormData) => void
  onChange?: (data: PolicyStepFormData) => void
  allowableTypes: MultiTypeInputType[]
  readonly?: boolean
  stepViewType?: StepViewType
  isNewStep?: boolean
}

export function PolicyStepWidget(
  {
    initialValues,
    onUpdate,
    onChange,
    allowableTypes,
    isNewStep = true,
    readonly,
    stepViewType
  }: PolicyStepWidgetProps,
  formikRef: StepFormikFowardRef
): JSX.Element {
  const { getString } = useStrings()

  const defaultSSHSchema = Yup.object().shape({
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      type: Yup.string().trim().required(getString('cd.entityTypeRequired')),
      policySets: Yup.array().min(1).required(getString('common.policy.customInputRequired'))
    }),
    ...getNameAndIdentifierSchema(getString, stepViewType)
  })

  const values: any = {
    ...initialValues
  }

  const validationSchema = defaultSSHSchema

  return (
    <Formik<PolicyStepFormData>
      onSubmit={submit => {
        onUpdate?.(submit)
      }}
      validate={formValues => {
        onChange?.(formValues)
      }}
      formName="policyStepForm"
      initialValues={values}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<PolicyStepFormData>) => {
        setFormikRef(formikRef, formik)
        return (
          <BasePolicyStep
            isNewStep={isNewStep}
            formik={formik}
            readonly={readonly}
            stepViewType={stepViewType}
            allowableTypes={allowableTypes}
          />
        )
      }}
    </Formik>
  )
}

export const PolicyStepWidgetWithRef = React.forwardRef(PolicyStepWidget)
