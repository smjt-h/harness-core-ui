/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'

import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { FormMultiTypeTextAreaField } from '@common/components'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import type { PolicyStepData } from './PolicyStepTypes'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './PolicyStep.module.scss'

export default function PolicyInputSetStep(props: {
  readonly?: boolean
  template?: PolicyStepData
  path?: string
}): React.ReactElement {
  const { readonly, template, path } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`

  return (
    <>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormMultiTypeDurationField
            name={`${prefix}timeout`}
            label={getString('pipelineSteps.timeoutLabel')}
            disabled={readonly}
            className={stepCss.duration}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              expressions,
              disabled: readonly
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.spec?.policySpec?.payload) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup)}>
          <FormMultiTypeTextAreaField
            name={`${prefix}spec.policySpec.payload`}
            label={getString('common.payload')}
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
