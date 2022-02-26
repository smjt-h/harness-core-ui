/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'

import { getMultiTypeFromValue, MultiTypeInputType, SelectOption, FormInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { FormMultiTypeTextAreaField } from '@common/components'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import type { PolicyStepFormData } from './PolicyStepTypes'
import PolicySetsFormField from './PolicySets/PolicySetsFormField/PolicySetsFormField'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './PolicyStep.module.scss'

export const entityTypeOptions: SelectOption[] = [
  { label: 'Custom', value: 'Custom' }
  // { label: 'Pipeline', value: 'Pipeline' }
]

export enum PolicySetType {
  ACCOUNT = 'Account',
  ORG = 'Org',
  PROJECT = 'Project'
}

export default function BasePolicyStep(props: {
  formik: FormikProps<PolicyStepFormData>
  isNewStep: boolean
  readonly?: boolean
  stepViewType?: StepViewType
}): React.ReactElement {
  const {
    formik: { values: formValues, setFieldValue, errors },
    formik,
    isNewStep,
    readonly,
    stepViewType
  } = props
  const [entityType, setEntityType] = useState<string | number | symbol>('Custom')
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  useEffect(() => {
    const {
      spec: { type }
    } = formValues

    if (!isEmpty(type)) {
      setEntityType(type)
    }
  }, [])

  return (
    <>
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <NameId
          nameLabel={getString('pipelineSteps.stepNameLabel')}
          inputGroupProps={{ disabled: readonly }}
          identifierProps={{ isIdentifierEditable: isNewStep && !readonly }}
        />
      </div>
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormMultiTypeDurationField
          name="timeout"
          label={getString('pipelineSteps.timeoutLabel')}
          multiTypeDurationProps={{
            enableConfigureOptions: false,
            expressions,
            disabled: readonly
          }}
          className={stepCss.duration}
          disabled={readonly}
        />
        {getMultiTypeFromValue(formValues?.timeout) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues?.timeout as string}
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
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.Select
          items={entityTypeOptions}
          name="spec.type"
          label={getString('common.entityType')}
          placeholder={getString('common.entityType')}
          onChange={option => setEntityType(option?.value)}
        />
      </div>
      <PolicySetsFormField
        name="spec.policySets"
        formikProps={formik}
        error={errors?.spec?.policySets}
        stepViewType={stepViewType}
      />
      {entityType === 'Custom' && (
        <div className={cx(stepCss.formGroup)}>
          <FormMultiTypeTextAreaField
            name={`spec.policySpec.payload`}
            disabled={readonly}
            label={getString('pipeline.payload')}
            className={css.jexlExpression}
            multiTypeTextArea={{
              expressions
            }}
          />
        </div>
      )}
    </>
  )
}
