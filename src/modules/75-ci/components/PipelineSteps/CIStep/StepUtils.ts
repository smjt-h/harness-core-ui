/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import isEmpty from 'lodash/isEmpty'
import type { FormikErrors } from 'formik'
import { RUNTIME_INPUT_VALUE, MultiTypeInputType } from '@wings-software/uicore'
import type { UseFromStageInfraYaml } from 'services/ci'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { StringsMap } from 'stringTypes'
import type { BuildStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'

export const useGetPropagatedStageById = (
  stageId: string
): StageElementWrapper<BuildStageElementConfig> | undefined => {
  const { getStageFromPipeline } = usePipelineContext()

  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(stageId || '')

  const isPropagatedStage = !isEmpty((currentStage?.stage?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage)
  const { stage: propagatedStage } = getStageFromPipeline<BuildStageElementConfig>(
    (currentStage?.stage?.spec?.infrastructure as UseFromStageInfraYaml)?.useFromStage
  )
  return isPropagatedStage ? propagatedStage : currentStage
}

export const validateConnectorRefAndImageDepdendency = (
  connectorRef: string,
  image: string,
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): FormikErrors<any> => {
  const errors: FormikErrors<any> = {}
  if (connectorRef && !image) {
    errors['spec.image'] = getString('ci.buildInfa.awsVM.isRequiredWhen', {
      field1: getString('imageLabel'),
      field2: getString('pipelineSteps.connectorLabel')
    })
  } else if (!connectorRef && image) {
    errors['spec.connectorRef'] = getString('ci.buildInfa.awsVM.isRequiredWhen', {
      field2: getString('imageLabel'),
      field1: getString('pipelineSteps.connectorLabel')
    })
  }
  return errors
}

export const shouldRenderRunTimeInputView = (value: any): boolean => {
  if (value) {
    if (typeof value === 'object') {
      return Object.keys(value).some(
        key => typeof value[key] === 'string' && value[key].startsWith(RUNTIME_INPUT_VALUE)
      )
    } else {
      return typeof value === 'string' && value.startsWith(RUNTIME_INPUT_VALUE)
    }
  }
  return false
}

export const AllMultiTypeInputTypesForStep = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.EXPRESSION,
  MultiTypeInputType.RUNTIME
]

export const AllMultiTypeInputTypesForInputSet = [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
