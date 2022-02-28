/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import type { FormikProps } from 'formik'
import cx from 'classnames'

import { SelectOption, FormInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { FormMultiTypeTextAreaField } from '@common/components'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import type { PolicyStepFormData } from './PolicyStepTypes'
import PolicySetsFormField from './PolicySets/PolicySetsFormField/PolicySetsFormField'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './PolicyStep.module.scss'

export const entityTypeOptions: SelectOption[] = [{ label: 'Custom', value: 'Custom' }]

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
    formik: { errors },
    formik,
    isNewStep,
    readonly,
    stepViewType
  } = props

  const [entityType, setEntityType] = useState<string | number | symbol>('Custom')
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <>
      {stepViewType !== StepViewType.Template && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <NameId
            nameLabel={getString('pipelineSteps.stepNameLabel')}
            inputGroupProps={{ disabled: readonly }}
            identifierProps={{ isIdentifierEditable: isNewStep && !readonly }}
          />
        </div>
      )}
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormMultiTypeDurationField
          name="timeout"
          label={getString('pipelineSteps.timeoutLabel')}
          className={stepCss.duration}
          multiTypeDurationProps={{
            enableConfigureOptions: false,
            expressions,
            disabled: readonly
          }}
        />
      </div>
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.Select
          name="spec.type"
          label={getString('common.entityType')}
          disabled={readonly}
          onChange={/* istanbul ignore next */ option => setEntityType(option?.value)}
          items={entityTypeOptions}
        />
      </div>
      <PolicySetsFormField
        name="spec.policySets"
        disabled={readonly}
        formikProps={formik}
        error={errors?.spec?.policySets}
        stepViewType={stepViewType}
      />
      {entityType === 'Custom' && (
        <div className={cx(stepCss.formGroup)}>
          <FormMultiTypeTextAreaField
            name={`spec.policySpec.payload`}
            label={getString('common.payload')}
            placeholder={getString('common.payload')}
            disabled={readonly}
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
