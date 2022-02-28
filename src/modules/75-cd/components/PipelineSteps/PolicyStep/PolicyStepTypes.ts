/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StepElementConfig, StepSpecType } from 'services/cd-ng'

export enum PolicySetType {
  ACCOUNT = 'Account',
  ORG = 'Org',
  PROJECT = 'Project'
}

export interface PolicyStepData extends StepElementConfig {
  spec: PolicyStepInfo
}

export interface PolicyStepFormData extends StepElementConfig {
  spec: PolicyStepInfo
}

type PolicyStepInfo = StepSpecType & {
  type: string
  policySets?: string[]
  policySpec?: PolicySpec
}

interface PolicySpec {
  payload?: string
}
