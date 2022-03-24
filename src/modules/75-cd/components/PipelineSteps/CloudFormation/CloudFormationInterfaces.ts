/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import type { MultiTypeInputType } from '@harness/uicore'
import type { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { StepElementConfig } from 'services/cd-ng'

export const StoreTypes = {
  Inline: 'Inline',
  Remote: 'Remote'
}

export interface CreateStackData extends StepElementConfig {
  spec?: {
    provisionerIdentifier?: string
    timeout?: string
    configuration?: {
      awsRegion?: string
      awsCapabilities?: string
      stackName?: string
      tags?: {
        spec?: {
          content?: string
        }
      }
      template?: {
        type?: 'Inline' | 'Remote'
      }
    }
  }
}

export interface CreateStackProps<T = CreateStackData> {
  initialValues: T
  onUpdate?: (data: T) => void
  onChange?: (data: T) => void
  allowableTypes: MultiTypeInputType[]
  stepViewType?: StepViewType
  configTypes?: SelectOption[]
  isNewStep?: boolean
  inputSetData?: {
    template?: T
    path?: string
  }
  readonly?: boolean
  path?: string
  stepType?: string
  gitScope?: GitFilterScope
  allValues?: T
}
